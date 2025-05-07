'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import axios from 'axios';

const BANK_OPTIONS = [
  { code: '002', name: 'Bank Central Asia (BCA)' },
  { code: '014', name: 'Bank Bukopin' },
  { code: '200', name: 'Bank Tabungan Negara (BTN)' },
];

const MIN_TRANSACTION = 20000;
const MAX_TRANSACTION = 1000000000;

const CreateOnRamp: React.FC = () => {
  const { address } = useAccount();
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

  return (
    <div className="flex flex-col items-center justify-center p-4 relative">
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

      <div className="max-w-md mx-auto p-4 bg-white shadow-md rounded">
        <h1 className="text-xl font-semibold mb-4">Create OnRamp</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Bank Code</label>
            <select
              name="bankCode"
              value={formData.bankCode}
              onChange={handleInputChange}
              className="w-full border rounded p-2"
            >
              {BANK_OPTIONS.map(bank => (
                <option key={bank.code} value={bank.code}>
                  {bank.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">Bank Account Number</label>
            <input
              type="text"
              name="bankAccountNumber"
              value={formData.bankAccountNumber}
              onChange={handleInputChange}
              className="w-full border rounded p-2"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Mint Amount (IDR)</label>
            <input
              type="number"
              name="mintAmount"
              value={formData.mintAmount}
              onChange={handleInputChange}
              className="w-full border rounded p-2"
              required
            />
            {amountError && <p className="text-red-600 text-sm mt-1">{amountError}</p>}
          </div>

          <div>
            <label className="block font-medium mb-1">Wallet Address</label>
            <input
              type="text"
              name="walletAddress"
              value={formData.walletAddress}
              onChange={handleInputChange}
              className="w-full border rounded p-2"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Submit'}
          </button>

          {message && <p className="text-green-600 mt-2">{message}</p>}
          {error && <p className="text-red-600 mt-2">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default CreateOnRamp;
