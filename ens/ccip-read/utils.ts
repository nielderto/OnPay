import { type ByteArray, type Hex } from 'viem'
import { bytesToString, parseAbi, toBytes } from 'viem/utils'

export const resolverAbi = parseAbi([
  'function stuffedResolveCall(bytes name, bytes data, uint64 targetChainId, address targetRegistryAddress) view returns (bytes)',
  'function resolve(bytes name, bytes data) view returns (bytes)',
  'function addr(bytes32 node) view returns (address)',
  'function text(bytes32 node, string key) view returns (string)',
  'function contenthash(bytes32 node) view returns (bytes)',
])

export function dnsDecodeName(encodedName: Hex): string {
  const bytesName = toBytes(encodedName)
  return bytesToPacket(bytesName)
}

function bytesToPacket(bytes: ByteArray): string {
  let offset = 0
  let result = ''
  while (offset < bytes.length) {
    const len = bytes[offset]
    if (len === 0) {
      offset++
      break
    }
    result += `${bytesToString(bytes.slice(offset + 1, offset + len + 1))}.`
    offset += len + 1
  }
  return result.replace(/\.$/, '')
}
