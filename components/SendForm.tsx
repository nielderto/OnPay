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
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleProcessingChange = (processing: boolean) => {
    setIsProcessing(processing);
  };

  const isOwnAddress = recipientAddress.toLowerCase() === address?.toLowerCase();
  const showError = (recipientAddress && !isValidAddress) || isOwnAddress;
  const errorMessage = isOwnAddress 
    ? "You cannot send tokens to your own wallet" 
    : "Please enter a valid Ethereum address";

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center p-4 sm:p-8 bg-white rounded-lg shadow-md">
        <p className="text-gray-600 text-base sm:text-lg">Please connect your wallet to send tokens</p>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-4 sm:space-y-5">
        <div>
          <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            Recipient Address
          </label>
          <input
            id="recipient"
            type="text"
            value={recipientAddress}
            onChange={handleAddressChange}
            placeholder="0x..."
            className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
              showError
                ? 'border-red-500 focus:ring-red-500 bg-red-50'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            disabled={isProcessing}
          />
          {showError && (
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-500 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errorMessage}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            Amount (IDRX)
          </label>
          <input
            id="amount"
            type="text"
            value={amount}
            onChange={handleAmountChange}
            placeholder="0.0"
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            disabled={isProcessing}
          />
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm sm:text-base">Available: </p>
          <Balance color="gray-400" />
        </div>

        {isValidAddress && amount && parseFloat(amount) > 0 && (
          <div className="mt-4 sm:mt-6 p-3 sm:p-5 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="text-base sm:text-lg font-medium text-blue-800 mb-2 sm:mb-3">Meta Transaction Flow</h3>
            <ol className="list-decimal list-inside text-xs sm:text-sm text-blue-700 space-y-1 sm:space-y-2 mb-3 sm:mb-4">
              <li className="pl-2">First, approve the IDRX token for the MetaTxForwarder contract</li>
              <li className="pl-2">Then, send the transaction without paying gas fees</li>
            </ol>
            <MetaTxProvider
              recipientAddress={recipientAddress}
              amount={amount}
              decimals={18}
              onProcessingChange={handleProcessingChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}