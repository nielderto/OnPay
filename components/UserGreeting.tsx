"use client"
import React, { useEffect, useState } from "react";
import Logout from "./buttons/Logout";
import { lookupENSName } from "@/lib/ens-service";

interface UserGreetingProps {
  username: string;
  address: string; // Add address prop
}

export default function UserGreeting({ username, address }: UserGreetingProps) {
  const [ensName, setEnsName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchENSName() {
      if (!address) return;
      
      try {
        const name = await lookupENSName(address);
        setEnsName(name);
      } catch (error) {
        console.error("Error fetching ENS name:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchENSName();
  }, [address]);

  return (
    <div className="flex items-center justify-between w-full max-w-[55rem] px-4 sm:px-6 mb-2 lg:mb-0">
      <div className="flex items-center gap-2">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold">
          {username.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <div className="text-gray-500 text-sm">Welcome back,</div>
          <div className="font-bold text-xl">
            {isLoading ? (
              "Loading..."
            ) : ensName ? (
              ensName
            ) : (
              username
            )}
          </div>
        </div>
      </div>
      <Logout />
    </div>
  );
} 