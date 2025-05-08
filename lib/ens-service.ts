import { ethers } from "ethers";
import { createPublicClient, http, encodeFunctionData, decodeFunctionResult, toHex, hexToBytes } from "viem";
import { sepolia } from "viem/chains";
import { normalize } from "viem/ens";
import { L1Resolver } from "@/abi/L1Resolver";
import { L2Registry } from "@/abi/L2Registry";

// Constants
const L1_RESOLVER_ADDRESS = L1Resolver.address; // Your L1 resolver on Sepolia
const L2_REGISTRY_ADDRESS = L2Registry.address; // Your L2 registry on Lisk
const ENS_GATEWAY_URL = "https://ens-gateway.onpaylisk.workers.dev"; // Your gateway URL

// Create a Viem public client for Sepolia
const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(),
});

/**
 * Convert a regular string to 0x-prefixed string
 */
function toHexString(value: string): `0x${string}` {
    if (value.startsWith('0x')) {
        return value as `0x${string}`;
    }
    return `0x${value}` as `0x${string}`;
}

/**
 * Calculate the namehash for an ENS name
 * @param name The ENS name
 * @returns The namehash as bytes32
 */
function namehash(name: string): `0x${string}` {
    let node = '0x0000000000000000000000000000000000000000000000000000000000000000';

    if (name) {
        const labels = normalize(name).split('.');

        for (let i = labels.length - 1; i >= 0; i--) {
            const labelHash = ethers.keccak256(ethers.toUtf8Bytes(labels[i]));
            node = ethers.keccak256(ethers.concat([node, labelHash].map(h => ethers.getBytes(h))));
        }
    }

    return node as `0x${string}`;
}

/**
 * Check if an ENS name is available
 * @param ensName The full ENS name (e.g., "username.lisk.eth")
 * @returns Promise<boolean> True if available, false if taken
 */
export async function checkENSNameAvailable(ensName: string): Promise<{ available: boolean; reason?: string }> {
    try {
        // In production environment, use actual resolver
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
            // Normalize the name
            const normalizedName = normalize(ensName);

            // Get the namehash
            const node = namehash(normalizedName);

            try {
                // Try to resolve the address - if it resolves, it's taken
                const address = await resolveENSName(normalizedName);
                return {
                    available: !address,
                    reason: address ? `${ensName} is already registered to ${address}` : undefined
                };
            } catch (error: any) {
                // If there's an error but it's not because the name doesn't exist, propagate it
                if (error?.message && !error.message.includes("not found")) {
                    throw error;
                }

                // Otherwise assume it's available
                return { available: true };
            }
        } else {
            // Development environment mock implementation
            // Normalize the name
            const normalizedName = normalize(ensName);

            // Split the name to get domain parts
            const parts = normalizedName.split(".");

            if (parts.length < 3 || parts[parts.length - 1] !== "eth" || parts[parts.length - 2] !== "lisk") {
                return {
                    available: false,
                    reason: "Invalid name format. Must be in the format username.lisk.eth"
                };
            }

            // Get the username part
            const username = parts[0];

            if (username.length < 3) {
                return {
                    available: false,
                    reason: "Username must be at least 3 characters long"
                };
            }

            if (!/^[a-z0-9]+$/.test(username)) {
                return {
                    available: false,
                    reason: "Username can only contain lowercase letters and numbers"
                };
            }

            // For demo/dev, use localStorage
            const isTaken = localStorage.getItem(`ens-name-taken-${username.toLowerCase()}`) !== null;

            return {
                available: !isTaken,
                reason: isTaken ? `${ensName} is already registered` : undefined
            };
        }
    } catch (error: any) {
        console.error("Error checking ENS name availability:", error);
        return {
            available: false,
            reason: "Error checking name availability"
        };
    }
}

/**
 * Register an ENS name for a user
 * @param ensName The full ENS name (e.g., "username.lisk.eth")
 * @param address The Ethereum address to register the name for
 * @returns Promise<boolean> True if registration was successful
 */
export async function registerENSName(ensName: string, address: string): Promise<boolean> {
    try {
        // In a production environment, this would interact with the actual L2 registry
        // For now, we're using localStorage for demo/development purposes
        // In actual implementation, you would:
        // 1. Connect to the L2 network with a signer
        // 2. Call the L2Registry.setSubnodeOwner function

        // Normalize the name
        const normalizedName = normalize(ensName);

        // Split the name to get the username
        const parts = normalizedName.split(".");
        const username = parts[0];

        // Check availability first
        const availability = await checkENSNameAvailable(ensName);
        if (!availability.available) {
            throw new Error(availability.reason || "Name is not available");
        }

        // Store in localStorage for demo purposes
        // In production, this would be a transaction to the ENS contracts
        localStorage.setItem(`ens-username-${address.toLowerCase()}`, ensName);
        localStorage.setItem(`ens-name-taken-${username.toLowerCase()}`, address);

        return true;
    } catch (error) {
        console.error("Error registering ENS name:", error);
        throw error;
    }
}

