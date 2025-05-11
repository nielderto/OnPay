import { ethers } from "ethers";
import { createPublicClient, http, encodeFunctionData, decodeFunctionResult, toHex, hexToBytes } from "viem";
import { liskSepolia } from "viem/chains";
import { normalize } from "viem/ens";
import { L1Resolver } from "@/abi/L1Resolver";
import { L2Registry } from "@/abi/L2Registry";
import { L2Registrar } from '@/abi/L2Registrar';

// Constants
const L1_RESOLVER_ADDRESS = L1Resolver.address; // Your L1 resolver on Sepolia
const L2_REGISTRY_ADDRESS = L2Registry.address; // Your L2 registry on Lisk
const L2_REGISTRAR_ADDRESS = L2Registrar.address; // Your L2 registrar on Lisk
const ENS_GATEWAY_URL = "https://ens-gateway.onpaylisk.workers.dev"; // Your gateway URL
const NETWORK = "liskSepolia";


const publicClient = createPublicClient({
    chain: liskSepolia,
    transport: http(),
});

const PROVIDERS: Record<string, string> = {
    liskSepolia: "https://rpc.sepolia-api.lisk.com",
    // liskMainnet: "https://rpc.lisk.com",
};

const provider = new ethers.JsonRpcProvider(PROVIDERS[NETWORK]);

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
            node = ethers.keccak256(ethers.concat([ethers.getBytes(node), ethers.getBytes(labelHash)])
            );
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
        const normalizedName = normalize(ensName);
        const parts = normalizedName.split(".");

        // Expecting format like username.lisk.eth
        if (parts.length < 3 || parts[parts.length - 1] !== "eth" || parts[parts.length - 2] !== "lisk") {
            return {
                available: false,
                reason: "Invalid name format. Must be in the format username.lisk.eth"
            };
        }

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

        // Connect to the L2Registrar contract
        console.log(`Checking availability for ${username}...`);
        const registrar = new ethers.Contract(
            L2_REGISTRAR_ADDRESS,
            L2Registrar.abi,
            provider
        );

        try {
            // Call the `available` method
            const isAvailable = await registrar.available(username);
            console.log(`Availability result for ${username}: ${isAvailable}`);

            return {
                available: isAvailable,
                reason: isAvailable ? undefined : `${ensName} is already registered`
            };
        } catch (contractError: any) {
            console.error("Error calling contract:", contractError);
            throw new Error(`Error checking availability: ${contractError.message}`);
        }
    } catch (error: any) {
        console.error("Error checking ENS name availability:", error);
        return {
            available: false,
            reason: "Error checking name availability: " + error.message
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
        if (!window.ethereum) throw new Error("No wallet detected");

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        const normalized = normalize(ensName);
        const parts = normalized.split(".");

        if (parts.length < 3 || parts[parts.length - 1] !== "eth" || parts[parts.length - 2] !== "lisk") {
            throw new Error("ENS format must be username.lisk.eth");
        }

        const label = parts[0];

        if (label.length < 3) throw new Error("Username must be at least 3 characters");
        if (!/^[a-z0-9]+$/.test(label)) throw new Error("Username must be lowercase alphanumerics only");

        // Check availability
        const available = await checkENSNameAvailable(ensName);
        if (!available.available) throw new Error(available.reason || "Name is taken");

        // Ensure network is Lisk Sepolia (chainId 0x106A = 4202 in decimal)
        const network = await provider.getNetwork();
        const liskSepoliaChainIdHex = "0x106A";

        if (network.chainId.toString(16).toLowerCase() !== liskSepoliaChainIdHex.toLowerCase().replace(/^0x/, '')) {
            console.log(`Current network: ${network.chainId}, expected: ${liskSepoliaChainIdHex}`);
            await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: liskSepoliaChainIdHex }]
            });
        }

        // Send registration tx
        const registrar = new ethers.Contract(L2_REGISTRAR_ADDRESS, L2Registrar.abi, signer);
        console.log(`Registering ${label}.lisk.eth for address ${address}...`);
        const tx = await registrar.register(label, address);
        console.log(`Transaction submitted: ${tx.hash}`);
        const receipt = await tx.wait();
        console.log(`Transaction confirmed: ${receipt.hash}`);

        // Store in localStorage as a quick fallback for reverse lookup
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(`ens-username-${address.toLowerCase()}`, normalized);
                console.log(`Stored ${normalized} for ${address} in localStorage`);
            }
        } catch (storageError) {
            console.warn("Could not store name in localStorage:", storageError);
        }

        console.log(`Successfully registered ${normalized} to ${address}`);
        return true;
    } catch (error) {
        console.error("ENS registration failed:", error);
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
        const normalizedName = normalize(ensName);
        const node = namehash(normalizedName);
        const nameBytes = ethers.toUtf8Bytes(normalizedName);

        const addrSelector = "0x3b3b57de"; // function selector for addr(bytes32)
        const calldata = addrSelector + node.slice(2);

        const result = await publicClient.readContract({
            address: L1_RESOLVER_ADDRESS as `0x${string}`,
            abi: L1Resolver.abi,
            functionName: "resolve",
            args: [ethers.hexlify(nameBytes), calldata],
        });
        // Extract the address from the returned bytes
        const resolvedAddress = "0x" + (result as string).slice(66, 106); // skip first 64 bytes (offset)
        return ethers.getAddress(resolvedAddress); // checksum
    } catch (error) {
        console.error("ENS resolution failed:", error);
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
        // Create a provider for connecting to Lisk Sepolia
        const lookupProvider = new ethers.JsonRpcProvider(PROVIDERS[NETWORK]);

        // Try standard ENS reverse lookup first
        const name = await lookupProvider.lookupAddress(address);
        if (name && name.endsWith('.lisk.eth')) {
            return name;
        }

        // If no standard lookup, check local storage as fallback
        const localName = typeof localStorage !== 'undefined'
            ? localStorage.getItem(`ens-username-${address.toLowerCase()}`)
            : null;

        return localName;
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