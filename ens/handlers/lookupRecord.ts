import type { Context } from 'hono'

function hexToBytes(hex: string): Uint8Array {
    if (hex.startsWith('0x')) hex = hex.slice(2)
    const bytes = new Uint8Array(hex.length / 2)
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16)
    }
    return bytes
}
  
function dnsDecode(encoded: string): string {
    const bytes = hexToBytes(encoded)
    let i = 0
    let name = ''
  
    while (i < bytes.length) {
      const len = bytes[i]
      if (len === 0) break
      const part = new TextDecoder().decode(bytes.slice(i + 1, i + 1 + len))
      name += name ? '.' + part : part
      i += len + 1
    }
  
    return name
}
  

export async function lookupENSRecord(c: Context): Promise<Response> {
  const address = c.req.param('address')?.toLowerCase()

  console.log('address:', address)
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return c.json({ error: 'Invalid address' }, 400)
  }

  const row = await c.env.DB.prepare(
    `SELECT * FROM ens_records WHERE LOWER(address) = ? LIMIT 1`
  ).bind(address.toLowerCase()).first()

  console.log("row:", row)

  if (!row || !row.name) {
    console.log("No valid name found for address")
    return c.json({ name: null })
  }
  
  console.log("row:", row)
  console.log("raw name (hex):", row.name)
  
  if (!row.name) {
    console.log("Row found but name is null or undefined")
    return c.json({ name: null })
  }
  
  const decoded = dnsDecode(row.name)
  
  console.log("decoded name:", decoded)
  return c.json({ name: decoded })
}
