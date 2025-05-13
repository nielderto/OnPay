"use client"
import React, { useEffect, useState } from "react";
import Logout from "./buttons/Logout";
import { lookupENSName } from "@/lib/ens-service";

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
    async function fetchENSName() {
      // Start loading
      if (isMounted) setIsLoading(true);
      // If no address provided, skip lookup
      if (!address) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const name = await lookupENSName(address);
        if (isMounted) setEnsName(name);
      } catch (error) {
        console.error("Error fetching ENS name:", error);
      } finally {
        if (isMounted) setIsLoading(false);
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