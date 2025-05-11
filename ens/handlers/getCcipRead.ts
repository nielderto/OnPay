import type { HonoRequest } from 'hono';
import { type Hex, serializeSignature, } from 'viem';
import { sign } from 'viem/accounts';
import {
  decodeFunctionData,
  encodeAbiParameters,
  encodePacked,
  isAddress,
  isHex,
  keccak256,
  decodeAbiParameters,
} from 'viem/utils';
import { z } from 'zod';

import { handleQueryLisk } from '../ccip-read/query';
import { resolverAbi } from '../ccip-read/utils';
import { type Env, envVar } from '../env';

const schema = z.object({
  sender: z.string().refine((data) => isAddress(data)),
  data: z.string().refine((data) => isHex(data)),
});

// ✅ POST-based CCIP-Read for Lisk ENS
export const getCcipReadLisk = async (
  req: HonoRequest,
  env: Env
): Promise<Response> => {
  try {
    // const safeParse = schema.safeParse(req.param());
    const body = await req.json();
    const safeParse = schema.safeParse(body);

    if (!safeParse.success) {
      return Response.json(
        { message: 'Invalid request', error: safeParse.error },
        { status: 400 }
      );
    }

    const { sender, data } = safeParse.data;

    const decodedStuffedResolveCall = decodeFunctionData({
      abi: [resolverAbi[0]], // resolve(bytes name, bytes data, uint64 chainId, address registry)
      data,
    });

    const result = await handleQueryLisk({
      dnsEncodedName: decodedStuffedResolveCall.args[0],
      encodedResolveCall: decodedStuffedResolveCall.args[1] as Hex,
      targetRegistryAddress: decodedStuffedResolveCall.args[3],
      env,
    });

    // Decode result form abi: address
    const [resolvedAddress] = decodeAbiParameters(
      [{name: 'addr', type: 'address'}],
      result
    );
    
    // Store result in database
    const db = env.DB;
    const name = decodedStuffedResolveCall.args[0]; // DNS-encoded name
    await db
      .prepare(
        'INSERT OR REPLACE INTO ens_records (name, address) VALUES (?, ?)'
      )
      .bind(name, resolvedAddress)
      .run();

    const ttl = 1000; // 1 second TTL
    const validUntil = Math.floor(Date.now() / 1000 + ttl);

    const messageHash = keccak256(
      encodePacked(
        ['bytes', 'address', 'uint64', 'bytes32', 'bytes32'],
        [
          '0x1900',
          sender,
          BigInt(validUntil),
          keccak256(data),
          keccak256(result),
        ]
      )
    );

    const sig = await sign({
      hash: messageHash,
      privateKey: envVar('SIGNER_PRIVATE_KEY', env),
    });

    const encodedResponse = encodeAbiParameters(
      [
        { name: 'result', type: 'bytes' },
        { name: 'expires', type: 'uint64' },
        { name: 'sig', type: 'bytes' },
      ],
      [result, BigInt(validUntil), serializeSignature(sig)]
    );

    return new Response(JSON.stringify({data: encodedResponse}), {
      status: 200, 
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('CCIP-Read Handler Error:', error);
    return new Response(
      JSON.stringify({ message: 'Internal Server Error', error: String(error) }),
      { status: 500 }
    );
  }
};
