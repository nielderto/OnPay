'use client'

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAccount } from 'wagmi';
import { isAddress } from 'viem';
import MetaTxProvider from './MetaTxProvider';
import { TransactionStatus } from './TransactionStatus';
import { RecipientInput } from './RecipientInput';
import { AmountInput } from './AmountInput';
import { BalanceDisplay } from './BalanceDisplay';
import { TransactionReceipt } from './TransactionReceipt';

type FormData = {
  recipientAddress: string;
  amount: string;
};

export default function SendForm() {
  const { address, isConnected } = useAccount();
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<{ recipientAddress: string; amount: string } | null>(null);

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      recipientAddress: '',
      amount: '',
    },
  });

  const recipientAddress = watch('recipientAddress');
  const amount = watch('amount');
  const isValidAddress = isAddress(recipientAddress);
  const isOwnAddress = recipientAddress.toLowerCase() === address?.toLowerCase();
  const numAmount = parseFloat(amount);
  const hasAmountError = !isNaN(numAmount) && numAmount < 0.0001;

  const handleAddressChange = (newAddress: string) => {
    setValue('recipientAddress', newAddress, { shouldValidate: true });
  };

  const handleAmountChange = (value: string) => {
    if (/^\d*\.?\d*$/.test(value)) {
      setValue('amount', value, { shouldValidate: true });
    }
  };

  const handleProcessingChange = (processing: boolean) => {
    setIsProcessing(processing);
  };

  const handleTransactionSuccess = () => {
    setTransactionStatus('success');
    setLastTransaction({ recipientAddress, amount });
    setShowReceipt(true);
    reset();
  };

  const handleTransactionError = (error: string) => {
    setTransactionStatus('error');
    setErrorMessage(error);
  };

  const onSubmit = (data: FormData) => {
    if (!isValidAddress || hasAmountError) {
      setTransactionStatus('error');
      setErrorMessage('Please fix the form errors before submitting');
      return;
    }
    // The MetaTxProvider will handle the actual transaction
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center p-4 sm:p-8 bg-white rounded-lg shadow-md">
        <p className="text-gray-600 text-base sm:text-lg">Please connect your wallet to send tokens</p>
      </div>
    );
  }

  return (
    <div>
      {showReceipt && lastTransaction && (
        <TransactionReceipt
          recipientAddress={lastTransaction.recipientAddress}
          amount={lastTransaction.amount}
          onClose={() => setShowReceipt(false)}
        />
      )}
      <div className="flex flex-col items-center justify-center p-4 relative">
        {/* Background elements */}
        <div className="fixed inset-0 z-[-1]">
          {/* Hexagon grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15L30 0z' fillRule='evenodd' stroke='%230000FF' strokeWidth='2' fill='none'/%3E%3C/svg%3E")`,
              backgroundSize: "60px 60px",
            }}
          />
        </div>
      </div>
      
      <div>
        <TransactionStatus 
          status={transactionStatus} 
          errorMessage={errorMessage} 
        />
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
          <RecipientInput
            value={recipientAddress}
            onChange={handleAddressChange}
            isValid={isValidAddress}
            isOwnAddress={isOwnAddress}
            isProcessing={isProcessing}
          />

          <AmountInput
            value={amount}
            onChange={handleAmountChange}
            hasError={hasAmountError}
            isProcessing={isProcessing}
          />

          <BalanceDisplay />

          {isValidAddress && amount && parseFloat(amount) > 0 && !hasAmountError && (
            <div className="mt-4 sm:mt-6 p-3 sm:p-5 bg-blue-50 rounded-lg border border-blue-100">
              <MetaTxProvider
                recipientAddress={recipientAddress}
                amount={amount}
                decimals={18}
                onProcessingChange={handleProcessingChange}
                onSuccess={handleTransactionSuccess}
                onError={handleTransactionError}
              />
            </div>
          )}
        </form>
      </div>
    </div>
  );
}