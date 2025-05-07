interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  hasError: boolean;
  isProcessing: boolean;
}

export function AmountInput({ value, onChange, hasError, isProcessing }: AmountInputProps) {
  return (
    <div>
      <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
        Amount (IDRX)
      </label>
      <input
        id="amount"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0.0"
        className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
          hasError ? 'border-red-500 focus:ring-red-500 bg-red-50' : 'border-gray-300'
        }`}
        disabled={isProcessing}
      />
      {hasError && (
        <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-500">Amount must be at least 0.0001 IDRX</p>
      )}
    </div>
  );
} 