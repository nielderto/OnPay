import { AnimatedList } from "@/components/magicui/animated-list";

interface TransactionStatusProps {
  status: 'idle' | 'success' | 'error';
  errorMessage?: string;
}

export function TransactionStatus({ status, errorMessage }: TransactionStatusProps) {
  if (status === 'idle') return null;

  return (
    <AnimatedList className="mb-4">
      {status === 'success' && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg shadow-sm">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-green-800 font-medium">Transaction successful!</p>
          </div>
        </div>
      )}
      {status === 'error' && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg shadow-sm">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <p className="text-red-800 font-medium">{errorMessage}</p>
          </div>
        </div>
      )}
    </AnimatedList>
  );
} 