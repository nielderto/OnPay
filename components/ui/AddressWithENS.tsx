'use client'
import { useQuery } from '@tanstack/react-query';
import { lookupENSName } from '../../lib/ens-service';

// Remove the manual cache since React Query will handle caching
interface AddressWithENSProps {
  address: string;
}

function isValidEthAddress(address: string | undefined): boolean {
  return typeof address === 'string' && /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Custom hook for ENS lookup with optimized caching
const useENSName = (address: string) => {
  return useQuery<string | null>({
    queryKey: ['ensName', address],
    queryFn: () => lookupENSName(address),
    enabled: isValidEthAddress(address),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * (attemptIndex + 1), 2000),
  });
};

export const AddressWithENS = ({ address }: AddressWithENSProps) => {
  const shortAddress =
    typeof address === 'string' && address.length >= 10
      ? `${address.slice(0, 6)}...${address.slice(-4)}`
      : address;

  if (!isValidEthAddress(address)) {
    // Show the short address as fallback
    return <span className="font-mono text-gray-400">{shortAddress}</span>;
  }

  const { data: ensName, isLoading } = useENSName(address);
  const displayName =
    ensName && typeof ensName === 'string' && ensName.endsWith('.lisk.eth')
      ? ensName.replace(/\.lisk\.eth$/, '')
      : ensName;

  return (
    <span className="font-mono">
      {isLoading ? shortAddress : displayName ?? shortAddress}
    </span>
  );
}; 