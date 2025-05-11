"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { L1Resolver } from "@/abi/L1Resolver";
import { resolveENSName } from "@/lib/ens-service";
import { createPublicClient, http, getContract } from "viem";
import { sepolia } from "viem/chains";

// Add ethereum to Window interface
declare global {
    interface Window {
        ethereum?: any;
    }
}

// Custom Wagmi ENS Test Component
function CustomWagmiTest() {
    const [ensName, setEnsName] = useState("haowen");
    const [manualAddress, setManualAddress] = useState("");
    const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);
    const [resolverAddress, setResolverAddress] = useState<string | null>(null);
    const [lookupName, setLookupName] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Create a Viem public client for Sepolia (where L1Resolver is deployed)
    const publicClient = createPublicClient({
        chain: sepolia,
        transport: http('https://eth-sepolia.g.alchemy.com/v2/1Cu1tMXhu_2DZWEY_0SogkOrK4ypl3pt')
    });

    // Effect to resolve ENS name when it changes
    useEffect(() => {
        async function resolveENS() {
            if (!ensName) return;

            setIsLoading(true);
            setError(null);

            try {
                // Use your custom resolveENSName function
                const fullName = ensName.endsWith(".lisk.eth") ? ensName : `${ensName}.lisk.eth`
                const address = await resolveENSName(fullName);
                setResolvedAddress(address);
                setResolverAddress(L1Resolver.address);
            } catch (err: any) {
                console.error("ENS resolution error:", err);
                setError(err.message || "Failed to resolve ENS name");
                setResolvedAddress(null);
            } finally {
                setIsLoading(false);
            }
        }

        resolveENS();
    }, [ensName]);

    // Effect to perform reverse lookup when address changes
    useEffect(() => {
        async function reverseLookup() {
            if (!manualAddress || !ethers.isAddress(manualAddress)) {
                setLookupName(null);
                return;
            }

            try {
                // Perform reverse lookup logic here
                // This is a placeholder - your system might not support reverse lookup yet
                setLookupName("Reverse lookup not implemented for custom ENS");
            } catch (err) {
                console.error("Reverse lookup error:", err);
                setLookupName(null);
            }
        }

        reverseLookup();
    }, [manualAddress]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mt-8 border border-blue-200">
            <h2 className="text-xl font-bold mb-4 text-blue-800">Custom ENS Test (with viem/wagmi)</h2>

            <div className="mb-6">
                <label className="block text-gray-700 mb-2">ENS Name</label>
                <input
                    type="text"
                    value={ensName}
                    onChange={(e) => setEnsName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., haowen.lisk.eth"
                />

                <div className="mt-3">
                    {isLoading ? (
                        <p className="text-gray-500">Loading...</p>
                    ) : error ? (
                        <div className="p-3 bg-red-50 text-red-700 rounded mt-2">
                            <p>Error: {error}</p>
                        </div>
                    ) : (
                        <div className="mt-2">
                            <p className="font-medium">Resolved address: <span className="font-mono">{resolvedAddress || "Not resolved"}</span></p>
                            <p className="font-medium mt-1">Resolver: <span className="font-mono text-xs">{resolverAddress || "Unknown"}</span></p>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-6">
                <label className="block text-gray-700 mb-2">Reverse Lookup (Address to Name)</label>
                <input
                    type="text"
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter Ethereum address (0x...)"
                />

                <div className="mt-3">
                    <p className="font-medium">Name: <span className="font-mono">{lookupName || "No name found"}</span></p>
                </div>
            </div>
        </div>
    );
}

export default function ENSTestPage() {
    const [ensName, setEnsName] = useState("haowen.lisk.eth");
    const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);
    const [provider, setProvider] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [metamaskResult, setMetamaskResult] = useState<string | null>(null);
    const [manualResult, setManualResult] = useState<string | null>(null);
    const [gatewayUrl, setGatewayUrl] = useState<string | null>(null);

    useEffect(() => {
        // Initialize provider
        if (typeof window !== 'undefined' && window.ethereum) {
            const ethersProvider = new ethers.BrowserProvider(window.ethereum);
            setProvider(ethersProvider);
        }

        // Get gateway URL from contract
        const getGatewayUrl = async () => {
            try {
                const rpcProvider = new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/1Cu1tMXhu_2DZWEY_0SogkOrK4ypl3pt");
                const resolverContract = new ethers.Contract(
                    L1Resolver.address,
                    L1Resolver.abi,
                    rpcProvider
                );
                const url = await resolverContract.url();
                setGatewayUrl(url);
            } catch (err) {
                console.error("Error fetching gateway URL:", err);
                // Default gateway URL
                setGatewayUrl("https://ens-gateway.onpaylisk.workers.dev");
            }
        };

        getGatewayUrl();
    }, []);

    const resolveWithMetamask = async () => {
        if (!provider) {
            setError("MetaMask not available");
            return;
        }

        setIsLoading(true);
        setError(null);
        setMetamaskResult(null);

        try {
            // Try to resolve ENS name using MetaMask's provider
            const address = await provider.resolveName(ensName);
            setMetamaskResult(address || "Not resolved");
        } catch (err: any) {
            setError(`MetaMask resolution error: ${err.message}`);
            console.error("MetaMask resolution error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const resolveManually = async () => {
        setIsLoading(true);
        setError(null);
        setManualResult(null);

        try {
            // Resolve using our manual CCIP-Read implementation
            const address = await resolveENSName(ensName);
            setManualResult(address || "Not resolved");
        } catch (err: any) {
            setError(`Manual resolution error: ${err.message}`);
            console.error("Manual resolution error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const resolveDirectlyWithContract = async () => {
        if (!provider) {
            setError("Provider not available");
            return;
        }

        setIsLoading(true);
        setError(null);
        setResolvedAddress(null);

        try {
            // Connect to the L1 resolver contract
            const resolverContract = new ethers.Contract(
                L1Resolver.address,
                L1Resolver.abi,
                provider
            );

            // Manually calculate namehash for the ENS name
            const namehashValue = await calculateNamehash(ensName);
            console.log("Namehash:", namehashValue);

            // Encode the call to addr(bytes32)
            const addrSelector = "0x3b3b57de"; // Function selector for addr(bytes32)
            const nameBytes = ethers.toUtf8Bytes(ensName);

            try {
                // Call resolve method directly
                const result = await resolverContract.resolve(
                    nameBytes,
                    ethers.concat([ethers.toBeHex(addrSelector, 4), namehashValue])
                );

                // Parse the result (addr result is the last 20 bytes)
                const address = ethers.getAddress("0x" + result.slice(2).slice(-40));
                setResolvedAddress(address);
            } catch (err: any) {
                // Check if it's an OffchainLookup error
                if (err.code === "CALL_EXCEPTION" && err.errorArgs && err.errorName === "OffchainLookup") {
                    console.log("OffchainLookup error data:", err);

                    // Extract offchain lookup data
                    const sender = err.errorArgs.sender;
                    const callData = err.errorArgs.callData;

                    // Try to fetch from gateway using the correct format
                    try {
                        // Format: /v1/:sender/:data
                        const formattedUrl = `${gatewayUrl || "https://ens-gateway.onpaylisk.workers.dev"}/v1/${sender}/${callData.slice(2)}`;
                        console.log("Trying to fetch from:", formattedUrl);

                        const response = await fetch(formattedUrl);
                        if (response.ok) {
                            const responseData = await response.json();
                            setError(`OffchainLookup error received and gateway responded with status: ${responseData.status || "unknown"}. This confirms the contract and gateway are correctly set up.`);
                        } else {
                            setError(`OffchainLookup error received, but gateway returned HTTP ${response.status}. This suggests the gateway has issues.`);
                        }
                    } catch (fetchErr: any) {
                        setError(`OffchainLookup error received, but gateway fetch failed: ${fetchErr.message}`);
                    }
                } else {
                    throw err;
                }
            }
        } catch (err: any) {
            setError(`Contract error: ${err.message}`);
            console.error("Contract error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const calculateNamehash = async (name: string) => {
        let node = ethers.ZeroHash;
        if (!name) return node;

        // Split the name by dots and process each label from right to left
        const labels = name.split(".");
        for (let i = labels.length - 1; i >= 0; i--) {
            // Hash the current label
            const labelHash = ethers.keccak256(ethers.toUtf8Bytes(labels[i]));
            // Combine the current node with the label hash
            node = ethers.keccak256(ethers.concat([node, labelHash].map(h => ethers.getBytes(h))));
        }
        return node;
    };

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-4 text-gray-800">ENS Resolution Test</h1>

                <div className="mb-6">
                    <label className="block text-gray-700 mb-2">ENS Name to Test</label>
                    <div className="flex">
                        <input
                            type="text"
                            value={ensName}
                            onChange={(e) => setEnsName(e.target.value)}
                            className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., haowen.lisk.eth"
                        />
                    </div>
                </div>

                <div className="mb-4 text-sm">
                    <strong>Gateway URL:</strong> {gatewayUrl || "Loading..."}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <button
                        onClick={resolveWithMetamask}
                        disabled={isLoading || !provider}
                        className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? "Loading..." : "Resolve with MetaMask"}
                    </button>

                    <button
                        onClick={resolveManually}
                        disabled={isLoading}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? "Loading..." : "Resolve with CCIP-Read"}
                    </button>

                    <button
                        onClick={resolveDirectlyWithContract}
                        disabled={isLoading || !provider}
                        className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? "Loading..." : "Test Contract Directly"}
                    </button>
                </div>

                {error && (
                    <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50">
                        {error}
                    </div>
                )}

                <div className="bg-gray-50 p-4 rounded-md mb-4">
                    <h2 className="font-semibold mb-2 text-gray-700">MetaMask Resolution:</h2>
                    <div className="font-mono bg-gray-100 p-2 rounded">
                        {metamaskResult || "Not tested yet"}
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md mb-4">
                    <h2 className="font-semibold mb-2 text-gray-700">CCIP-Read Manual Resolution:</h2>
                    <div className="font-mono bg-gray-100 p-2 rounded">
                        {manualResult || "Not tested yet"}
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                    <h2 className="font-semibold mb-2 text-gray-700">Direct Contract Call Result:</h2>
                    <div className="font-mono bg-gray-100 p-2 rounded">
                        {resolvedAddress || "Not tested yet"}
                    </div>
                </div>

                <div className="mt-8 text-sm text-gray-600">
                    <p className="mb-2">How this test works:</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li><strong>MetaMask Resolution</strong>: Tests if MetaMask's built-in ENS resolver recognizes the name</li>
                        <li><strong>CCIP-Read Resolution</strong>: Uses our custom implementation with the gateway</li>
                        <li><strong>Direct Contract Call</strong>: Calls the L1 resolver contract directly (should trigger OffchainLookup)</li>
                    </ul>
                </div>

                {/* New Custom Wagmi ENS Test Component */}
                <CustomWagmiTest />
            </div>
        </div>
    );
} 