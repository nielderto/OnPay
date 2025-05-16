import { XellarSDK, Network } from "@xellar/sdk"
import { jwtDecode } from "jwt-decode"
import { ethers } from "ethers"
const LISK_SEPOLIA = Network.LISK_SEPOLIA
const IDRX_LISK_SEPOLIA_ADDRESS = '0xD63029C1a3dA68b51c67c6D1DeC3DEe50D681661'

const sdk = new XellarSDK({
    clientSecret: 'XELLAR_CLIENT_SECRET',
    appId: 'XELLAR_APP_ID', // Optional. If you use appId, you need to add your origin in Xellar Dashboard.
    env: 'sandbox',
});

type XellarAddress = {
    network: string,    
    address: string
}

type LoginResult = 
    | {
        type: "created", 
        walletToken: string, 
        refreshToken: string, 
        address: XellarAddress, 
        secret0Link: string
    }
    | {
        type: "existing", 
        walletToken: string, 
        refreshToken: string, 
    }

type DecodedJWT = {
    exp: number // expiry time 
}

type BalanceResult = {
    balance: string;
    symbol: string;
    address: string;
    walletToken?: string;
    refreshToken?: string;
};

function getEVMAddress(addresses: XellarAddress[]): string | undefined {
    return addresses.find((addr) => addr.network === "evm")?.address;
}

export async function loginWithEmail(email: string){
    const verificationToken = await sdk.auth.email.login(email)
    return verificationToken
}


export async function verifyOtpAndCreateWallet(verificationToken: string, otp: string): Promise<LoginResult> {
    const result = await sdk.auth.email.verify(verificationToken, otp)

    if (!result.isWalletCreated) {
        const accessToken = result.accessToken
        const decoded: DecodedJWT = jwtDecode(accessToken)
        const expDate = new Date(decoded.exp * 1000)
        const expiredDate: string = expDate.toISOString().split("T")[0] // "YYYY-MM-DD"
        console.log("Token expires at:", expiredDate)
        
        const created = await sdk.account.wallet.create({expiredDate, accessToken})
        console.log("Wallet created:", created.address)
        return {
            type: "created", 
            walletToken: created.walletToken, 
            refreshToken: created.refreshToken, 
            address: created.address[0], 
            secret0Link: created.secret0Link
        }
    } else {
        return {
            type: "existing", 
            walletToken: result.walletToken, 
            refreshToken: result.refreshToken, 
        }
    }
}
  
export async function checkTokenBalance({
    tokenAddress,
    network,
    walletToken,
    refreshToken,
  }: {
    tokenAddress: string;
    network: Network;
    walletToken: string;
    refreshToken?: string;
  }) {
    if (refreshToken) {
      const result = await sdk.wallet.balanceToken({
        tokenAddress,
        network,
        walletToken,
        refreshToken,
      });
  
      return {
        balance: result.balance,
        symbol: result.symbol,
        address: result.address,
        walletToken: result.walletToken,
        refreshToken: result.refreshToken,
      };
    } else {
      const result = await sdk.wallet.balanceToken({
        tokenAddress,
        network,
        walletToken,
      });
  
      return {
        balance: result.balance,
        symbol: result.symbol,
        address: result.address,
      };
    }
}


export async function signIDRXMetaTx({
    sender,
    receiver,
    amount,
    walletToken,
    refreshToken,
    contractAddress,
    nonce,
  }: {
    sender: string;
    receiver: string;
    amount: string;
    walletToken: string;
    refreshToken?: string;
    contractAddress: string;
    nonce: number;
  }) {
    const message = ethers.solidityPackedKeccak256([
      "address",
      "address",
      "uint256",
      "address",
      "uint256",
    ], [
      sender,
      receiver,
      amount,
      contractAddress,
      nonce,
    ]);
  
    const signed = await sdk.wallet.signMessage({
      message,
      network: Network.LISK_SEPOLIA,
      walletToken,
    });
  
    return signed.signature;
}
  


