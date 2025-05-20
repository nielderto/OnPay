'use client'

import { useMetaTx } from './meta-tx/useMetaTx';
import { TransactionDetails } from './meta-tx/TransactionDetails';
import { TransactionActions } from './meta-tx/TransactionActions';
import { useState } from 'react';

interface MetaTxProviderProps {
  recipientAddress: string;
  amount: string;
  decimals: number;
  onProcessingChange?: (processing: boolean) => void;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  useCombinedButton?: boolean;
}

export default function MetaTxProvider({
  recipientAddress,
  amount,
  decimals,
  onProcessingChange,
  onSuccess,
  onError,
  useCombinedButton = true
}: MetaTxProviderProps) {
  const {
    isLoading,
    isApproving,
    isApproved,
    hasEnoughTokens,
    nonceError,
    handleApprove,
    handleMetaTx,
    handleApproveAndSend,
    lastTransactionHash
  } = useMetaTx(recipientAddress, amount, decimals);

  const handleSend = async () => {
    try {
      const txHash = await handleMetaTx();
      if (txHash && typeof txHash === 'string' && txHash.startsWith('0x')) {
        console.log("Transaction successful with hash:", txHash);
        onSuccess?.();
      } else {
        console.error("Transaction did not return a valid hash");
        onError?.("Transaction did not complete successfully");
      }
    } catch (error: any) {
      console.error("Transaction failed:", error);
      onError?.(error.message);
    }
  };

  const handleCombined = async () => {
    try {
      const txHash = await handleApproveAndSend();
    } catch (error: any) {
      console.error("Combined transaction failed:", error);
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
        onApproveAndSend={handleCombined}
        useCombinedButton={useCombinedButton}
      />
    </div>
  );
} 