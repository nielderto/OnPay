import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

const RELAYER_PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY!;
const NETWORK = process.env.NETWORK || "liskSepolia"; // or "liskMainnet"

// Configure provider for Lisk EVM networks
const PROVIDERS: Record<string, string> = {
  liskSepolia: "https://rpc.sepolia-api.lisk.com",
  liskMainnet: "https://rpc.lisk.com", // <- update when mainnet launches
};

const provider = new ethers.JsonRpcProvider(PROVIDERS[NETWORK]);
const wallet = new ethers.Wallet(RELAYER_PRIVATE_KEY, provider);

// Deployed contract addresses (replace with your actual deployment results)
const forwarderAddress = "0xYour_MetaTxForwarder";
const paymentAddress = "0xYour_IDRXPayment";

const forwarderAbi = [
  "function nonces(address) view returns (uint256)",
  "function executeMetaTransaction(address,address,uint256,address,bytes) external"
];

const forwarder = new ethers.Contract(forwarderAddress, forwarderAbi, wallet);

export async function relayMetaTransaction({
  sender,
  receiver,
  amount,
  signature,
}: {
  sender: string;
  receiver: string;
  amount: string;
  signature: string;
}) {
  console.log("Relaying meta-tx on network:", NETWORK);
  const nonce = await forwarder.nonces(sender);
  const tx = await forwarder.executeMetaTransaction(
    sender,
    receiver,
    ethers.parseUnits(amount, 18),
    paymentAddress,
    signature
  );
  console.log("TX submitted:", tx.hash);
  await tx.wait();
  console.log("✅ Meta-tx executed and relayer reimbursed.");
}

