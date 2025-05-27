import type { HonoRequest } from 'hono'
import type { Env } from '../env'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1),
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
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

    const { name, address } = parsed.data

    // Store the ENS record
    await env.DB.prepare(
      `INSERT OR REPLACE INTO ens_records (name, address) VALUES (?, ?)`
    ).bind(name, address).run()

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
