interface TransactionDetailsProps {
  amount: string;
}

export const TransactionDetails = ({ amount }: TransactionDetailsProps) => {
  return (
    <div className="text-sm text-gray-700 text-center mb-4">
      <p className="font-bold text-2xl">Transaction Details:</p>
      <div className="mt-2">
        <p>Recipient will receive: {amount} IDRX</p>
        <p>Transaction fee (1%): {(Number(amount) * 0.01).toFixed(2)} IDRX</p>
        <p className="font-bold">Total amount to pay: {(Number(amount) * 1.01).toFixed(2)} IDRX</p>
      </div>
    </div>
  );
}; 