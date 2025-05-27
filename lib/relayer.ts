import { ethers } from "ethers";
import { metaTxForward } from '@/abi/metatxfoward';
import { idrxPayConfig } from "@/abi/idrxPay";

const RELAYER_PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY!;
const NETWORK = "liskSepolia"; // or "liskMainnet"

// Configure provider for Lisk EVM networks
const PROVIDERS: Record<string, string> = {
  liskSepolia: "https://rpc.sepolia-api.lisk.com",
  // liskMainnet: "https://rpc.lisk.com",
};

const provider = new ethers.JsonRpcProvider(PROVIDERS[NETWORK]);
const wallet = new ethers.Wallet(RELAYER_PRIVATE_KEY, provider);

const metaTxForwardContract = new ethers.Contract(
  metaTxForward.address,
  metaTxForward.abi,
  wallet
);

// In-memory nonce tracking to avoid "already known" transaction errors
let currentNonce: number | null = null;

async function getCurrentNonce() {
  if (currentNonce === null) {
    // Initialize with the on-chain nonce
    currentNonce = await provider.getTransactionCount(wallet.address);
    console.log(`Initial nonce for relayer: ${currentNonce}`);
  } else {
    // Check if our in-memory nonce is behind the on-chain nonce
    const onChainNonce = await provider.getTransactionCount(wallet.address);
    if (onChainNonce > currentNonce) {
      currentNonce = onChainNonce;
      console.log(`Updated nonce to match chain: ${currentNonce}`);
    }
  }
  return currentNonce;
}

function incrementNonce() {
  if (currentNonce !== null) {
    currentNonce++;
    console.log(`Incremented nonce to: ${currentNonce}`);
  }
}

