interface RecipientInputProps {
  value: string;
  onChange: (value: string) => void;
  isValid: boolean;
  isOwnAddress: boolean;
  isProcessing: boolean;
}

export function RecipientInput({ 
  value, 
  onChange, 
  isValid, 
  isOwnAddress, 
  isProcessing 
}: RecipientInputProps) {
  const showError = (value && !isValid) || isOwnAddress;
  const addressErrorMessage = isOwnAddress 
    ? "You cannot send tokens to your own wallet" 
    : "Please enter a valid Ethereum address";

  return (
    <div>
      <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
        Recipient Address
      </label>
      <input
        id="recipient"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0x..."
        className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
          showError
            ? 'border-red-500 focus:ring-red-500 bg-red-50'
            : 'border-gray-300 focus:ring-blue-500'
        }`}
        disabled={isProcessing}
      />
      {showError && (
        <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-500 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {addressErrorMessage}
        </p>
      )}
    </div>
  );
} 