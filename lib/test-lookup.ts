const GATEWAY_URL = 'https://ens-gateway.onpaylisk.workers.dev'
const TEST_ADDRESS = '<your address here>'

function dnsDecode(encoded: string): string {
  if (encoded.startsWith('0x')) encoded = encoded.slice(2)

  let i = 0
  let name = ''

  while (i < encoded.length) {
    const len = parseInt(encoded.slice(i, i + 2), 16)
    if (len === 0) break

    const part = Buffer.from(encoded.slice(i + 2, i + 2 + len * 2), 'hex').toString()
    name += name ? '.' + part : part
    i += 2 + len * 2
  }

  return name
}

async function testReverseENSLookup(address: string) {
  console.log(`🔍 Looking up ENS name for address: ${address}`)

  try {
    const res = await fetch(`${GATEWAY_URL}/api/ens-lookup/${address}`)

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`HTTP ${res.status} – ${errText}`)
    }

    const data = await res.json()
    const rawName = data.name || null
    console.log(data)
    console.log(rawName)

    if (rawName) {
      const decoded = dnsDecode(rawName)
      console.log(`✅ Found ENS name: ${decoded} (raw: ${rawName})`)
    } else {
      console.log(`❌ No ENS name found for address ${address}`)
    }
  } catch (err: any) {
    console.error(`💥 Lookup failed: ${err.message}`)
  }
}

testReverseENSLookup(TEST_ADDRESS)
