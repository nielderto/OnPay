// This file contains logic to manually check if a constructed ENS name resolves to an address.
import {liskSepolia} from "viem/chains"
// This creates a client that lets you interact with the Ethereum network 
// read-only (i.e., for fetching data)
import { createPublicClient, http } from 'viem';

const client = createPublicClient({
    chain: liskSepolia,
    transport: http(),
})

export async function resolveENS(username: string) {
    const ensName = `${username}.lisk.eth`.toLowerCase();
    try {
        const address = await client.getEnsAddress({name: ensName});
        return address ? address : null;
    } catch{
        return null;
    }
}
