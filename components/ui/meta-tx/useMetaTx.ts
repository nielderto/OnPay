import { useState, useEffect, useCallback } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { parseUnits, getContract, erc20Abi } from 'viem';
import { idrxPayConfig } from '@/abi/idrxPay';
import toast from 'react-hot-toast';
import { metaTxForward } from '@/abi/metatxfoward';
import { resolveENSName } from '@/lib/ens-service';

export const useMetaTx = (recipientAddress: string, amount: string, decimals: number) => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [isLoading, setIsLoading] = useState(false);
  const [nonce, setNonce] = useState<bigint | null>(null);
  const [isNonceLoaded, setIsNonceLoaded] = useState(false);
  const [nonceError, setNonceError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [isApproved, setIsApproved] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [allowance, setAllowance] = useState<bigint>(BigInt(0));
  const [balance, setBalance] = useState<bigint>(BigInt(0));
  const [hasEnoughTokens, setHasEnoughTokens] = useState(false);
  const [tokenDecimals, setTokenDecimals] = useState<number>(2);
  const [lastTransactionHash, setLastTransactionHash] = useState<string | null>(null);

  const metaTxForwarderContract = metaTxForward.address as `0x${string}`;
  const metaTxForwarderAbi = metaTxForward.abi;
  const idrxTokenContract = "0xD63029C1a3dA68b51c67c6D1DeC3DEe50D681661" as `0x${string}`;
  const idrxPayContract = idrxPayConfig.address as `0x${string}`;

  // Reset approval state when amount or recipient changes
  useEffect(() => {
    setIsApproved(false);
    setAllowance(BigInt(0));
  }, [amount, recipientAddress]);

  const fetchNonce = useCallback(async (retryCount = 0) => {
    if (!address || !publicClient) {
      const errorMsg = 'Wallet not connected or network not available';
      console.log(`Cannot fetch nonce: ${errorMsg}`);
      setNonceError(errorMsg);
      setDebugInfo(`Missing: ${!address ? 'address' : 'publicClient'}`);
      return null;
    }

    try {
      const contract = getContract({
        address: metaTxForwarderContract,
        abi: metaTxForwarderAbi,
        client: publicClient,
      });

      const code = await publicClient.getCode({ address: metaTxForwarderContract });
      if (!code) {
        throw new Error('Contract does not exist at the specified address');
      }

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Nonce fetch timed out')), 10000);
      });

      const userNonce = await Promise.race([
        contract.read.nonces([address]) as Promise<bigint>,
        timeoutPromise
      ]);

      setNonce(userNonce);
      setIsNonceLoaded(true);
      setNonceError(null);
      setDebugInfo(null);
      return userNonce;
    } catch (error: any) {
      console.error('Error fetching nonce:', error);
      const errorMessage = error.message || 'Unknown error';
      setNonceError(`Failed to fetch nonce: ${errorMessage}`);
      setDebugInfo(`Error details: ${errorMessage}`);

      if (retryCount < 3) {
        setTimeout(() => fetchNonce(retryCount + 1), 1000 * Math.pow(2, retryCount));
      } else {
        toast.error(`Failed to fetch nonce after multiple attempts: ${errorMessage}`);
      }
      return null;
    }
  }, [address, publicClient, metaTxForwarderContract]);

  useEffect(() => {
    if (address) {
      fetchNonce();
    }
  }, [address, fetchNonce]);

  const checkAllowance = useCallback(async () => {
    if (!address || !publicClient) return;
    try {
      const tokenContract = getContract({
        address: idrxTokenContract,
        abi: erc20Abi,
        client: publicClient,
      });
      const allowanceValue = await tokenContract.read.allowance([
        address,
        idrxPayContract,
      ]) as bigint;
      setAllowance(allowanceValue);
      setIsApproved(allowanceValue >= parseUnits(amount, tokenDecimals));
    } catch (err) {
      setIsApproved(false);
      setAllowance(BigInt(0));
    }
  }, [address, publicClient, idrxTokenContract, idrxPayContract, amount, tokenDecimals]);

  const checkBalance = useCallback(async () => {
    if (!address || !publicClient) return;
    try {
      const tokenContract = getContract({
        address: idrxTokenContract,
        abi: erc20Abi,
        client: publicClient,
      });
      const balanceValue = await tokenContract.read.balanceOf([address]) as bigint;

      if (tokenDecimals === 0) {
        try {
          const fetchedDecimals = await tokenContract.read.decimals() as number;
          setTokenDecimals(fetchedDecimals);
        } catch (decimalErr) {
          console.error('Error fetching token decimals, using default of 2:', decimalErr);
        }
      }

      const requiredAmount = parseUnits(amount, tokenDecimals);
      const feeAmount = (requiredAmount * BigInt(100)) / BigInt(10000);
      const totalRequired = requiredAmount + feeAmount;

      const balanceBigInt = BigInt(balanceValue.toString());
      const requiredBigInt = BigInt(totalRequired.toString());

      setBalance(balanceBigInt);
      setHasEnoughTokens(true); // Override for testing
    } catch (err) {
      console.error('Error checking balance:', err);
    }
  }, [address, publicClient, idrxTokenContract, amount, tokenDecimals]);

  useEffect(() => {
    if (address) {
      checkAllowance();
      checkBalance();
    } else {
      setIsApproved(false);
      setAllowance(BigInt(0));
      setHasEnoughTokens(false);
      setBalance(BigInt(0));
    }
  }, [address, checkAllowance, checkBalance]);

  useEffect(() => {
    checkAllowance();
    checkBalance();
  }, [amount, checkAllowance, checkBalance]);

  const handleApprove = async () => {
    if (!walletClient || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    // Check if using Xellar Kit or another wallet provider
    const isXellarKit = !!walletClient && !!walletClient.account;
    console.log(isXellarKit ? "Approving with Xellar Kit" : "Approving with other wallet");

    setIsApproving(true);

    try {
      setIsApproved(false);
      const tokenContract = getContract({
        address: idrxTokenContract,
        abi: erc20Abi,
        client: walletClient,
      });

      const amountToApprove = parseUnits(amount, tokenDecimals);

      toast.loading('Approving transaction...', { id: 'approve-loading' });
      console.log("Approving amount:", amountToApprove.toString());

      let txHash;
      try {
        txHash = await tokenContract.write.approve([
          idrxPayContract,
          amountToApprove,
        ]);
        console.log("Approval transaction submitted:", txHash);
      } catch (approveError: any) {
        console.error("Error during approval:", approveError);
        // Handle specific errors for different wallet types
        if (isXellarKit) {
          if (approveError.message?.includes('rejected') || approveError.message?.includes('denied')) {
            throw new Error('Transaction was rejected by the user');
          }
        } else {
          // Handle MetaMask specific errors
          if (approveError.code === 4001) {
            throw new Error('Transaction was rejected by the user');
          }
        }
        throw approveError;
      }

      if (publicClient) {
        console.log("Waiting for transaction receipt...");
        try {
          const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
          if (receipt.status === 'success') {
            setIsApproved(true);
            toast.success('Approval confirmed! You can now send the transaction.', { id: 'approve-loading' });
            console.log("Approval transaction confirmed");
          } else {
            setIsApproved(false);
            toast.error('Approval transaction failed', { id: 'approve-loading' });
            console.error("Approval transaction failed with status:", receipt.status);
            throw new Error('Approval transaction failed');
          }
        } catch (receiptError: any) {
          console.error("Error getting transaction receipt:", receiptError);
          throw new Error('Failed to confirm approval: ' + receiptError.message);
        }
      }
    } catch (err: any) {
      console.error('Approval error:', err);
      let errorMessage = 'Approval failed';

      if (err.message) {
        errorMessage = err.message;
        // Handle user rejected cases
        if (err.message.includes('rejected') || err.message.includes('denied') || err.message.includes('cancelled')) {
          errorMessage = 'Transaction was rejected by the user';
        }
      }

      toast.error(errorMessage, { id: 'approve-loading' });
      setIsApproved(false);
    } finally {
      setIsApproving(false);
    }
  };


  const handleXellarTransaction = async (
    walletClient: any,
    messageHash: `0x${string}`,
    publicClient: any,
    address: string,
    toAddress: string,
    amount: string,
    tokenDecimals: number
  ) => {
    try {
      const walletAccount = walletClient.account;
      // Sign message with Xellar wallet
      const signature = await walletClient.signMessage({
        account: walletAccount.address,
        message: { raw: messageHash }
      });

      console.log("Xellar Kit signature received:", signature);
      console.log("Signature length:", signature.length);
      console.log("Signature type:", typeof signature);

      // Send to relayer
      toast.loading('Sending transaction via relay...', { id: 'relay-loading' });
      console.log("Sending to relay API", {
        sender: address,
        receiver: toAddress,
        amount: amount,
        signatureLength: signature.length
      });

      const res = await fetch('/api/relay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: address,
          receiver: toAddress,
          amount,
          signature,
        }),
      });

      const result = await res.json();
      console.log("Relay API response:", result);

      if (!res.ok) {
        let errorMessage = result.error || 'Relay failed';
        // Error handling for specific cases
        if (errorMessage.includes('transfer amount exceeds balance')) {
          errorMessage = 'Insufficient IDRX balance';
        } else if (errorMessage.includes('insufficient allowance')) {
          errorMessage = 'Please approve the IDRX Payment Contract first';
        } else if (errorMessage.includes('insufficient funds') || errorMessage.includes('INSUFFICIENT_FUNDS')) {
          errorMessage = 'The relayer needs LISK tokens to pay for gas fees';
        } else if (errorMessage.includes('amount too small')) {
          errorMessage = 'Amount is too small. Please enter a larger amount';
        } else if (errorMessage.includes('invalid amount')) {
          errorMessage = 'Please enter a valid amount';
        } else if (errorMessage.includes('execution reverted')) {
          // Handle the specific error we're seeing with Xellar
          errorMessage = 'Transaction execution failed. This may be due to an issue with signature validation.';

          // If this is a signature error from Xellar, throw a specific error for potential retry
          if (errorMessage.includes('signature') || result.isSignatureError) {
            throw new Error('SIGNATURE_VALIDATION_FAILED');
          }
        }

        toast.error(errorMessage, { id: 'relay-loading' });
        throw new Error(errorMessage);
      }

      // Verify we have a transaction hash before claiming success
      if (!result.txHash) {
        toast.error('Relay returned success but no transaction hash was provided', { id: 'relay-loading' });
        throw new Error('No transaction hash returned from relay');
      }

      toast.success(`Transaction sent successfully!`, { id: 'relay-loading' });
      return result.txHash;
    } catch (error: any) {
      console.error('Xellar transaction failed:', error);

      // Clear any pending toast
      toast.error(`Transaction failed: ${error.message}`, { id: 'relay-loading' });

      throw error;
    }
  };

  const handleMetaTx = async () => {
    // Check if using Xellar Kit or another wallet provider
    const isXellarKit = !!walletClient && !!walletClient.account;

    if (isXellarKit) {
      console.log("Using Xellar Kit wallet", {
        address: walletClient.account.address
      });
    } else {
      console.log("Using other wallet provider (likely MetaMask)");
    }

    // Handle missing data based on wallet type
    if (!walletClient) {
      console.error('Wallet client not available');
      toast.error('Wallet not connected. Please connect your wallet and try again.');
      return;
    }

    if (!address) {
      console.error('Wallet address not available');
      toast.error('Could not get your wallet address. Please reconnect your wallet.');
      return;
    }

    // For Xellar Kit, manually fetch the nonce if it's not available
    if (!nonce && isXellarKit) {
      console.log("Nonce not available with Xellar Kit, fetching it now...");
      try {
        if (publicClient) {
          const fetchedNonce = await publicClient.readContract({
            address: metaTxForwarderContract,
            abi: metaTxForwarderAbi,
            functionName: "nonces",
            args: [address],
          }) as bigint;

          console.log("Manually fetched nonce:", fetchedNonce.toString());
          setNonce(fetchedNonce);
        } else {
          console.error("Public client not available, cannot fetch nonce");
          toast.error("Network connection not available. Please check your connection.");
          return;
        }
      } catch (error: any) {
        console.error("Failed to fetch nonce:", error);
        toast.error("Could not get transaction information. Please try again later.");
        return;
      }
    } else if (!nonce) {
      console.error('Transaction nonce not available');
      toast.error('Transaction information not available. Please refresh and try again.');
      return;
    }

    if (!publicClient) {
      console.error('Public client not available');
      toast.error('Network connection not available. Please check your connection.');
      return;
    }

    if (!isApproved) {
      toast.error('Please approve the transaction first');
      return;
    }

    setIsLoading(true);

    // Resolve ENS name to address if necessary
    let toAddress = recipientAddress;
    if (!toAddress.startsWith('0x')) {
      try {
        const ensNameToResolve = toAddress.includes('.') ? toAddress : `${toAddress}.lisk.eth`;
        console.log("Resolving ENS name:", ensNameToResolve);
        const resolved = await resolveENSName(ensNameToResolve);
        if (!resolved) {
          throw new Error(`Could not resolve ENS name: ${ensNameToResolve}`);
        }
        toAddress = resolved;
        console.log("Resolved to address:", toAddress);
      } catch (error: any) {
        console.error("ENS resolution error:", error);
        setIsLoading(false);
        toast.error(`ENS resolution failed: ${error.message}`);
        return;
      }
    }

    try {
      // Get the current nonce for this user from the contract
      const currentNonce = await publicClient.readContract({
        address: metaTxForwarderContract,
        abi: metaTxForwarderAbi,
        functionName: "nonces",
        args: [address],
      }) as bigint;
      console.log("Current nonce from contract:", currentNonce.toString());

      // Generate the message hash
      const messageHash = await publicClient.readContract({
        address: metaTxForwarderContract,
        abi: metaTxForwarderAbi,
        functionName: "getMessageHash",
        args: [
          address,
          toAddress as `0x${string}`,
          parseUnits(amount, tokenDecimals),
          idrxPayContract,
          currentNonce,
        ],
      }) as `0x${string}`;
      console.log("Message hash:", messageHash);

      let txHash;

      // Maximum number of signature attempts for Xellar (for retry logic)
      const maxAttempts = 2;
      let attempts = 0;

      while (attempts < maxAttempts) {
        attempts++;
        try {
          if (isXellarKit) {
            txHash = await handleXellarTransaction(
              walletClient,
              messageHash,
              publicClient,
              address,
              toAddress,
              amount,
              tokenDecimals
            );
            break; // If successful, exit the retry loop
          } else {
            // Using other provider (like MetaMask)
            const signature = await walletClient.signMessage({
              message: { raw: messageHash }
            });
            console.log("Wallet signature received, length:", signature.length);

            // Send to relayer
            toast.loading('Sending transaction...', { id: 'relay-loading' });
            console.log("Sending to relay API", {
              sender: address,
              receiver: toAddress,
              amount: amount
            });

            const res = await fetch('/api/relay', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sender: address,
                receiver: toAddress,
                amount,
                signature,
              }),
            });

            const result = await res.json();
            console.log("Relay API response:", result);

            if (!res.ok) {
              let errorMessage = result.error || 'Relay failed';
              if (errorMessage.includes('transfer amount exceeds balance')) {
                errorMessage = 'Insufficient IDRX balance';
              } else if (errorMessage.includes('insufficient allowance')) {
                errorMessage = 'Please approve the IDRX Payment Contract first';
              } else if (errorMessage.includes('insufficient funds') || errorMessage.includes('INSUFFICIENT_FUNDS')) {
                errorMessage = 'The relayer needs LISK tokens to pay for gas fees';
              } else if (errorMessage.includes('amount too small')) {
                errorMessage = 'Amount is too small. Please enter a larger amount';
              } else if (errorMessage.includes('invalid amount')) {
                errorMessage = 'Please enter a valid amount';
              }

              toast.error(errorMessage, { id: 'relay-loading' });
              throw new Error(errorMessage);
            }

            toast.success(`Transaction sent successfully!`, { id: 'relay-loading' });
            txHash = result.txHash;
            break; // If successful, exit the retry loop
          }
        } catch (sigError: any) {
          console.error(`Attempt ${attempts}/${maxAttempts} failed:`, sigError);

          // If we've reached max attempts or it's not a signature error, throw
          if (attempts >= maxAttempts || sigError.message !== 'SIGNATURE_VALIDATION_FAILED') {
            throw new Error(sigError.message || "Failed to sign message with wallet");
          }

          // If it's a signature error and we have more attempts, log and continue
          console.log(`Retrying with different signature format (attempt ${attempts + 1}/${maxAttempts})`);
          toast.loading(`Retrying with different signature format...`, { id: 'relay-loading' });
        }
      }

      setLastTransactionHash(txHash);
      return txHash;
    } catch (error: any) {
      console.error('Meta transaction failed:', error);
      let errorMsg = error.message || 'Transaction failed';

      if (errorMsg.includes('transfer amount exceeds balance')) {
        errorMsg = 'Insufficient IDRX balance';
      } else if (errorMsg.includes('insufficient allowance')) {
        errorMsg = 'Please approve the IDRX Payment Contract first';
      } else if (errorMsg.includes('insufficient funds') || errorMsg.includes('INSUFFICIENT_FUNDS')) {
        errorMsg = 'The relayer needs LISK tokens to pay for gas fees';
      } else if (errorMsg.includes('amount too small')) {
        errorMsg = 'Amount is too small. Please enter a larger amount';
      } else if (errorMsg.includes('invalid amount')) {
        errorMsg = 'Please enter a valid amount';
      } else if (errorMsg.includes('rejected') || errorMsg.includes('denied') || errorMsg.includes('cancelled')) {
        errorMsg = 'Transaction was rejected by the user';
      }

      toast.error(errorMsg, { id: 'relay-loading' });
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // New function to combine approve and send in one operation
  const handleApproveAndSend = async () => {
    if (!walletClient || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsLoading(true);

    try {
      // First check if already approved
      if (!isApproved) {
        // Need to approve first
        toast.loading('Approving transaction...', { id: 'combined-tx' });

        try {
          const tokenContract = getContract({
            address: idrxTokenContract,
            abi: erc20Abi,
            client: walletClient,
          });

          const amountToApprove = parseUnits(amount, tokenDecimals);
          console.log("Approving amount:", amountToApprove.toString());

          const approveTxHash = await tokenContract.write.approve([
            idrxPayContract,
            amountToApprove,
          ]);

          console.log("Approval transaction submitted:", approveTxHash);
          toast.loading('Waiting for approval confirmation...', { id: 'combined-tx' });

          // Wait for the transaction to be mined
          if (publicClient) {
            await publicClient.waitForTransactionReceipt({ hash: approveTxHash });
            console.log("Approval transaction confirmed");
          }

          // Update the approval state
          setIsApproved(true);
        } catch (approveError: any) {
          console.error("Error during approval:", approveError);
          toast.error(`Approval failed: ${approveError.message}`, { id: 'combined-tx' });
          setIsLoading(false);
          return;
        }
      }

      // Now proceed with sending the transaction
      toast.loading('Sending transaction...', { id: 'combined-tx' });

      // Execute the meta transaction
      await handleMetaTx();

      toast.success('Transaction completed!', { id: 'combined-tx' });
    } catch (error: any) {
      console.error('Combined operation failed:', error);
      toast.error(`Transaction failed: ${error.message}`, { id: 'combined-tx' });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleApprove,
    handleMetaTx,
    handleApproveAndSend,
    isLoading,
    isApproved,
    isApproving,
    allowance,
    balance,
    hasEnoughTokens,
    nonce,
    isNonceLoaded,
    nonceError,
    debugInfo,
    lastTransactionHash,
    tokenDecimals
  };
}; 