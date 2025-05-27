import type { Context } from 'hono'

// This is only needed if your records are DNS-encoded
function hexToBytes(hex: string): Uint8Array {
  if (hex.startsWith('0x')) hex = hex.slice(2)
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16)
  }
  return bytes
}

// This is only needed if your records are DNS-encoded
function dnsDecode(encoded: string): string {
  // Check if the string looks like hex
  if (!/^(0x)?[0-9a-fA-F]+$/.test(encoded)) {
    // Not hex encoded, return as is
    return encoded;
  }

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

  try {
    const row = await c.env.DB.prepare(
      `SELECT * FROM ens_records WHERE LOWER(address) = ? LIMIT 1`
    ).bind(address.toLowerCase()).first()

    console.log("row:", row)

    if (!row) {
      console.log("No record found for address:", address)
      return c.json({ name: null })
    }

    if (!row.name || row.name.trim() === '') {
      console.log("Record found but name is empty for address:", address)
      return c.json({ name: null })
    }

    // Your records are likely already in plain text format
    // But check if they might be hex-encoded
    let ensName = row.name;
    if (/^(0x)?[0-9a-fA-F]+$/.test(row.name)) {
      console.log("Name appears to be hex-encoded, attempting to decode")
      ensName = dnsDecode(row.name);
    }

    console.log("Returning ENS name:", ensName, "for address:", address)
    return c.json({ name: ensName })
  } catch (error) {
    console.error("Error looking up ENS record:", error)
    return c.json({ error: 'Error fetching ENS record', details: (error as Error).message }, 500)
  }
}
