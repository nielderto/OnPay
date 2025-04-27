'use client'

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { isAddress } from 'viem';
import MetaTxProvider from './MetaTxProvider';
import Balance from './Balance';
import toast from 'react-hot-toast';

export default function SendForm() {
  const { address, isConnected } = useAccount();
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isValidAddress, setIsValidAddress] = useState(false);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAddress = e.target.value;
    setRecipientAddress(newAddress);
    setIsValidAddress(isAddress(newAddress));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and one decimal point
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  if (!isConnected) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600">Please connect your wallet to send tokens</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Send IDRX</h2>
      
      <div className="mb-4">
        <Balance />
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-1">
            Recipient Address
          </label>
          <input
            id="recipient"
            type="text"
            value={recipientAddress}
            onChange={handleAddressChange}
            placeholder="0x..."
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              recipientAddress && !isValidAddress
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          {recipientAddress && !isValidAddress && (
            <p className="mt-1 text-sm text-red-500">Please enter a valid Ethereum address</p>
          )}
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount (IDRX)
          </label>
          <input
            id="amount"
            type="text"
            value={amount}
            onChange={handleAmountChange}
            placeholder="0.0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {isValidAddress && amount && parseFloat(amount) > 0 && (
          <MetaTxProvider
            recipientAddress={recipientAddress}
            amount={amount}
            decimals={18}
          />
        )}
      </div>
    </div>
  );
}