import { ethers } from "ethers";
import { createPublicClient, http, toHex, custom } from "viem";
import { liskSepolia, sepolia, mainnet } from "viem/chains";
import { namehash, normalize, packetToBytes } from "viem/ens";
import type { WalletClient } from "viem";
import { L1Resolver } from "@/abi/L1Resolver";
import { L2Registry } from "@/abi/L2Registry";
import { L2Registrar } from '@/abi/L2Registrar';

// Constants
const L1_RESOLVER_ADDRESS = L1Resolver.address; // Your L1 resolver on Sepolia
const L2_REGISTRY_ADDRESS = L2Registry.address; // Your L2 registry on Lisk
const L2_REGISTRAR_ADDRESS = L2Registrar.address; // Your L2 registrar on Lisk
const ENS_GATEWAY_URL = "https://ens-gateway.onpaylisk.workers.dev"; // Your gateway URL
const NETWORK = "liskSepolia"; // L2 network
const NETWORK_L1: NetworkType = "sepolia"; // L1 Ethereum for ENS resolution


const publicClient_L2 = createPublicClient({
    chain: liskSepolia,
    transport: http(),
});

const LISK_RPC: Record<string, string> = {
    liskSepolia: "https://rpc.sepolia-api.lisk.com",
    // liskMainnet: "https://rpc.lisk.com",
};

const provider_L2 = new ethers.JsonRpcProvider(LISK_RPC[NETWORK]);


// L1 Ethereum Provider & Client (for ENS)
type NetworkType = 'sepolia' | 'mainnet';
const ETHEREUM_RPC: Record<NetworkType, string> = {
    sepolia: process.env.SEPOLIA_RPC_URL ?? '',
    mainnet: process.env.MAINNET_RPC_URL ?? '',
};


const publicClient_L1 = createPublicClient({
    chain: sepolia,
    transport: http(ETHEREUM_RPC[NETWORK_L1 as NetworkType]),
});

const provider_L1 = new ethers.JsonRpcProvider(ETHEREUM_RPC[NETWORK_L1 as NetworkType]);

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
            provider_L2
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
 * Register an ENS name using meta transactions for Xellar wallet users
 * @param ensName The full ENS name (e.g., "username.lisk.eth")
 * @param walletClient The Xellar wallet client
 * @returns Promise<boolean> True if registration was successful
 */
export async function registerENSNameWithMetaTx(ensName: string, walletClient: any): Promise<boolean> {
    try {
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

        if (!walletClient) {
            throw new Error("Wallet client not available");
        }

        const address = walletClient.account.address;
        console.log("Xellar wallet address:", address);

        // Get the current nonce for this user from the contract
        const nonce = await publicClient_L2.readContract({
            address: L2_REGISTRAR_ADDRESS as `0x${string}`,
            abi: L2Registrar.abi,
            functionName: "nonces",
            args: [address],
        }) as bigint;
        console.log("Current nonce:", nonce.toString());

        // Generate the message hash for the registration
        const messageHash = await publicClient_L2.readContract({
            address: L2_REGISTRAR_ADDRESS as `0x${string}`,
            abi: L2Registrar.abi,
            functionName: "getMessageHash",
            args: [
                address,
                label,
                nonce,
            ],
        }) as `0x${string}`;
        console.log("Message hash:", messageHash);

        // Sign the message with Xellar wallet
        const signature = await walletClient.signMessage({
            message: { raw: messageHash }
        });
        console.log("Signature received:", signature);

        // Send to relayer
        const response = await fetch('https://ens-gateway.onpaylisk.workers.dev/api/ens-register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: normalized,
                address,
                label,
                nonce: nonce.toString(),
                signature,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to register ENS name');
        }

        const result = await response.json();
        console.log("Registration result:", result);

        // Sync with ENS gateway
        const syncResponse = await fetch('https://ens-gateway.onpaylisk.workers.dev/api/ens-sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: normalized, address }),
        });

        if (!syncResponse.ok) {
            throw new Error(`Failed to sync ENS record: ${syncResponse.statusText}`);
        }

        console.log(`Successfully registered ${normalized} to ${address}`);
        return true;
    } catch (error: any) {
        console.error("ENS registration failed:", error);
        throw error;
    }
}

