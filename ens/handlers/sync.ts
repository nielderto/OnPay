import { Context } from 'hono'

export async function syncENSRecord(c: Context): Promise<Response> {
  try {
    const { name, address } = await c.req.json<{ name: string; address: string }>()

    if (!name || !address) {
      return c.json({ error: 'Missing name or address' }, 400)
    }

    await c.env.DB.prepare(
      `INSERT OR REPLACE INTO ens_records (name, address) VALUES (?, ?)`
    ).bind(name, address).run()

    return c.json({ success: true })
  } catch (err) {
    return c.json({ error: (err as Error).message }, 500)
  }
}