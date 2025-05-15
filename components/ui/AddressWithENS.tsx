'use client'
import { useState, useEffect } from 'react';
import { lookupENSName } from '../../lib/ens-service';

// Cache for ENS names
const ensNameCache = new Map<string, { name: string | null; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Function to clear the cache for a specific address
export const clearENSCache = (address?: string) => {
    if (address) {
        ensNameCache.delete(address);
    } else {
        ensNameCache.clear();
    }
};

interface AddressWithENSProps {
  address: string;
}

export const AddressWithENS = ({ address }: AddressWithENSProps) => {
  const [ensName, setEnsName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!address) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    const fetchENSName = async (retryCount = 0) => {
      try {
        // Check cache first
        const cached = ensNameCache.get(address);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          if (isMounted) {
            setEnsName(cached.name);
            setIsLoading(false);
          }
          return;
        }

        const name = await lookupENSName(address);
        
        // Update cache
        ensNameCache.set(address, { name, timestamp: Date.now() });

        if (isMounted) {
          setEnsName(name);
          setIsLoading(false);
        }
      } catch (error) {
        console.error(`Error fetching ENS name (attempt ${retryCount + 1}):`, error);
        
        if (retryCount < MAX_RETRIES) {
          // Retry after delay
          setTimeout(() => fetchENSName(retryCount + 1), RETRY_DELAY * (retryCount + 1));
        } else {
          if (isMounted) {
            setEnsName(null);
            setIsLoading(false);
          }
        }
      }
    };

    fetchENSName();

    return () => {
      isMounted = false;
    };
  }, [address]);
  
  if (!address) {
    return <span>Unknown Address</span>;
  }

  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
  const displayName = ensName && ensName.endsWith('.lisk.eth') ? ensName.replace(/\.lisk\.eth$/, '') : ensName;

  return (
    <span className="font-mono">
      {isLoading ? shortAddress : displayName ?? address}
    </span>
  );
}; 