// Modify the existing registerENSName function to use meta transactions for Xellar wallets
export async function registerENSName(ensName: string, walletClient?: any): Promise<boolean> {
    try {
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

        // Determine if using Xellar Kit or MetaMask
        const isUsingXellarKit = !!walletClient;

        if (isUsingXellarKit) {
            // Use meta transaction flow for Xellar wallets
            return await registerENSNameWithMetaTx(ensName, walletClient);
        } else {
            // Use traditional flow for MetaMask
            if (!window.ethereum) {
                throw new Error("No ethereum provider found. Please install MetaMask.");
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();

            // Ensure correct network
            const network = await provider.getNetwork();
            const liskSepoliaChainIdHex = "0x106A";

            if (network.chainId.toString(16).toLowerCase() !== liskSepoliaChainIdHex.toLowerCase().replace(/^0x/, '')) {
                try {
                    await window.ethereum.request({
                        method: "wallet_switchEthereumChain",
                        params: [{ chainId: liskSepoliaChainIdHex }]
                    });
                } catch (error: any) {
                    throw new Error("Unable to switch networks. Please switch to Lisk Sepolia network manually.");
                }
            }

            // Use ethers.js with MetaMask
            const registrar = new ethers.Contract(L2_REGISTRAR_ADDRESS, L2Registrar.abi, signer);
            const tx = await registrar.register(label, address, {
                gasLimit: 300000,
            });
            await tx.wait();

            // Sync with ENS gateway
            const response = await fetch('https://ens-gateway.onpaylisk.workers.dev/api/ens-sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: normalized, address }),
            });

            if (!response.ok) {
                throw new Error(`Failed to sync ENS record: ${response.statusText}`);
            }

            console.log(`Successfully registered ${normalized} to ${address}`);
            return true;
        }
    } catch (error: any) {
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
        const cleanName = ensName?.trim().replace(/\u200B|\u00A0/g, ''); // remove zero-width & nbsp

        if (!cleanName || cleanName.includes('..') || cleanName.startsWith('.') || cleanName.endsWith('.')) {
            throw new Error(`Invalid ENS name: "${ensName}"`);
        }
        const normalizedName = normalize(cleanName);
        const node = namehash(normalizedName);
        console.log('node:', node);
        const nameBytes = toHex(packetToBytes(normalizedName));
        console.log('nameBytes:', nameBytes);

        const addrSelector = "0x3b3b57de"; // function selector for addr(bytes32)
        const calldata = addrSelector + node.slice(2);
        console.log('calldata:', calldata);

        const resolver = new ethers.Contract(
            L1_RESOLVER_ADDRESS,
            L1Resolver.abi,
            provider_L1
        );
        const abi = new ethers.AbiCoder();
        try {
            // First attempt a direct call to see if we get a direct response
            const tx = {
                to: L1_RESOLVER_ADDRESS,
                data: resolver.interface.encodeFunctionData("resolve", [nameBytes, calldata]),
            };

            const result = await provider_L1.call(tx);

            console.log("Unexpected success (no OffchainLookup):", result);
            // Direct call succeeded but we didn't process the result
            // Since this is unexpected, return null to be safe
            return null;
        } catch (error: any) {
            // Check if this is an OffchainLookup error
            const errorData = error?.data?.data ?? error?.data;
            if (errorData?.startsWith('0x556f1830')) {
                // Parse error data
                const decodedError = abi.decode(
                    ['address', 'string[]', 'bytes', 'bytes4', 'bytes'],
                    '0x' + errorData.slice(10) // Remove the error selector
                );

                const sender = decodedError[0];
                const urls = decodedError[1] as string[];
                const callData = decodedError[2] as string;
                const callbackFunction = decodedError[3] as string;
                const extraData = decodedError[4] as string;

                console.log("CCIP-Read triggered:", {
                    sender,
                    urls,
                    callData,
                    callbackSelector: callbackFunction
                });

                // Choose gateway URL
                const gatewayUrl = (urls[0] || ENS_GATEWAY_URL).replace("{sender}", sender).replace("{data}", callData);
                console.log("Resolve gateway URL:", gatewayUrl);

                // Call the gateway
                const response = await fetch(gatewayUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ sender, data: callData }),
                });

                if (!response.ok) {
                    throw new Error(`Gateway responded with status: ${response.status}`);
                }

                const responseData = await response.json();
                const signedData = responseData.data;

                if (!signedData) {
                    throw new Error("Gateway did not return valid data");
                }

                console.log("Got signed data from gateway");
                console.log("signedData:", signedData);
                console.log("extraData:", extraData);

                // Call resolveWithProof with gateway result
                const resolved = await publicClient_L1.readContract({
                    address: L1_RESOLVER_ADDRESS as `0x${string}`,
                    abi: L1Resolver.abi,
                    functionName: "resolveWithProof",
                    args: [signedData, extraData],
                });

                // Parse address from returned bytes
                const [resolvedAddress] = new ethers.AbiCoder().decode(['address'], resolved as string);
                return resolvedAddress;
            }

            console.error("ENS resolution failed:", error);
            return null;
        }
    } catch (mainError) {
        console.error("Unexpected error in ENS resolution:", mainError);
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
        const res = await fetch(`https://ens-gateway.onpaylisk.workers.dev/api/ens-lookup/${address}`)
        if (!res.ok) {
            const errText = await res.text()
            throw new Error(`HTTP ${res.status} – ${errText}`)
        }

        const data = await res.json();
        // Check for empty string or null
        const rawName = data.name && data.name.trim() !== "" ? data.name : null;

        if (!rawName) {
            console.log(`❌ No ENS name found for ${address}`);
            return null;
        }

        console.log(`✅ ENS name from gateway: ${rawName}`);
        return rawName;
    } catch (error) {
        console.error("Error looking up ENS name:", error)
        return null
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