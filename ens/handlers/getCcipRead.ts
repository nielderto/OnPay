import type { HonoRequest } from 'hono'
import { type Env } from '../env'
import { createPublicClient, http, decodeAbiParameters, encodeFunctionData, decodeFunctionData, parseAbiParameters } from 'viem'

// ABI fragments for ENS functions
const ADDR_SELECTOR = '0x3b3b57de'; // addr(bytes32)
const NAME_SELECTOR = '0x691f3431'; // name(bytes32)
const TEXT_SELECTOR = '0x59d1d43c'; // text(bytes32,string)

// We also need to handle the resolver interface for name lookup
const RESOLVER_ADDR_SELECTOR = '0x9061b923'; // resolveWithMetamask(string,string)

// ENS ABI fragments for decoding calldata
const ensAbi = [
  {
    name: 'addr',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'node', type: 'bytes32' }],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    name: 'name',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'node', type: 'bytes32' }],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    name: 'text',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'node', type: 'bytes32' },
      { name: 'key', type: 'string' },
    ],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    name: 'resolveWithMetamask',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'name', type: 'string' },
      { name: 'data', type: 'string' },
    ],
    outputs: [{ name: '', type: 'address' }],
  }
];

/**
 * Get ENS data from Lisk L2
 * This function would connect to your Lisk L2 to fetch the actual data
 */
async function getDataFromL2(env: Env, functionName: string, args: any[]): Promise<string> {
  try {
    // Create a viem client to connect to Lisk L2
    const client = createPublicClient({
      transport: http(env.LISK_SEPOLIA_RPC_URL),
    });

    console.log(`Fetching ${functionName} from L2 with args:`, args);

    // Hardcoded examples for testing
    if (functionName === 'addr') {
      const node = args[0] as `0x${string}`;

      // If it's lisk.eth, return a test address
      if (node === '0xc187bc117d35c2e17ed129f0e0e841d3f877b1ac20db04a77c24095ce11e8c46') {
        return '0x1234567890123456789012345678901234567890';
      }

      // For haowen.lisk.eth, return different test address
      if (node === '0x7d5a99f603f231d53a4f39d1521f98d2e8bb279cf29bebfd0687dc98458e7f89') {
        return '0xE99d9b785D99832d21b3Ce5A34fCacC6D53C57';
      }

      // For any address lookup, return a test address for now
      console.log("Returning demo address for node:", node);
      return '0x1234567890123456789012345678901234567890';
    }

    if (functionName === 'resolveWithMetamask') {
      const name = args[0] as string;
      console.log("Resolving name:", name);

      // Check for specific names
      if (name.includes('haowen.lisk.eth')) {
        return '0xE99d9b785D99832d21b3Ce5A34fCacC6D53C57';
      }
      if (name.includes('lisk.eth')) {
        return '0x1234567890123456789012345678901234567890';
      }

      // Return a default test address
      return '0xabcdef0123456789abcdef0123456789abcdef01';
    }

    // No data found for this node
    if (functionName === 'addr') {
      return '0x0000000000000000000000000000000000000000';
    } else {
      return '';
    }
  } catch (error) {
    console.error('Error fetching data from L2:', error);
    if (functionName === 'addr' || functionName === 'resolveWithMetamask') {
      return '0x0000000000000000000000000000000000000000';
    } else {
      return '';
    }
  }
}

/**
 * Process CCIP-Read request for ENS resolution
 */
