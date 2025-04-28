'use client'

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { parseEther, getContract, encodeFunctionData, erc20Abi } from 'viem';
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

  // Use the correct MetaTxForwarder address and ABI from metaTxForward
  const metaTxForwarderContract = metaTxForward.address as `0x${string}`;
  const metaTxForwarderAbi = metaTxForward.abi;

  // Contract addresses - using the correct address for Lisk Sepolia testnet
  const idrxTokenContract = "0xD63029C1a3dA68b51c67c6D1DeC3DEe50D681661" as `0x${string}`; // ERC20 token
  const idrxPayContract = "0x5b7E831A950C03275d92493265219d71FB58b73B" as `0x${string}`; // Payment contract

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
        const code = await publicClient.getBytecode({ address: metaTxForwarderContract });
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
        metaTxForwarderContract,
      ]) as bigint;
      console.log('Allowance checked:', {
        address,
        spender: metaTxForwarderContract,
        allowance: allowanceValue.toString(),
        amount,
      });
      setAllowance(allowanceValue);
      if (allowanceValue >= parseEther(amount)) {
        setIsApproved(true);
      } else {
        setIsApproved(false);
      }
    } catch (err) {
      setIsApproved(false);
      setAllowance(BigInt(0));
    }
  }, [address, publicClient, idrxTokenContract, metaTxForwarderContract, amount]);

  useEffect(() => {
    checkAllowance();
    setIsApproved(false);
    setAllowance(BigInt(0));
  }, [address]);

  // Re-check allowance whenever the amount changes
  useEffect(() => {
    checkAllowance();
  }, [amount, checkAllowance]);

  // Approve function
  const handleApprove = async () => {
    if (!walletClient || !address) return;
    setIsApproving(true);
    if (onProcessingChange) {
      onProcessingChange(true);
    }
    try {
      const tokenContract = getContract({
        address: idrxTokenContract,
        abi: erc20Abi,
        client: walletClient,
      });
      const txHash = await tokenContract.write.approve([
        metaTxForwarderContract,
        parseEther(amount),
      ]);
      toast.success('Approval transaction sent! Waiting for confirmation...');
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash: txHash });
        // Wait for the transaction to be mined before checking allowance
        await checkAllowance();
      }
      toast.success('IDRX approved for meta-transactions!');
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
        hasNonce: !!nonce,
        isNonceLoaded,
      });
      toast.error('Wallet not connected or network not available');
      return;
    }

    setIsLoading(true);
    if (onProcessingChange) {
      onProcessingChange(true);
    }
    
    try {
      // 1. Get the current nonce if not already fetched
      let currentNonce = nonce;
      if (currentNonce === null || !isNonceLoaded) {
        console.log('Nonce not available, fetching it now');
        currentNonce = await fetchNonce();
        if (currentNonce === null) {
          throw new Error('Failed to get nonce. Please try again or check your connection.');
        }
      }
      console.log('Using nonce:', currentNonce.toString());

      // 2. Create the contract instance for the meta-transaction forwarder
      const metaTxContract = getContract({
        address: metaTxForwarderContract,
        abi: metaTxForwarderAbi,
        client: publicClient,
      });

      // 3. Get the message hash
      console.log('Getting message hash with params:', {
        from: address,
        to: recipientAddress,
        amount: parseEther(amount).toString(),
        targetContract: idrxPayContract,
        nonce: currentNonce.toString(),
      });
      
      const messageHash = await metaTxContract.read.getMessageHash([
        address,
        recipientAddress as `0x${string}`,
        parseEther(amount),
        idrxPayContract,
        currentNonce,
      ]) as `0x${string}`;
      console.log('Message hash:', messageHash);

      // 4. Get the eth signed message hash
      const ethSignedMessageHash = await metaTxContract.read.getEthSignedMessageHash([messageHash]) as `0x${string}`;
      console.log('Eth signed message hash:', ethSignedMessageHash);

      // 5. Sign the message
      console.log('Signing message...');
      const signature = await walletClient.signMessage({ message: { raw: messageHash } });
      console.log('Signature obtained:', signature);

      // 6. Send the meta-transaction to the relay server
      console.log('Sending to relay server:', {
        from: address,
        to: recipientAddress,
        amount: parseEther(amount).toString(),
        targetContract: idrxPayContract,
        nonce: currentNonce.toString(),
        signatureLength: signature.length,
      });
      
      toast.loading('Sending transaction to relay server...', { id: 'relay-loading' });
      
      const response = await fetch('/api/relay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: address,
          to: recipientAddress,
          amount: parseEther(amount).toString(),
          targetContract: idrxPayContract,
          nonce: currentNonce.toString(),
          signature,
        }),
      });

      console.log('Relay server response status:', response.status);
      const result = await response.json();
      console.log('Relay server response:', result);

      if (!response.ok) {
        toast.error(result.error || 'Failed to execute meta-transaction', { id: 'relay-loading' });
        throw new Error(result.error || 'Failed to execute meta-transaction');
      }

      toast.success(`Transaction sent! Hash: ${result.txHash}`, { id: 'relay-loading' });
      
      // 7. Increment the nonce for the next transaction
      setNonce(currentNonce + BigInt(1));
    } catch (error: any) {
      console.error('Meta-transaction error:', error);
      toast.error(error.message || 'Failed to execute meta-transaction', { id: 'relay-loading' });
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
        <button
          onClick={handleApprove}
          disabled={isApproving || isApproved || !walletClient}
          className={`w-full py-2 px-4 rounded-md text-white font-medium mb-2 ${
            isApproving || isApproved || !walletClient
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-yellow-600 hover:bg-yellow-700'
          }`}
        >
          {isApproving ? 'Approving...' : isApproved ? 'Approved' : 'Approve IDRX for MetaTx'}
        </button>
      </div>
      <button
        onClick={handleMetaTx}
        disabled={isLoading || !isNonceLoaded || !isApproved}
        className={`w-full py-2 px-4 rounded-md text-white font-medium ${
          isLoading || !isNonceLoaded || !isApproved
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isLoading ? 'Processing...' : isNonceLoaded ? 'Send IDRX (No Gas Fee)' : 'Loading...'}
      </button>
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
      {!isApproved && (
        <p className="mt-2 text-sm text-yellow-600 text-center">
          Please approve the MetaTxForwarder contract to spend your IDRX before sending.
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