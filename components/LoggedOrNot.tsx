'use client'
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoggedOrNot() {
  const { isConnected } = useAccount();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (isConnected) {
        router.push('/homepage');
      } else {
        router.push('/login');
      }
    }
  }, [isConnected, router, mounted]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse text-gray-500">
        {isConnected ? 'Redirecting to homepage...' : 'Redirecting to login...'}
      </div>
    </div>
  );
}