/**
 * Resolve an ENS name to an address using CCIP-Read
 * @param ensName The ENS name to resolve
 * @returns Promise<string> The resolved address or null if not found
 */
export async function resolveENSName(ensName: string): Promise<string | null> {
    try {
        // In production environment, use the actual L1 resolver with CCIP-Read
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
            // Encode the function call for addr(bytes32)
            const addrSelector = '0x3b3b57de'; // selector for addr(bytes32)
            const nameHash = namehash(ensName);

            // Encode the call to resolve(bytes,bytes)
            const nameBytes = toHex(ethers.toUtf8Bytes(ensName));
            const selectorAndHash = toHexString(addrSelector + nameHash.slice(2));

            const callData = encodeFunctionData({
                abi: L1Resolver.abi,
                functionName: 'resolve',
                args: [nameBytes, selectorAndHash]
            });

            try {
                // Call the resolver
                const result = await publicClient.readContract({
                    address: L1_RESOLVER_ADDRESS as `0x${string}`,
                    abi: L1Resolver.abi,
                    functionName: 'resolve',
                    args: [nameBytes, selectorAndHash],
                });

                // If we get here, the name was resolved on L1 directly
                return ethers.getAddress(`0x${(result as string).slice(2 + 64)}`);
            } catch (error: any) {
                // Check for OffchainLookup error
                if (error?.cause?.name === 'ContractFunctionExecutionError' &&
                    error?.cause?.cause?.data?.errorName === 'OffchainLookup') {
                    // Extract the necessary data for the offchain lookup
                    const offchainData = error.cause.cause.data;

                    // Fetch from the gateway using the URL and callData
                    const gatewayUrl = `${offchainData.args.urls[0]}/${L1_RESOLVER_ADDRESS}/${offchainData.args.callData.slice(2)}`;

                    // Fetch the data from the gateway
                    const response = await fetch(gatewayUrl);
                    if (!response.ok) {
                        throw new Error(`Gateway response error: ${response.status}`);
                    }

                    const responseData = await response.json();
                    const result = responseData.data;

                    // Call the callback function on the resolver with the result
                    const callbackSelector = offchainData.args.callbackFunction;
                    const callbackData = encodeFunctionData({
                        abi: [{
                            name: 'processLookup',
                            type: 'function',
                            inputs: [
                                { name: 'response', type: 'bytes' },
                                { name: 'extraData', type: 'bytes' }
                            ],
                            outputs: [{ name: '', type: 'bytes' }]
                        }],
                        functionName: 'processLookup',
                        args: [result, offchainData.args.extraData]
                    });

                    const finalResult = await publicClient.readContract({
                        address: L1_RESOLVER_ADDRESS as `0x${string}`,
                        abi: [{
                            name: 'processLookup',
                            type: 'function',
                            inputs: [
                                { name: 'response', type: 'bytes' },
                                { name: 'extraData', type: 'bytes' }
                            ],
                            outputs: [{ name: '', type: 'bytes' }]
                        }],
                        functionName: 'processLookup',
                        args: [result, offchainData.args.extraData]
                    });

                    // Parse the address from the result
                    return ethers.getAddress(`0x${(finalResult as string).slice(2 + 64)}`);
                } else {
                    // Other error, just rethrow
                    throw error;
                }
            }
        } else {
            // Development environment mock implementation

            // Parse the name to get the username
            const parts = normalize(ensName).split(".");
            if (parts.length < 3 || parts[parts.length - 1] !== "eth" || parts[parts.length - 2] !== "lisk") {
                return null;
            }

            const username = parts[0];

            // Look up in our mock registry
            return localStorage.getItem(`ens-name-taken-${username.toLowerCase()}`) || null;
        }
    } catch (error) {
        console.error("Error resolving ENS name:", error);
        return null;
    }
}

/**
 * Look up the ENS name for an address
 * @param address The Ethereum address to look up
 * @returns Promise<string> The ENS name or null if not found
 */
export async function lookupENSName(address: string): Promise<string | null> {
    try {
        // In production, this would query the reverse records
        // For now, we use localStorage
        return localStorage.getItem(`ens-username-${address.toLowerCase()}`) || null;
    } catch (error) {
        console.error("Error looking up ENS name:", error);
        return null;
    }
}

/**
 * A more complete implementation for production would include these functions:
 * 
 * - resolveENSName: Resolve an ENS name to an address using CCIP-Read protocol
 * - registerENSName: Register an ENS name for a user (requires a transaction)
 * - updateENSRecord: Update ENS records for a name (requires a transaction)
 * - getENSTextRecord: Get a text record for an ENS name
 * - setENSTextRecord: Set a text record for an ENS name
 * - ... and more
 */ 