// lib/syncENS.ts
import { createPublicClient, http, parseAbiItem } from 'viem'
import { liskSepolia } from 'viem/chains'
import { L2Registrar } from '../abi/L2Registrar'

const L2RegistrarAddress = L2Registrar.address as `0x${string}`
const SYNC_ENDPOINT = 'https://ens-gateway.onpaylisk.workers.dev/api/sync'

const client = createPublicClient({
    chain: liskSepolia,
    transport: http('https://rpc.sepolia-api.lisk.com'),
})

// Define event ABI for NameRegistered
const nameRegisteredEvent = parseAbiItem('event NameRegistered(string indexed label, address indexed owner)')

export async function syncENS() {
    console.log('🔍 Searching for NameRegistered events...')

    try {
        // Get logs directly instead of using createEventFilter
        const logs = await client.getLogs({
            address: L2RegistrarAddress,
            event: nameRegisteredEvent,
            fromBlock: BigInt(0),
            toBlock: 'latest'
        })

        console.log(`📦 Found ${logs.length} ENS registrations`)

        for (const log of logs) {
            // Safely access args
            if (!log.args) continue
            const { label, owner } = log.args

            if (!label || !owner) {
                console.warn('Missing event data', log)
                continue
            }

            console.log(`Syncing: ${label} → ${owner}`)

            try {
                const res = await fetch(SYNC_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: label, address: owner }),
                })

                if (!res.ok) {
                    const errorText = await res.text()
                    console.error(`❌ Failed to sync ${label}:`, errorText)
                }
            } catch (err) {
                console.error(`❌ Network error for ${label}:`, err)
            }
        }

        console.log('✅ Sync complete.')
    } catch (error) {
        console.error('❌ Error in syncENS:', error)
        throw error
    }
}
