import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { metaTxForward } from "@/abi/metatxfoward";

// Log environment variables (without exposing the private key)
console.log("API route initialized with:", {
  hasRelayerPrivateKey: !!process.env.RELAYER_PRIVATE_KEY,
  metaTxForwarderAddress: metaTxForward.address,
});

const provider = new ethers.JsonRpcProvider("https://rpc.sepolia-api.lisk.com");
const relayerWallet = new ethers.Wallet(process.env.RELAYER_PRIVATE_KEY!, provider);
const contract = new ethers.Contract(metaTxForward.address, metaTxForward.abi, relayerWallet);

export async function POST(request: NextRequest) {
  console.log("API route POST request received");
  
  try {
    const body = await request.json();
    console.log("Request body:", {
      from: body.from,
      to: body.to,
      amount: body.amount,
      targetContract: body.targetContract,
      nonce: body.nonce,
      hasSignature: !!body.signature,
      signatureLength: body.signature?.length,
    });
    
    const { from, to, amount, targetContract, nonce, signature } = body;

    if (!from || !to || !amount || !targetContract || !nonce || !signature) {
      console.error("Missing required parameters:", {
        hasFrom: !!from,
        hasTo: !!to,
        hasAmount: !!amount,
        hasTargetContract: !!targetContract,
        hasNonce: !!nonce,
        hasSignature: !!signature,
      });
      
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    console.log("Processing meta-transaction:", {
      from,
      to,
      amount,
      targetContract,
      nonce,
      signatureLength: signature.length,
    });

    // 1. Verify the signature using the contract's verify function
    console.log("Verifying signature...");
    const isValid = await contract.verify(
      from,
      to,
      amount,
      targetContract,
      nonce,
      signature
    );
    console.log("Signature verification result:", isValid);

    if (!isValid) {
      console.error("Invalid signature for meta-transaction");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // 2. Execute the meta transaction
    console.log("Executing meta-transaction...");
    const tx = await contract.executeMetaTransaction(
      from,
      to,
      amount,
      targetContract,
      signature
    );
    console.log("Transaction sent:", tx.hash);

    // 3. Wait for the transaction to be mined
    console.log("Waiting for transaction to be mined...");
    const receipt = await tx.wait();
    console.log("Transaction receipt:", {
      hash: receipt.hash,
      status: receipt.status,
      blockNumber: receipt.blockNumber,
    });
    
    if (receipt.status === 0) {
      console.error("Meta-transaction failed:", receipt);
      return NextResponse.json(
        { error: "Transaction failed on chain" },
        { status: 500 }
      );
    }

    console.log("Meta-transaction successful!");
    return NextResponse.json({ 
      success: true, 
      txHash: receipt.hash,
      status: 'success'
    });
  } catch (err: any) {
    console.error('Meta transaction error:', err);
    return NextResponse.json(
      { 
        error: err.message || 'Failed to execute meta transaction',
        details: err.data || err.reason || 'Unknown error'
      },
      { status: 500 }
    );
  }
}