export async function getCcipReadLisk(req: HonoRequest, env: Env): Promise<Response> {
  try {
    // Extract parameters from request
    const sender = req.param('sender');
    const calldata = req.param('calldata') || req.param('data');

    console.log('CCIP-Read detailed request:', {
      sender,
      calldata,
      url: req.url,
      path: new URL(req.url).pathname
    });

    if (!calldata) {
      console.error('Missing calldata in request');
      return returnZeroAddress();
    }

    // Parse the function selector from calldata
    const functionSelector = calldata.slice(0, 10).toLowerCase();
    console.log('Function selector:', functionSelector);

    let result: string;

    try {
      // Handle address lookup (addr function)
      if (functionSelector === ADDR_SELECTOR) {
        // Extract the node (namehash) from the calldata
        const decodedData = decodeFunctionData({
          abi: ensAbi,
          data: calldata as `0x${string}`,
        });

        // Safely extract the node from args with fallback
        const node = decodedData.args?.[0] as `0x${string}` || '0x0000000000000000000000000000000000000000000000000000000000000000';
        console.log('Looking up address for node:', node);

        // Get the address from L2
        const address = await getDataFromL2(env, 'addr', [node]);
        console.log('Resolved address:', address);

        // Encode the address as bytes32
        result = encodeAddressAsBytes32(address);
      }
      // Handle resolver lookup (resolveWithMetamask function)
      else if (functionSelector === RESOLVER_ADDR_SELECTOR) {
        console.log('Handling resolveWithMetamask call');
        try {
          // Try to decode the data
          const decodedData = decodeFunctionData({
            abi: ensAbi,
            data: calldata as `0x${string}`,
          });

          console.log('Decoded resolveWithMetamask data:', decodedData);

          // Extract name from args
          const name = decodedData.args?.[0] as string || '';
          console.log('Looking up address for name:', name);

          // Get the address from L2
          const address = await getDataFromL2(env, 'resolveWithMetamask', [name, '']);
          console.log('Resolved address for name:', address);

          // Encode the address as bytes32
          result = encodeAddressAsBytes32(address);
        } catch (error) {
          console.error('Error decoding resolveWithMetamask data:', error);
          // Return empty address on error
          result = encodeAddressAsBytes32('0x0000000000000000000000000000000000000000');
        }
      }
      // Handle name lookup (name function)
      else if (functionSelector === NAME_SELECTOR) {
        // Extract the node from the calldata
        const decodedData = decodeFunctionData({
          abi: ensAbi,
          data: calldata as `0x${string}`,
        });

        // Safely extract the node from args with fallback
        const node = decodedData.args?.[0] as `0x${string}` || '0x0000000000000000000000000000000000000000000000000000000000000000';
        console.log('Looking up name for node:', node);

        // Get the name from L2
        const name = await getDataFromL2(env, 'name', [node]);

        // For now, just return a zero address
        result = '0x0000000000000000000000000000000000000000000000000000000000000000';
      }
      // Handle text lookup (text function)
      else if (functionSelector === TEXT_SELECTOR) {
        // Extract the node and key from the calldata
        const decodedData = decodeFunctionData({
          abi: ensAbi,
          data: calldata as `0x${string}`,
        });

        // Safely extract the node and key from args with fallbacks
        const node = decodedData.args?.[0] as `0x${string}` || '0x0000000000000000000000000000000000000000000000000000000000000000';
        const key = decodedData.args?.[1] as string || '';

        console.log('Looking up text for node:', node, 'key:', key);

        // Get the text from L2
        const text = await getDataFromL2(env, 'text', [node, key]);

        // For now, just return a zero address
        result = '0x0000000000000000000000000000000000000000000000000000000000000000';
      }
      // Unknown function
      else {
        console.log('Unknown function selector:', functionSelector);

        // For unknown functions, return zero address
        result = '0x0000000000000000000000000000000000000000000000000000000000000000';
      }
    } catch (error) {
      console.error('Error processing calldata:', error);
      // On any error in calldata processing, return zero address
      result = '0x0000000000000000000000000000000000000000000000000000000000000000';
    }

    console.log('Returning response data:', result);

    // Return the result as a plain string (not JSON)
    return new Response(
      result,
      {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      }
    );
  } catch (error) {
    console.error('Fatal error in getCcipReadLisk:', error);
    return returnZeroAddress();
  }
}

/**
 * Return a zero address response
 */
function returnZeroAddress(): Response {
  const zeroAddress = '0x0000000000000000000000000000000000000000000000000000000000000000';
  console.log('Returning zero address:', zeroAddress);
  return new Response(
    // Just send the raw hex string
    zeroAddress,
    {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    }
  );
}

/**
 * Encode an Ethereum address as bytes32 for ENS CCIP-Read response
 */
function encodeAddressAsBytes32(address: string): string {
  try {
    // Remove 0x prefix if present
    const cleanAddress = address.startsWith('0x') ? address.slice(2) : address;

    // Pad the address to 32 bytes (64 hex characters)
    // Address needs to be left-padded with zeros
    const paddedAddress = cleanAddress.padStart(64, '0');

    // Return with 0x prefix
    return `0x${paddedAddress}`;
  } catch (error) {
    console.error('Error encoding address as bytes32:', error);
    return '0x0000000000000000000000000000000000000000000000000000000000000000';
  }
}
