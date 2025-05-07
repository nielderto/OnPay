import Balance from '../data/Balance';

export function BalanceDisplay() {
  return (
    <div className="flex items-center gap-2">
      <p className="text-sm sm:text-base">Available: </p>
      <Balance color="gray-400" />
    </div>
  );
} 