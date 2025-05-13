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

    setIsApproving(true);

    try {
      setIsApproved(false);
      const tokenContract = getContract({
        address: idrxTokenContract,
        abi: erc20Abi,
        client: walletClient,
      });

      const amountToApprove = parseUnits(amount, tokenDecimals);
      const txHash = await tokenContract.write.approve([
        idrxPayContract,
        amountToApprove,
      ]);

      toast.success('Please approve the transaction in MetaMask...');

      if (publicClient) {
        const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
        if (receipt.status === 'success') {
          setIsApproved(true);
          toast.success('Approval confirmed! You can now send the transaction.');
        } else {
          setIsApproved(false);
          throw new Error('Approval transaction failed');
        }
      }
    } catch (err: any) {
      console.error('Approval error:', err);
      toast.error(err.message || 'Approval failed');
      setIsApproved(false);
    } finally {
      setIsApproving(false);
    }
  };

  const handleMetaTx = async () => {
    if (!walletClient || !address || !nonce || !publicClient) {
      console.error('Missing required data for meta transaction');
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
      const ensNameToResolve = toAddress.includes('.') ? toAddress : `${toAddress}.lisk.eth`;
      const resolved = await resolveENSName(ensNameToResolve);
      if (!resolved) {
        throw new Error(`Could not resolve ENS name: ${ensNameToResolve}`);
      }
      toAddress = resolved;
    }

    try {
      const currentNonce = await publicClient.readContract({
        address: metaTxForwarderContract,
        abi: metaTxForwarderAbi,
        functionName: "nonces",
        args: [address],
      }) as bigint;

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

      const signature = await walletClient.signMessage({ message: { raw: messageHash } });

      toast.loading('Sending to relayer...', { id: 'relay-loading' });

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

      toast.success(`Transaction Sent! Hash: ${result.txHash}`, { id: 'relay-loading' });
      setLastTransactionHash(result.txHash);
      return result.txHash;
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
      }

      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    isApproving,
    isApproved,
    hasEnoughTokens,
    nonceError,
    handleApprove,
    handleMetaTx,
    lastTransactionHash
  };
}; 