import type { Hex } from 'viem'

export interface Env {
    LISK_SEPOLIA_RPC_URL: string
    SIGNER_PRIVATE_KEY: Hex
}

// Loads env var from either `process.env` or Cloudflare's env object
export function envVar<T extends keyof Env>(
    key: T,
    env: Env | undefined
): Env[T] {
    // Check Cloudflare Workers environment first
    const cloudflareValue = env?.[key]
    if (cloudflareValue) return cloudflareValue as Env[T]

    // Then check Node.js environment (for local development)
    // Using typeof to avoid runtime errors in Cloudflare Workers environment
    const nodeValue = typeof process !== 'undefined' ? process?.env?.[key] : undefined
    if (nodeValue) return nodeValue as Env[T]

    throw new Error(`Environment variable ${key} is not set`)
}