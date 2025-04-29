import { ethers } from "ethers";
import { metaTxForward } from "@/abi/metatxfoward";

export async function signMetaTransaction({
  sender,
  receiver,
  amount,
  paymentAddress,
  forwarderAddress,
  provider,
}: {
  sender: string;
  receiver: string;
  amount: string; // in normal units (e.g., "10" IDRX)
  paymentAddress: string;
  forwarderAddress: string;
  provider: ethers.BrowserProvider;
}) {
  const signer = await provider.getSigner();
  
  // Connect to MetaTxForwarder
  const metaTxForwarder = new ethers.Contract(metaTxForward.address, metaTxForward.abi, provider);

  const nonce = await metaTxForwarder.nonces(sender);

  // Hash the transaction data
  const messageHash = ethers.solidityPackedKeccak256(
    ["address", "address", "uint256", "address", "uint256"],
    [
      sender,
      receiver,
      ethers.parseUnits(amount, 18), // remember: 18 decimals
      paymentAddress,
      nonce
    ]
  );

  // Ask user to sign the hash
  const signature = await signer.signMessage(ethers.getBytes(messageHash));

  return {
    sender,
    receiver,
    amount,
    nonce: nonce.toString(),
    signature,
  };
}
