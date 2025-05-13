import { NextResponse } from 'next/server';
import { createPublicClient, http, getContract } from 'viem';
import { liskSepolia } from 'viem/chains';

// Create a singleton client to reuse across requests
const client = createPublicClient({
  chain: liskSepolia,
  transport: http()
});

// ERC20 ABI for balanceOf
const erc20Abi = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const IDRX_TOKEN = '0xD63029C1a3dA68b51c67c6D1DeC3DEe50D681661';

// Cache for balance results
const balanceCache = new Map<string, { balance: string; timestamp: number }>();
const CACHE_TTL = 10000; // 10 seconds

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 });
  }

  // Check cache first
  const cached = balanceCache.get(address);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json({
      formatted: cached.balance,
      value: cached.balance,
      cached: true
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
        'X-Cache': 'HIT'
      }
    });
  }

  try {
    try {
      const balance = await client.readContract({
        address: IDRX_TOKEN as `0x${string}`,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [address as `0x${string}`]
      });

      const balanceStr = balance.toString();
      
      // Update cache
      balanceCache.set(address, {
        balance: balanceStr,
        timestamp: Date.now()
      });

      const response = NextResponse.json({
        formatted: balanceStr,
        value: balanceStr,
        cached: false
      });

      response.headers.set('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=30');
      response.headers.set('X-Cache', 'MISS');
      
      return response;
    } catch (contractError) {
      console.error('Contract interaction error:', contractError);
      // Try getting native balance as fallback
      const nativeBalance = await client.getBalance({
        address: address as `0x${string}`
      });
      
      const balanceStr = nativeBalance.toString();
      
      // Update cache
      balanceCache.set(address, {
        balance: balanceStr,
        timestamp: Date.now()
      });

      const response = NextResponse.json({
        formatted: balanceStr,
        value: balanceStr,
        cached: false
      });
      
      response.headers.set('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=30');
      response.headers.set('X-Cache', 'MISS');
      return response;
    }
  } catch (error: any) {
    console.error('Detailed error:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack
    });
    return NextResponse.json({ 
      error: 'Failed to fetch balance',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
} 