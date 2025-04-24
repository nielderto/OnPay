'use client';

import { useState } from 'react';
import xellar from '../lib/xellar-sdk';
import { toast } from 'react-hot-toast';
import { useAccount } from 'wagmi';

interface CreateOnRampRequest {
  receiverWalletAddress: string;
  acceptanceMethod: string;
  paymentPhoneNumber: string;
  inputAmount: number;
  inputCurrency: string;
  outputCurrency: string;
  reason: string;
  description: string;
  rampableAccessToken: string;
}

export default function CreateOnRamp() {
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateOnRampRequest>({
    receiverWalletAddress: address || '',
    acceptanceMethod: 'virtual_account_bni',
    paymentPhoneNumber: '', 
    inputAmount: 0,
    inputCurrency: 'IDR',
    outputCurrency: 'idrx',
    reason: 'Buy IDRX', 
    description: 'Buying IDRX tokens', 
    rampableAccessToken: process.env.NEXT_PUBLIC_XELLAR_RAMPABLE_ACCESS_TOKEN || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'inputAmount' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }
    setLoading(true);

    try {
      const transaction = await xellar.onRamp.create({
        ...formData,
        receiverWalletAddress: address,
      });
      toast.success('Onramp transaction created successfully!');
      console.log('Transaction:', transaction);
    } catch (error) {
      console.error('Error creating onramp:', error);
      toast.error('Failed to create onramp transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Buy IDRX</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Amount (IDR)</label>
          <input
            type="number"
            name="inputAmount"
            value={formData.inputAmount}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
            min="0"
            step="1000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Payment Method</label>
          <select
            name="acceptanceMethod"
            value={formData.acceptanceMethod}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          >
            <option value="virtual_account_bni">BNI Virtual Account</option>
            <option value="virtual_account_bca">BCA Virtual Account</option>
            <option value="virtual_account_mandiri">Mandiri Virtual Account</option>
          </select>
          <p className="text-sm text-gray-500 mt-1">
            You will receive a virtual account number to make your payment
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !address}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {!address ? 'Connect Wallet First' : loading ? 'Creating...' : 'Buy IDRX'}
        </button>
      </form>
    </div>
  );
}
