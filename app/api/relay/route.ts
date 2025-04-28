import { NextResponse } from 'next/server';
import { createWalletClient, http, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { liskSepolia } from 'viem/chains';
import { metaTxForward } from '@/abi/metatxfoward';

const relayerPrivateKey = process.env.RELAYER_PRIVATE_KEY;

if (!relayerPrivateKey) {
  throw new Error('RELAYER_PRIVATE_KEY is not set in environment variables');
}

const relayerAccount = privateKeyToAccount(process.env.RELAYER_PRIVATE_KEY as `0x${string}`);
console.log(relayerAccount.address);

const walletClient = createWalletClient({
  account: relayerAccount,
  chain: liskSepolia,
  transport: http(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { from, to, amount, targetContract, nonce, signature } = body;

    // Validate inputs
    if (!from || !to || !amount || !targetContract || !nonce || !signature) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    console.log('Relay request received:', {
      from,
      to,
      amount,
      targetContract,
      nonce,
      signatureLength: signature.length,
    });

    console.log('About to send meta-tx with args:', { from, to, amount, targetContract, signature });
    const txHash = await walletClient.writeContract({
      address: metaTxForward.address as `0x${string}`,
      abi: metaTxForward.abi,
      functionName: 'executeMetaTransaction',
      args: [from, to, BigInt(amount), targetContract, signature],
    });
    console.log('Meta-tx sent! Hash:', txHash);
    return NextResponse.json({ txHash, success: true });
  } catch (error: any) {
    console.error('Error in relay endpoint:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to execute meta transaction',
        success: false,
      },
      { status: 500 }
    );
  }
}