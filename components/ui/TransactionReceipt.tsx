import { X } from 'lucide-react';

interface TransactionReceiptProps {
  recipientAddress: string;
  amount: string;
  onClose: () => void;
}

export function TransactionReceipt({ recipientAddress, amount, onClose }: TransactionReceiptProps) {
  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white/95 backdrop-blur-md rounded-lg p-6 max-w-md w-full mx-4 relative shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
        
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Transaction Successful!</h3>
          <p className="text-gray-600">Your tokens have been sent successfully.</p>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Amount Sent</p>
            <p className="text-lg font-medium">{amount} ETH</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Recipient Username</p>
            <p className="text-sm font-mono break-all">{recipientAddress}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
} 