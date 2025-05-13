'use client'
import { useState, useEffect } from 'react';
import { lookupENSName } from '../../lib/ens-service';

interface AddressWithENSProps {
  address?: string;
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
    lookupENSName(address)
      .then((name) => {
        if (isMounted) {
          setEnsName(name);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setEnsName(null);
          setIsLoading(false);
        }
      });
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
    <span>
      {isLoading ? shortAddress : displayName ?? shortAddress}
    </span>
  );
}; 