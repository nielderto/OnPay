'use client'

import { useMetaTx } from './meta-tx/useMetaTx';
import { TransactionDetails } from './meta-tx/TransactionDetails';
import { TransactionActions } from './meta-tx/TransactionActions';

interface MetaTxProviderProps {
  recipientAddress: string;
  amount: string;
  decimals: number;
  onProcessingChange?: (processing: boolean) => void;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function MetaTxProvider({ 
  recipientAddress, 
  amount, 
  decimals, 
  onProcessingChange, 
  onSuccess, 
  onError 
}: MetaTxProviderProps) {
  const {
    isLoading,
    isApproving,
    isApproved,
    hasEnoughTokens,
    nonceError,
    handleApprove,
    handleMetaTx,
    lastTransactionHash
  } = useMetaTx(recipientAddress, amount, decimals);

  const handleSend = async () => {
    try {
      const txHash = await handleMetaTx();
      if (txHash) {
        onSuccess?.();
      }
    } catch (error: any) {
      onError?.(error.message);
    }
  };

  return (
    <div className="mt-4 max-w-[55rem] mx-auto">
      <TransactionDetails amount={amount} />
      <TransactionActions
        isLoading={isLoading}
        isApproving={isApproving}
        isApproved={isApproved}
        hasEnoughTokens={hasEnoughTokens}
        nonceError={nonceError}
        onApprove={handleApprove}
        onSend={handleSend}
      />
    </div>
  );
} 