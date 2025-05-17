import type { HonoRequest } from 'hono'
import type { Env } from '../env'
import { z } from 'zod'
import { createPublicClient, createWalletClient, http, recoverMessageAddress } from 'viem'
import { liskSepolia } from 'viem/chains'
import { L2Registrar } from '@/abi/L2Registrar'

const schema = z.object({
  name: z.string().min(1),
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  label: z.string().min(1),
  signature: z.string().regex(/^0x[a-fA-F0-9]{130}$/),
})

const publicClient = createPublicClient({
  chain: liskSepolia,
  transport: http(),
})

export async function registerENSRecord(
  req: HonoRequest,
  env: Env
): Promise<Response> {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { name, address, label, signature } = parsed.data

    // Verify the signature
    const messageHash = await publicClient.readContract({
      address: L2Registrar.address as `0x${string}`,
      abi: L2Registrar.abi,
      functionName: "getMessageHash",
      args: [address, label],
    }) as `0x${string}`

    const recoveredAddress = await recoverMessageAddress({
      message: { raw: messageHash },
      signature: signature as `0x${string}`,
    })

    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Execute the registration transaction
    const walletClient = createWalletClient({
      chain: liskSepolia,
      transport: http(),
      account: env.RELAYER_PRIVATE_KEY as `0x${string}`,
    })

    const txHash = await walletClient.writeContract({
      address: L2Registrar.address as `0x${string}`,
      abi: L2Registrar.abi,
      functionName: 'register',
      args: [label, address],
    })

    // Store the ENS record
    await env.DB.prepare(
      `INSERT OR REPLACE INTO ens_records (name, address) VALUES (?, ?)`
    ).bind(name, address).run()

    return new Response(
      JSON.stringify({ 
        success: true,
        txHash,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Error in registerENSRecord:', err)
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
