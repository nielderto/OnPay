'use client'
import { useState } from "react";
import { idrxPayConfig } from "@/abi/idrxPay";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useConfig } from "wagmi";
import { isAddress, parseUnits, maxUint256, Abi } from 'viem'
import { waitForTransactionReceipt } from 'wagmi/actions'
import Balance from './Balance';
import toast, { Toaster } from 'react-hot-toast';

// Minimal ABI for ERC20 allowance/approve
const erc20Abi = [
    {
        inputs: [{ internalType: "address", name: "owner", type: "address" }, { internalType: "address", name: "spender", type: "address" }],
        name: "allowance",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [{ internalType: "address", name: "spender", type: "address" }, { internalType: "uint256", name: "amount", type: "uint256" }],
        name: "approve",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "decimals",
        outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
        stateMutability: "view", // Changed from pure for broader compatibility, though likely pure
        type: "function",
    },
] as const;

const IDRX_TOKEN_ADDRESS = '0xD63029C1a3dA68b51c67c6D1DeC3DEe50D681661';

export default function SendForm() {
    const [statusMessage, setStatusMessage] = useState('');
    const [isProcessing, setIsProcessing] = useState(false); // Combined loading state
    const {address, chainId} = useAccount();
    const config = useConfig();
    const [recipientAddress, setRecipientAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');

    // Read token decimals
    const { data: decimals, isLoading: isLoadingDecimals } = useReadContract({
        address: IDRX_TOKEN_ADDRESS, 
        abi: erc20Abi,
        functionName: 'decimals',
    });

    // Read current allowance
    const { data: currentAllowance, refetch: refetchAllowance, isLoading: isLoadingAllowance } = useReadContract({
        address: IDRX_TOKEN_ADDRESS,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [address!, idrxPayConfig.address],
        query: {
            enabled: !!address,
        }
    });

    // Hook for approve transaction
    const { writeContractAsync: approveAsync, isPending: isApproving } = useWriteContract();

    // Hook for sendIDRX transaction
    const { writeContractAsync: sendAsync, isPending: isSending } = useWriteContract();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setStatusMessage('');
        if (!address || !recipientAddress || !amount || decimals === undefined || currentAllowance === undefined || !chainId) {
            setError('Please fill all fields and ensure wallet is connected to the correct network.');
            return;
        }
        
        if (!isAddress(recipientAddress)) {
            setError('Invalid recipient address');
            return;
        }

        setIsProcessing(true);
        let approveTxHash: `0x${string}` | undefined = undefined;

        try {
            const amountInBaseUnit = parseUnits(amount, decimals);

            // 1. Check allowance and approve if needed
            if (currentAllowance < amountInBaseUnit) {
                setStatusMessage('Allowance insufficient. Requesting approval...');
                approveTxHash = await approveAsync({
                    address: IDRX_TOKEN_ADDRESS,
                    abi: erc20Abi,
                    functionName: 'approve',
                    args: [idrxPayConfig.address, maxUint256],
                });
                setStatusMessage(`Approval transaction sent (${approveTxHash}). Waiting for confirmation...`);
                const approveReceipt = await waitForTransactionReceipt(config, { hash: approveTxHash, chainId });
                if (approveReceipt.status !== 'success') {
                    throw new Error('Approval transaction failed');
                }
                setStatusMessage('Approval confirmed. Proceeding with send...');
                await refetchAllowance(); 
            } else {
                setStatusMessage('Allowance sufficient. Proceeding with send...');
            }

            // 2. Send the tokens
            const sendTxHash = await sendAsync({
                ...idrxPayConfig,
                functionName: 'sendIDRX',
                args: [recipientAddress as `0x${string}`, amountInBaseUnit],
            });
            setStatusMessage(`Send transaction sent (${sendTxHash}). Waiting for confirmation...`);
            const sendReceipt = await waitForTransactionReceipt(config, { hash: sendTxHash, chainId });
             if (sendReceipt.status !== 'success') {
                throw new Error('Send transaction failed');
            }

            setStatusMessage('Transaction successful!');
            toast.success('Transaction completed successfully! 🎉');
            setRecipientAddress('');
            setAmount('');

        } catch (err: any) {
            console.error('Transaction Error:', err);
            if (err.message.includes('rejected')) {
                setError('Transaction rejected by user.');
                toast.error('Transaction rejected by user');
            } else if (err.message.includes('Invalid input')) {
                setError('Invalid amount entered. Please use a valid number.');
                toast.error('Invalid amount entered');
            } else if (err.message.includes('transaction failed')){
                const errorMsg = `Transaction failed: ${approveTxHash ? `(Approve: ${approveTxHash})`: ''} ${err.message}`;
                setError(errorMsg);
                toast.error('Transaction failed');
            } else {
                setError('An error occurred. Check console for details.');
                toast.error('An error occurred');
            }
             setStatusMessage('');
        } finally {
            setIsProcessing(false);
        }
    };

    const isLoading = isProcessing || isLoadingDecimals || isLoadingAllowance || isApproving || isSending;

    return (
        <>
            <Toaster position="top-right" />
            <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
                <div>
                    <label htmlFor="recipient" className="block text-sm font-medium text-gray-700">
                        Recipient 
                    </label>
                    <input
                        type="text"
                        id="recipient"
                        value={recipientAddress}
                        onChange={(e) => setRecipientAddress(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
                        placeholder="Enter recipient address (0x...)"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                        Amount (IDRX)
                    </label>
                    <input
                        type="number"
                        id="amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
                        placeholder="0.05"
                        step="any" // Allow any decimal step
                        required
                    />
                </div>
                <Balance />

                {statusMessage && (
                    <div className="text-blue-600 text-sm">{statusMessage}</div>
                )}
                {error && (
                    <div className="text-red-500 text-sm">{error}</div>
                )}

                <button
                    type="submit"
                    disabled={isLoading || !address || decimals === undefined}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Processing...' : (currentAllowance === undefined && !!address ? 'Loading Allowance...' : 'Confirm Transaction')}
                </button>
            </form>
        </>
    );
} 