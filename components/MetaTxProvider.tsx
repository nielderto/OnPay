'use client'

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { parseEther, parseUnits, getContract, encodeFunctionData, erc20Abi } from 'viem';
import { idrxPayConfig } from '@/abi/idrxPay';
import toast from 'react-hot-toast';
import { metaTxForward } from '@/abi/metatxfoward';

interface MetaTxProviderProps {
  recipientAddress: string;
  amount: string;
  decimals: number;
  onProcessingChange?: (processing: boolean) => void;
}

export default function MetaTxProvider({ recipientAddress, amount, decimals, onProcessingChange }: MetaTxProviderProps) {
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
  const [tokenDecimals, setTokenDecimals] = useState<number>(2); // Initialize with 2 decimals

  // Use the correct MetaTxForwarder address and ABI from metaTxForward
  const metaTxForwarderContract = metaTxForward.address as `0x${string}`;
  const metaTxForwarderAbi = metaTxForward.abi;

  // Contract addresses - Define token contract address with flexibility
  // This address should match the one deployed on the Lisk Sepolia testnet
  const idrxTokenContract = "0xD63029C1a3dA68b51c67c6D1DeC3DEe50D681661" as `0x${string}`; // ERC20 token
  const idrxPayContract = idrxPayConfig.address as `0x${string}`; // Payment contract

  // Debug logs
  console.log('MetaTxProvider rendered with:', {
    address,
    recipientAddress,
    amount,
    hasWalletClient: !!walletClient,
    hasPublicClient: !!publicClient,
    nonce: nonce?.toString(),
    isNonceLoaded,
    nonceError,
    metaTxForwarderContract,
  });

  // Fetch nonce for the user
  const fetchNonce = useCallback(async (retryCount = 0) => {
    if (!address || !publicClient) {
      const errorMsg = 'Wallet not connected or network not available';
      console.log(`Cannot fetch nonce: ${errorMsg}`);
      setNonceError(errorMsg);
      setDebugInfo(`Missing: ${!address ? 'address' : 'publicClient'}`);
      return null;
    }

    try {
      console.log(`Fetching nonce for address: ${address} (attempt ${retryCount + 1})`);
      console.log(`Using MetaTxForwarder contract at: ${metaTxForwarderContract}`);

      // Create contract instance with the correct ABI
      const contract = getContract({
        address: metaTxForwarderContract,
        abi: metaTxForwarderAbi,
        client: publicClient,
      });

      // Try to get the contract code to verify it exists
      try {
        const code = await publicClient.getCode({ address: metaTxForwarderContract });
        console.log(`Contract code exists: ${!!code}`);
        if (!code) {
          throw new Error('Contract does not exist at the specified address');
        }
      } catch (error: any) {
        console.error('Error checking contract code:', error);
        setDebugInfo(`Contract code check failed: ${error.message}`);
      }

      // Try to call the nonces function with a timeout
      console.log('Calling nonces function...');

      // Create a promise that rejects after 10 seconds
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Nonce fetch timed out')), 10000);
      });

      // Race the nonces call against the timeout
      const userNonce = await Promise.race([
        contract.read.nonces([address]) as Promise<bigint>,
        timeoutPromise
      ]);

      console.log('Nonce fetched successfully:', userNonce.toString());
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

      // Retry logic - up to 3 attempts
      if (retryCount < 3) {
        console.log(`Retrying nonce fetch (attempt ${retryCount + 2})...`);
        // Exponential backoff
        setTimeout(() => fetchNonce(retryCount + 1), 1000 * Math.pow(2, retryCount));
      } else {
        toast.error(`Failed to fetch nonce after multiple attempts: ${errorMessage}`);
      }
      return null;
    }
  }, [address, publicClient, metaTxForwarderContract]);

  // Fetch nonce on component mount or when address changes
  useEffect(() => {
    if (address) {
      console.log('Component mounted or address changed, fetching nonce for address:', address);
      fetchNonce();
    }
  }, [address, fetchNonce]);

  // Check allowance
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
      console.log('Allowance checked:', {
        address,
        spender: idrxPayContract,
        allowance: allowanceValue.toString(),
        amount,
        tokenDecimals
      });
      setAllowance(allowanceValue);
      if (allowanceValue >= parseUnits(amount, tokenDecimals)) {
        setIsApproved(true);
      } else {
        setIsApproved(false);
      }
    } catch (err) {
      setIsApproved(false);
      setAllowance(BigInt(0));
    }
  }, [address, publicClient, idrxTokenContract, idrxPayContract, amount, tokenDecimals]);

  // Check token balance
  const checkBalance = useCallback(async () => {
    if (!address || !publicClient) return;
    try {
      const tokenContract = getContract({
        address: idrxTokenContract,
        abi: erc20Abi,
        client: publicClient,
      });
      const balanceValue = await tokenContract.read.balanceOf([address]) as bigint;

      // Simple sanity checks to ensure we're getting correct data
      if (balanceValue === undefined || balanceValue === null) {
        throw new Error('Invalid balance returned from contract');
      }

      // Try to fetch token decimals if we haven't stored them yet
      if (tokenDecimals === 0) {
        try {
          const fetchedDecimals = await tokenContract.read.decimals() as number;
          setTokenDecimals(fetchedDecimals);
          console.log(`Fetched token decimals: ${fetchedDecimals}`);
        } catch (decimalErr) {
          console.error('Error fetching token decimals, using default of 2:', decimalErr);
        }
      }

      // Parse amount with correct token decimals
      const requiredAmount = parseUnits(amount, tokenDecimals);

      // Fee is 1% (100/10000)
      const feeAmount = (requiredAmount * BigInt(100)) / BigInt(10000);
      const totalRequired = requiredAmount + feeAmount;

      // Force comparison as BigInt
      const balanceBigInt = BigInt(balanceValue.toString());
      const requiredBigInt = BigInt(totalRequired.toString());

      // Convert to strings for easier debugging and human-readable display
      const balanceStr = balanceBigInt.toString();
      const requiredStr = requiredAmount.toString();
      const feeStr = feeAmount.toString();
      const totalRequiredStr = requiredBigInt.toString();

      console.log('Balance check details:', {
        address,
        tokenContract: idrxTokenContract,
        balance: balanceStr,
        requiredAmount: requiredStr,
        fee: feeStr,
        totalRequired: totalRequiredStr,
        hasEnough: balanceBigInt >= requiredBigInt,
        tokenDecimals,
        amountParam: amount
      });

      setBalance(balanceBigInt);

      // OVERRIDE: Always allow transactions for testing
      setHasEnoughTokens(true);
      console.log('OVERRIDE: Forcing hasEnoughTokens to true for testing');

      // Uncomment for production
      
      if (balanceBigInt >= requiredBigInt) {
        console.log('User has sufficient balance');
        setHasEnoughTokens(true);
      } else {
        console.log('User has insufficient balance');
        setHasEnoughTokens(false);
      }
      
    } catch (err) {
      console.error('Error checking balance:', err);
      // // OVERRIDE: Always allow transactions for testing
      // setHasEnoughTokens(true);
      // setBalance(BigInt(0));
    }
  }, [address, publicClient, idrxTokenContract, amount, tokenDecimals]);

  // Check allowance and balance whenever address or amount changes
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

  // Re-check allowance and balance whenever the amount changes
  useEffect(() => {
    checkAllowance();
    checkBalance();
  }, [amount, checkAllowance, checkBalance]);

  // Approve function
  const handleApprove = async () => {
    if (!walletClient || !address) return;
    setIsApproving(true);
    if (onProcessingChange) {
      onProcessingChange(true);
    }

    try {
      const { writeContract } = await import('viem/actions');

      const txHash = await walletClient.writeContract({
        address: idrxTokenContract,
        abi: erc20Abi,
        functionName: "approve",
        args: [idrxPayContract, parseUnits(amount, tokenDecimals)],
      });

      toast.success('Approval tx sent! Waiting for confirmation...');
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash: txHash });
        // Wait for the transaction to be mined before checking allowance
        await checkAllowance();
      }
      toast.success('Approval confirmed!');
    } catch (err: any) {
      toast.error(err.message || 'Approval failed');
      setIsApproved(false);
    } finally {
      setIsApproving(false);
      if (onProcessingChange) {
        onProcessingChange(false);
      }
    }
  };


  // Handle the meta-transaction
  const handleMetaTx = async () => {
    console.log('handleMetaTx called');

    if (!address || !walletClient || !publicClient) {
      console.error('Missing required data:', {
        hasAddress: !!address,
        hasWalletClient: !!walletClient,
        hasPublicClient: !!publicClient,
      });
      toast.error('Wallet not connected or network not available');
      return;
    }

    setIsLoading(true);
    if (onProcessingChange) {
      onProcessingChange(true);
    }

    try {
      // 1. Fetch nonce cleanly
      const currentNonce = await publicClient.readContract({
        address: metaTxForwarderContract,
        abi: metaTxForwarderAbi,
        functionName: "nonces",
        args: [address],
      }) as bigint;

      console.log('Nonce fetched:', currentNonce.toString());

      // 2. Use the contract's getMessageHash function to create the message hash
      const messageHash = await publicClient.readContract({
        address: metaTxForwarderContract,
        abi: metaTxForwarderAbi,
        functionName: "getMessageHash",
        args: [
          address,
          recipientAddress as `0x${string}`,
          parseUnits(amount, tokenDecimals),
          idrxPayContract,
          currentNonce,
        ],
      }) as `0x${string}`;

      console.log('Contract messageHash:', messageHash);

      // 3. Sign the message hash directly
      const signature = await walletClient.signMessage({ message: { raw: messageHash } });

      console.log('Signature:', signature);

      // 4. Call your relayer API
      toast.loading('Sending to relayer...', { id: 'relay-loading' });

      const res = await fetch('/api/relay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: address,
          receiver: recipientAddress,
          amount,
          signature,
        }),
      });

      const result = await res.json();
      console.log('Relayer response:', result);

      if (!res.ok) {
        let errorMessage = result.error || 'Relay failed';

        // Check for specific error cases
        if (errorMessage.includes('transfer amount exceeds balance')) {
          errorMessage = 'Transaction failed: Your wallet doesn\'t have enough IDRX tokens';
        } else if (errorMessage.includes('insufficient allowance')) {
          errorMessage = 'Transaction failed: You need to approve the IDRX Payment Contract first';
        } else if (errorMessage.includes('insufficient funds') || errorMessage.includes('INSUFFICIENT_FUNDS')) {
          errorMessage = 'Transaction failed: The relayer needs LISK tokens to pay for gas fees';
        }

        toast.error(errorMessage, { id: 'relay-loading' });
        throw new Error(errorMessage);
      }

      toast.success(`Transaction Sent! Hash: ${result.txHash}`, { id: 'relay-loading' });
    } catch (error: any) {
      console.error('Meta-tx error:', error);

      // Format the error message for better readability
      let errorMessage = error.message || 'Meta-tx failed';
      if (errorMessage.includes('transfer amount exceeds balance')) {
        errorMessage = 'Your wallet doesn\'t have enough IDRX tokens';
      } else if (errorMessage.includes('insufficient allowance')) {
        errorMessage = 'You need to approve the IDRX Payment Contract first';
      } else if (errorMessage.includes('insufficient funds') || errorMessage.includes('INSUFFICIENT_FUNDS')) {
        errorMessage = 'The relayer needs LISK tokens to pay for gas fees';
      }

      toast.error(errorMessage, { id: 'relay-loading' });
    } finally {
      setIsLoading(false);
      if (onProcessingChange) {
        onProcessingChange(false);
      }
    }
  };


  return (
    <div className="mt-4">
      <div className="mb-2">
        <div className="text-xs text-gray-500 text-center">
          Current Allowance: {allowance.toString()} wei
        </div>
        <div className="text-xs text-gray-500 text-center mb-1">
          Current Balance: {balance.toString()} wei (Token Decimals: {tokenDecimals})
        </div>
        <div className="text-xs text-amber-600 text-center mb-2">
          <p>To successfully send meta-transactions:</p>
          <ol className="list-decimal list-inside text-left px-4 mt-1">
            <li>Your wallet must have enough IDRX tokens to send</li>
            <li>You must approve the Payment Contract to spend your tokens</li>
            <li>The relayer must have LSK tokens to pay for gas</li>
          </ol>
        </div>
        <button
          onClick={handleApprove}
          disabled={isApproving || isApproved || !walletClient}
          className={`w-full py-2 px-4 rounded-md text-white font-medium mb-2 ${isApproving || isApproved || !walletClient
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-yellow-600 hover:bg-yellow-700'
            }`}
        >
          {isApproving ? 'Approving...' : isApproved ? 'Approved' : 'Approve IDRX Payment Contract'}
        </button>
      </div>
      <button
        onClick={handleMetaTx}
        disabled={isLoading || !isNonceLoaded || !isApproved}
        className={`w-full py-2 px-4 rounded-md text-white font-medium ${isLoading || !isNonceLoaded || !isApproved
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-blue-600 hover:bg-blue-700'
          }`}
      >
        {isLoading ? 'Processing...' : isNonceLoaded ? 'Send IDRX (No Gas Fee)' : 'Loading...'}
      </button>
      {!hasEnoughTokens && (
        <p className="mt-2 text-sm text-red-500 text-center">
          Insufficient IDRX balance for this transaction (includes 1% fee)
        </p>
      )}
     
      {nonceError && (
        <p className="mt-2 text-sm text-red-500 text-center">
          {nonceError}
        </p>
      )}
      {debugInfo && (
        <p className="mt-2 text-sm text-gray-500 text-center">
          Debug: {debugInfo}
        </p>
      )}
      <p className="mt-2 text-sm text-gray-500 text-center">
        This transaction will be processed without gas fees
      </p>
      {!isApproved && hasEnoughTokens && (
        <p className="mt-2 text-sm text-yellow-600 text-center">
          Please approve the IDRX Payment Contract to spend your IDRX before sending.
        </p>
      )}

      {/* Debug button */}
      <div className="mt-4 text-center">
        <button
          onClick={() => {
            console.log('Debug info:', {
              address,
              recipientAddress,
              amount,
              nonce: nonce?.toString(),
              isNonceLoaded,
              nonceError,
              isApproved,
              isApproving,
              allowance: allowance.toString(),
              balance: balance.toString(),
              hasEnoughTokens,
              metaTxForwarderContract,
              idrxPayContract,
              idrxTokenContract,
            });
            toast.success('Debug info logged to console');
          }}
          className="text-xs text-gray-500 hover:text-gray-700 underline"
        >
          Debug Info
        </button>
      </div>
    </div>
  );
} 