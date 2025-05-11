import { type Hex, createPublicClient, http, decodeFunctionData } from 'viem'
import { liskSepolia } from 'viem/chains'

import { resolverAbi, dnsDecodeName } from './utils'
import { type Env, envVar } from '../env'

type HandleQueryArgs = {
  dnsEncodedName: Hex
  encodedResolveCall: Hex
  targetRegistryAddress: Hex
  env: Env
}

export async function handleQueryLisk({
  dnsEncodedName,
  encodedResolveCall,
  targetRegistryAddress,
  env,
}: HandleQueryArgs) {
  const name = dnsDecodeName(dnsEncodedName)
  const { functionName, args } = decodeFunctionData({
    abi: resolverAbi,
    data: encodedResolveCall,
  });

  const l2Client = createPublicClient({
    chain: liskSepolia,
    transport: http(envVar('LISK_SEPOLIA_RPC_URL', env)),
  });

  console.log({
    name,
    functionName,
    args,
  });

  return l2Client.readContract({
    address: targetRegistryAddress,
    abi: [resolverAbi[1]], // resolve(bytes,bytes)
    functionName: 'resolve',
    args: [dnsEncodedName, encodedResolveCall],
  });
}
