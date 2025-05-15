"use client"
import React, { useEffect, useState } from "react";
import Logout from "./buttons/Logout";
import { lookupENSName } from "@/lib/ens-service";

// Cache for ENS names
const ensNameCache = new Map<string, { name: string | null; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Function to clear the cache for a specific address
export const clearUserGreetingCache = (address?: string) => {
    if (address) {
        ensNameCache.delete(address);
    } else {
        ensNameCache.clear();
    }
};

interface UserGreetingProps {
  address: string;
}

export default function UserGreeting({ address }: UserGreetingProps) {
  const [ensName, setEnsName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Strip '.lisk.eth' suffix if present
  const strippedENS = ensName && ensName.endsWith(".lisk.eth")
    ? ensName.replace(/\.lisk\.eth$/, "")
    : ensName;
  // Fallback to shortened address when no ENS or still loading
  const nameToShow = !isLoading && strippedENS
    ? strippedENS
    : `${address.slice(0, 6)}...${address.slice(-4)}`;
  // Initials for avatar
  const initials = (strippedENS || address).slice(0, 2).toUpperCase();

  useEffect(() => {
    let isMounted = true;
    async function fetchENSName(retryCount = 0) {
      // Start loading
      if (isMounted) setIsLoading(true);
      // If no address provided, skip lookup
      if (!address) {
        if (isMounted) setIsLoading(false);
        return;
      }

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
    }

    fetchENSName();
    return () => {
      isMounted = false;
    };
  }, [address]);

  return (
    <div className="flex items-center justify-between w-full max-w-[55rem] px-4 sm:px-6 mb-2 lg:mb-0">
      <div className="flex items-center gap-2">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold">
          {initials}
        </div>
        <div>
          <div className="text-gray-500 text-sm">Welcome back,</div>
          <div className="font-bold text-xl">
            {isLoading ? "Loading..." : nameToShow}
          </div>
        </div>
      </div>
      <Logout />
    </div>
  );
} 