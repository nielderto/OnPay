'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import axios from 'axios';
import { lookupENSName } from '@/lib/ens-service';

const BANK_OPTIONS = [
  { code: '002', name: 'Bank Central Asia (BCA)' },
  { code: '014', name: 'Bank Bukopin' },
  { code: '200', name: 'Bank Tabungan Negara (BTN)' },
];

const MIN_TRANSACTION = 20000;
const MAX_TRANSACTION = 1000000000;

const CreateOnRamp: React.FC = () => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [formData, setFormData] = useState({
    bankCode: '002',
    bankAccountNumber: '',
    mintAmount: '',
    walletAddress: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [amountError, setAmountError] = useState('');
  const [ensLoading, setEnsLoading] = useState(false);

  useEffect(() => {
    if (!formData.mintAmount) return setAmountError('');

    const amount = parseInt(formData.mintAmount.replace(/\D/g, ''), 10);
    if (isNaN(amount)) return setAmountError('Please enter a valid number');
    if (amount < MIN_TRANSACTION) return setAmountError(`Minimum amount is ${MIN_TRANSACTION.toLocaleString()} IDR`);
    if (amount > MAX_TRANSACTION) return setAmountError(`Maximum amount is ${MAX_TRANSACTION.toLocaleString()} IDR`);

    setAmountError('');
  }, [formData.mintAmount]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'mintAmount' ? value.replace(/\D/g, '') : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { bankCode, bankAccountNumber, mintAmount, walletAddress } = formData;
    const amount = parseInt(mintAmount, 10);

    if (!bankAccountNumber || !mintAmount || !walletAddress) return setError('Please fill in all fields');
    if (isNaN(amount) || amount < MIN_TRANSACTION || amount > MAX_TRANSACTION) return setError('Invalid amount');
    if (!walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) return setError('Invalid wallet address');
    if (!bankAccountNumber.match(/^\d+$/)) return setError('Bank account number must be numeric');

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await axios.post('/api/create-onramp', {
        bankCode,
        bankAccountNumber,
        mintAmount,
        walletAddress,
      });

      if (res.data.success) {
        setMessage(res.data.message || 'Transaction successful');
        setFormData({ bankCode: '002', bankAccountNumber: '', mintAmount: '', walletAddress: '' });
      } else {
        throw new Error(res.data.message || 'Failed to process transaction');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  const handleEnsLookup = async () => {
    if (!formData.walletAddress) {
      setError('Please enter a wallet address first');
      return;
    }

    setEnsLoading(true);
    setError('');

    try {
      const ensName = await lookupENSName(formData.walletAddress);
      if (ensName) {
        setFormData(prev => ({
          ...prev,
          walletAddress: ensName
        }));
      } else {
        setError('No ENS name found for this address');
      }
    } catch (err) {
      setError('Failed to fetch ENS name');
    } finally {
      setEnsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 relative">
      {/* Background */}
      <div className="fixed inset-0 z-[-1]">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15L30 0z' fillRule='evenodd' stroke='%230000FF' strokeWidth='2' fill='none'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="w-full max-w-2xl mx-auto p-8 bg-white shadow-xl rounded-xl">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Create OnRamp</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-lg font-semibold mb-2 text-gray-700">Bank Code</label>
            <select
              name="bankCode"
              value={formData.bankCode}
              onChange={handleInputChange}
              className="w-full border-2 border-gray-200 rounded-lg p-3 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            >
              {BANK_OPTIONS.map(bank => (
                <option key={bank.code} value={bank.code}>
                  {bank.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-lg font-semibold mb-2 text-gray-700">Bank Account Number</label>
            <input
              type="text"
              name="bankAccountNumber"
              value={formData.bankAccountNumber}
              onChange={handleInputChange}
              className="w-full border-2 border-gray-200 rounded-lg p-3 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-lg font-semibold mb-2 text-gray-700">Mint Amount (IDR)</label>
            <input
              type="number"
              name="mintAmount"
              value={formData.mintAmount}
              onChange={handleInputChange}
              className="w-full border-2 border-gray-200 rounded-lg p-3 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              required
            />
            {amountError && <p className="text-red-600 text-sm mt-2">{amountError}</p>}
          </div>

          <div>
            <label className="block text-lg font-semibold mb-2 text-gray-700">Recepient Username</label>
            <div className="flex gap-2">
              <input
                type="text"
                name="walletAddress"
                value={formData.walletAddress}
                onChange={handleInputChange}
                className="flex-1 border-2 border-gray-200 rounded-lg p-3 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                required
              />
              <button
                type="button"
                onClick={handleEnsLookup}
                disabled={ensLoading}
                className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {ensLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                    <span>ENS</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Submit'}
          </button>

          {message && <p className="text-green-600 text-lg mt-4 text-center">{message}</p>}
          {error && <p className="text-red-600 text-lg mt-4 text-center">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default CreateOnRamp;
