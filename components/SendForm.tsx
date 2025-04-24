'use client'
import { useState } from "react";
import { idrxPayConfig } from "@/abi/idrxPay";
import { useAccount, useReadContract, useWriteContract, useConfig } from "wagmi";
import { isAddress, parseUnits, maxUint256 } from 'viem'
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
        stateMutability: "view",
        type: "function",
    },
] as const;

const IDRX_TOKEN_ADDRESS = '0xD63029C1a3dA68b51c67c6D1DeC3DEe50D681661';

export default function SendForm() {
    const [isProcessing, setIsProcessing] = useState(false);
    const {address, chainId} = useAccount();
    const config = useConfig();
    const [recipientAddress, setRecipientAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [message, setMessage] = useState('');

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
        setMessage('');
        
        if (!address || !recipientAddress || !amount || decimals === undefined || currentAllowance === undefined || !chainId) {
            setMessage('Please fill all fields and ensure wallet is connected.');
            return;
        }
        
        if (!isAddress(recipientAddress)) {
            setMessage('Invalid recipient address');
            return;
        }

        setIsProcessing(true);
        let approveTxHash: `0x${string}` | undefined = undefined;

        try {
            const amountInBaseUnit = parseUnits(amount, decimals);

            // 1. Check allowance and approve if needed
            if (currentAllowance < amountInBaseUnit) {
                setMessage('Approving tokens...');
                approveTxHash = await approveAsync({
                    address: IDRX_TOKEN_ADDRESS,
                    abi: erc20Abi,
                    functionName: 'approve',
                    args: [idrxPayConfig.address, maxUint256],
                });
                
                const approveReceipt = await waitForTransactionReceipt(config, { hash: approveTxHash, chainId });
                if (approveReceipt.status !== 'success') {
                    throw new Error('Approval failed');
                }
                
                await refetchAllowance(); 
            }

            // 2. Send the tokens
            setMessage('Sending tokens...');
            const sendTxHash = await sendAsync({
                ...idrxPayConfig,
                functionName: 'sendIDRX',
                args: [recipientAddress as `0x${string}`, amountInBaseUnit],
            });
            
            const sendReceipt = await waitForTransactionReceipt(config, { hash: sendTxHash, chainId });
            if (sendReceipt.status !== 'success') {
                throw new Error('Send failed');
            }

            toast.success('Transaction completed! 🎉');
            setRecipientAddress('');
            setAmount('');
            setMessage('');

        } catch (err: any) {
            console.error('Transaction Error:', err);
            if (err.message.includes('rejected')) {
                setMessage('Transaction rejected');
                toast.error('Transaction rejected');
            } else {
                setMessage('Transaction failed');
                toast.error('Transaction failed');
            }
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
                        placeholder="eg.. 0.05"
                        step="any"
                        required
                    />
                </div>
                <Balance />

                {message && (
                    <div className={`text-sm ${message.includes('failed') || message.includes('rejected') || message.includes('Invalid') ? 'text-red-500' : 'text-blue-600'}`}>
                        {message}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading || !address || decimals === undefined}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Processing...' : 'Send Tokens'}
                </button>
            </form>
        </>
    );
} 