async function checkTokenBalances(sender: string) {
  try {
    // Check relayer's native LISK balance first
    const nativeBalance = await provider.getBalance(wallet.address);
    console.log(`Relayer native ETH balance: ${ethers.formatEther(nativeBalance)} LSK`);

    if (nativeBalance === BigInt(0)) {
      console.error("⚠️ CRITICAL: Relayer has no LISK for gas fees! This will cause transactions to fail.");
    } else if (nativeBalance < ethers.parseEther("0.01")) {
      console.warn("⚠️ WARNING: Relayer has very low LISK balance for gas fees!");
    }

    // Get the token contract address from the payment contract
    const paymentContract = new ethers.Contract(
      idrxPayConfig.address,
      idrxPayConfig.abi,
      provider
    );

    const tokenAddress = await paymentContract.idrxToken();
    console.log("IDRX Token address from contract:", tokenAddress);

    // Check balances for both relayer and sender
    const tokenContract = new ethers.Contract(
      tokenAddress,
      [
        "function balanceOf(address) view returns (uint256)",
        "function decimals() view returns (uint8)",
        "function symbol() view returns (string)",
        "function allowance(address,address) view returns (uint256)"
      ],
      provider
    );

    const [relayerBalance, senderBalance, decimals, symbol, allowance] = await Promise.all([
      tokenContract.balanceOf(wallet.address),
      tokenContract.balanceOf(sender),
      tokenContract.decimals(),
      tokenContract.symbol().catch(() => "UNKNOWN"),
      tokenContract.allowance(sender, idrxPayConfig.address)
    ]);

    console.log(`Relayer balance: ${ethers.formatUnits(relayerBalance, decimals)} ${symbol}`);
    console.log(`Relayer address: ${wallet.address}`);
    console.log(`Sender balance: ${ethers.formatUnits(senderBalance, decimals)} ${symbol}`);
    console.log(`Sender allowance to Payment contract: ${ethers.formatUnits(allowance, decimals)} ${symbol}`);
    console.log(`Payment contract address: ${idrxPayConfig.address}`);

    return {
      relayer: {
        address: wallet.address,
        nativeLiskBalance: nativeBalance.toString(),
        formattedNativeBalance: ethers.formatEther(nativeBalance),
        tokenBalance: relayerBalance.toString(),
        formattedTokenBalance: ethers.formatUnits(relayerBalance, decimals)
      },
      sender: {
        address: sender,
        balance: senderBalance.toString(),
        formattedBalance: ethers.formatUnits(senderBalance, decimals),
        allowance: allowance.toString(),
        formattedAllowance: ethers.formatUnits(allowance, decimals)
      },
      tokenAddress,
      symbol,
      decimals
    };
  } catch (error) {
    console.error("Error checking token balances:", error);
    return {
      error: "Failed to check balances"
    };
  }
}

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
}): Promise<string> {
  console.log("Relaying meta-tx on network:", NETWORK);
  console.log("Params:", { sender, receiver, amount, signatureLength: signature.length });

  // Check all token balances first
  const balanceInfo = await checkTokenBalances(sender);
  console.log("Token balance info:", balanceInfo);

  // Extract the token decimals from the balance check
  const tokenDecimals = balanceInfo.decimals ? Number(balanceInfo.decimals) : 2;
  console.log(`Using token decimals: ${tokenDecimals}`);

  try {
    // Get the current nonce for the sender contract
    const senderContractNonce = await metaTxForwardContract.nonces(sender);
    console.log("Current nonce for sender in contract:", senderContractNonce.toString());

    // Get and update our own relayer account nonce
    const nonce = await getCurrentNonce();
    console.log("Using relayer nonce:", nonce);

    // First check if the transaction would succeed using estimateGas
    console.log("Estimating gas...");
    try {
      const gasEstimate = await metaTxForwardContract.executeMetaTransaction.estimateGas(
        sender,
        receiver,
        ethers.parseUnits(amount, tokenDecimals), // Use correct decimals
        idrxPayConfig.address,
        signature
      );
      console.log("Gas estimate:", gasEstimate.toString());
    } catch (estimateError: any) {
      console.error("Gas estimation failed (this is a simulation, showing likely transaction failure):", estimateError);
      throw new Error(`Transaction would fail: ${estimateError.message}`);
    }

    // Execute the transaction with explicit Lisk network configuration
    console.log("Executing transaction...");
    const tx = await metaTxForwardContract.executeMetaTransaction(
      sender,
      receiver,
      ethers.parseUnits(amount, tokenDecimals), // Use correct decimals
      idrxPayConfig.address,
      signature,
      {
        gasLimit: 300000, // Set a higher gas limit to ensure it goes through
        nonce: nonce,     // Explicitly set the nonce
        // Lisk Sepolia configurations
        chainId: 4202,    // Lisk Sepolia chain ID
        type: 2,          // EIP-1559 transaction
        maxFeePerGas: ethers.parseUnits("1", "gwei"), // Adjust as needed
        maxPriorityFeePerGas: ethers.parseUnits("1", "gwei") // Adjust as needed
      }
    );

    console.log("TX submitted:", tx.hash);

    // Increment our nonce tracker after sending
    incrementNonce();

    const receipt = await tx.wait();
    console.log("TX confirmed! Receipt:", {
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      status: receipt.status
    });

    console.log("✅ Meta-tx executed and relayer reimbursed.");
    return tx.hash;
  } catch (error: any) {
    console.error("Transaction failed:", error);

    // Try to extract more useful information from the error
    if (error.data) {
      console.error("Error data:", error.data);
    }

    if (error.reason) {
      console.error("Error reason:", error.reason);
    }

    // Check if it's a nonce error and try to recover
    if (error.message && (
      error.message.includes("already known") ||
      error.message.includes("nonce too low") ||
      error.message.includes("replacement transaction underpriced")
    )) {
      console.log("Nonce error detected, attempting to recover...");

      // Force refresh of the nonce from the chain
      currentNonce = null;
      await getCurrentNonce();

      throw new Error(`Transaction nonce issue: ${error.message}. Please try again.`);
    }

    throw error;
  }
}
