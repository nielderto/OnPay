import CircularProgress from '@/components/ui/CircularProgress';

interface TransactionActionsProps {
  isLoading: boolean;
  isApproving: boolean;
  isApproved: boolean;
  hasEnoughTokens: boolean;
  nonceError: string | null;
  onApprove: () => void;
  onSend: () => void;
}

export const TransactionActions = ({
  isLoading,
  isApproving,
  isApproved,
  hasEnoughTokens,
  nonceError,
  onApprove,
  onSend
}: TransactionActionsProps) => {
  return (
    <div className="mb-2">
      <button
        onClick={isApproved ? onSend : onApprove}
        disabled={isLoading || (isApproved && !hasEnoughTokens)}
        className={`w-full py-2 px-4 rounded-md text-white font-medium ${isLoading || (isApproved && !hasEnoughTokens)
            ? 'bg-gray-400 cursor-not-allowed'
            : isApproved
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-yellow-600 hover:bg-yellow-700'
          }`}
      >
        {isLoading
          ? <CircularProgress />
          : isApproving
            ? <CircularProgress />
            : isApproved
              ? 'Send IDRX'
              : 'Approve'
        }
      </button>

      {!hasEnoughTokens && (
        <p className="mt-2 text-sm text-red-500 text-center">
          Insufficient IDRX balance for this transaction (includes 1% fee)
        </p>
      )}

      {nonceError && (
        <p className="mt-2 text-sm text-red-500 text-center">
          {nonceError}
        </p>
      )}
    </div>
  );
}; 