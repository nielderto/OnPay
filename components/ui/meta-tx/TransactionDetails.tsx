interface TransactionDetailsProps {
  amount: string;
}

export const TransactionDetails = ({ amount }: TransactionDetailsProps) => {
  const fee = (Number(amount) * 0.01).toFixed(2);
  const total = (Number(amount) * 1.01).toFixed(2);

  return (
    <div className="p-4 bg-blue-50 rounded-lg space-y-2">
      <div>
        <h1 className="text-2xl font-bold">Transaction Details:</h1>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Amount:</span>
        <span className="font-medium">{amount} IDRX</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Fee (1%):</span>
        <span className="font-medium">{fee} IDRX</span>
      </div>
      <div className="flex justify-between text-sm font-semibold border-t pt-2 mt-2">
        <span className="text-gray-700">Total:</span>
        <span className="text-blue-600">{total} IDRX</span>
      </div>
    </div>
  );
}; 