'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { createSignature } from '@/app/api/transaction/createSignature';
import { useAccount } from 'wagmi';
import Image from 'next/image';
import { Divide } from 'lucide-react';

interface BankAccount {
    bankCode: string;
    bankAccountNumber: string;
}
const BANK_OPTIONS = [
    { code: '002', name: 'Bank Central Asia (BCA)' },
    { code: '014', name: 'Bank Bukopin' },
    { code: '200', name: 'Bank Tabungan Negara (BTN)' }
];
// Transaction limits
const MIN_TRANSACTION = 20000; // 20,000 IDR
const MAX_TRANSACTION = 1000000000; // 1,000,000,000 IDR
const CreateOnRamp: React.FC = () => {
    const { address } = useAccount();
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const [newBankAccount, setNewBankAccount] = useState<BankAccount>({
        bankCode: '',
        bankAccountNumber: ''
    });
    const [mintAmount, setMintAmount] = useState<string>('');
    const [walletAddress, setWalletAddress] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [amountError, setAmountError] = useState<string>('');
    // Validate amount when it changes
    useEffect(() => {
        if (!mintAmount) {
            setAmountError('');
            return;
        }
        const amount = parseInt(mintAmount.replace(/\D/g, ''), 10);

        if (isNaN(amount)) {
            setAmountError('Please enter a valid number');
            return;
        }

        if (amount < MIN_TRANSACTION) {
            setAmountError(`Minimum transaction amount is ${MIN_TRANSACTION.toLocaleString()} IDR`);
            return;
        }

        if (amount > MAX_TRANSACTION) {
            setAmountError(`Maximum transaction amount is ${MAX_TRANSACTION.toLocaleString()} IDR`);
            return;
        }

        setAmountError('');
    }, [mintAmount]);
    // Format amount as user types
    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        setMintAmount(value);
    };
    const handleAddBankAccount = async () => {
        if (!newBankAccount.bankCode || !newBankAccount.bankAccountNumber) {
            setError('Please fill in all bank account fields');
            return;
        }
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const apiKey = process.env.IDRX_API_KEY;
            const secret = process.env.IDRX_SECRET_KEY;
            if (!apiKey || !secret) {
                throw new Error('API key or secret key is not set');
            }
            const path = "https://idrx.co/api/auth/add-bank-account";
            const req = {
                bankAccountNumber: newBankAccount.bankAccountNumber,
                bankCode: newBankAccount.bankCode,
            };

            const bufferReq = Buffer.from(JSON.stringify(req), 'base64').toString('utf8');
            const timestamp = Math.round((new Date()).getTime()).toString();
            const sig = createSignature('POST', path, bufferReq, timestamp, secret);
            const res = await axios.post(path, req, {
                headers: {
                    'Content-Type': 'application/json',
                    'idrx-api-key': apiKey,
                    'idrx-api-sig': sig,
                },
            });
            setBankAccounts([...bankAccounts, newBankAccount]);
            setNewBankAccount({ bankCode: '', bankAccountNumber: '' });
            setMessage(`Bank account added successfully: ${res.data.message || 'Success'}`);
        } catch (err: any) {
            setError(`Error adding bank account: ${err.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };
    const handleMintRequest = async () => {
        if (!mintAmount || !walletAddress) {
            setError('Please fill in all mint request fields');
            return;
        }
        const amount = parseInt(mintAmount, 10);

        if (isNaN(amount) || amount < MIN_TRANSACTION || amount > MAX_TRANSACTION) {
            setError('Please enter a valid amount within the allowed range');
            return;
        }
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const apiKey = process.env.IDRX_API_KEY;
            const secret = process.env.IDRX_SECRET_KEY;
            if (!apiKey || !secret) {
                throw new Error('API key or secret key is not set');
            }
            const path = "https://idrx.co/api/transaction/mint-request";
            const req = {
                toBeMinted: amount.toString(),
                destinationWalletAddress: walletAddress,
                expiryPeriod: 3600, // 1 hour
                networkChainId: "2026", // Lisk Mainnet
                requestType: "idrx", // 'idrx' or empty to receive IDRX, 'usdt' to receive USDT
            };

            const bufferReq = Buffer.from(JSON.stringify(req), 'base64').toString('utf8');
            const timestamp = Math.round((new Date()).getTime()).toString();
            const sig = createSignature('POST', path, bufferReq, timestamp, secret);
            const res = await axios.post(path, req, {
                headers: {
                    'Content-Type': 'application/json',
                    'idrx-api-key': apiKey,
                    'idrx-api-sig': sig,
                },
            });
            setMessage(`Mint request successful: ${res.data.message || 'Success'}`);
            setMintAmount('');
            setWalletAddress('');
        } catch (err: any) {
            setError(`Error with mint request: ${err.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="container mx-auto p-4 max-w-4xl min-h-screen flex flex-col items-center justify-center">
            <div className="flex flex-col items-center justify-center mb-6 sm:mb-8 lg:hidden:fixed top-0 left-0 right-0 z-10 p-4 border-b">
                <div className="flex flex-row gap-4 items-center justify-center">
                    <Image src="./idrx.svg" alt="IDRX image" width={40} height={40} />
                    <h1 className="text-xl md:text-2xl font-bold">Topup IDRX</h1>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4">
                {/* Bank Account Section */}
                <div className="bg-white p-4 md:p-6 rounded-lg shadow-md w-full lg:w-1/2 lg:hidden:mt-20">
                    <h2 className="text-lg md:text-xl font-semibold mb-4">Add Bank Account</h2>

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Bank</label>
                        <select
                            className="w-full p-2 border rounded h-10"
                            value={newBankAccount.bankCode}
                            onChange={(e) => setNewBankAccount({ ...newBankAccount, bankCode: e.target.value })}
                        >
                            <option value="">Select a bank</option>
                            {BANK_OPTIONS.map(bank => (
                                <option key={bank.code} value={bank.code}>
                                    {bank.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Account Number</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded h-10"
                            value={newBankAccount.bankAccountNumber}
                            onChange={(e) => setNewBankAccount({ ...newBankAccount, bankAccountNumber: e.target.value })}
                            placeholder="Enter bank account number"
                        />
                    </div>

                    <button
                        className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 h-10 mt-6"
                        onClick={handleAddBankAccount}
                        disabled={loading}
                    >
                        {loading ? 'Adding...' : 'Add Bank Account'}
                    </button>
                </div>

                {/* Mint Request Section */}
                <div className="bg-white p-4 md:p-6 rounded-lg shadow-md w-full lg:w-1/2">
                    <h2 className="text-lg md:text-xl font-semibold mb-4">Create Mint Request</h2>

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Amount to Mint (IDR)</label>
                        <div className="relative">
                            <input
                                type="text"
                                className={`w-full p-2 border rounded h-10 ${amountError ? 'border-red-500' : ''}`}
                                value={mintAmount ? parseInt(mintAmount).toLocaleString() : ''}
                                onChange={handleAmountChange}
                                placeholder="Enter amount to mint"
                            />
                            <div className="absolute right-3 top-2 text-gray-500">IDR</div>
                        </div>
                        {amountError && (
                            <p className="text-red-500 text-sm mt-1">{amountError}</p>
                        )}
                        <p className="text-gray-500 text-sm mt-1">
                            Min: {MIN_TRANSACTION.toLocaleString()} IDR | Max: {MAX_TRANSACTION.toLocaleString()} IDR
                        </p>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Wallet Address</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded h-10"
                            value={walletAddress || address}
                            onChange={(e) => setWalletAddress(e.target.value)}
                            placeholder="Enter destination wallet address"
                        />
                    </div>

                    <button
                        className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 h-10"
                        onClick={handleMintRequest}
                        disabled={loading || !!amountError}
                    >
                        {loading ? 'Processing...' : 'Create Mint Request'}
                    </button>
                </div>
            </div>

            {/* Bank Accounts List */}
            {bankAccounts.length > 0 && (
                <div className="mt-4 bg-white p-4 md:p-6 rounded-lg shadow-md">
                    <h2 className="text-lg md:text-xl font-semibold mb-4">Your Bank Accounts</h2>
                    <ul className="divide-y">
                        {bankAccounts.map((account) => (
                            <li key={`${account.bankCode}-${account.bankAccountNumber}-${Date.now()}`} className="py-2">
                                <span className="font-medium">
                                    {BANK_OPTIONS.find(bank => bank.code === account.bankCode)?.name || account.bankCode}
                                </span>
                                <span className="ml-2 text-gray-600">{account.bankAccountNumber}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Messages */}
            {message && (
                <div className="mt-4 p-3 bg-green-100 text-green-800 rounded mb-16">
                    {message}
                </div>
            )}

            {error && (
                <div className="mt-4 p-3 bg-red-100 text-red-800 rounded mb-16">
                    {error}
                </div>
            )}
        </div>
    );
};
export default CreateOnRamp;
