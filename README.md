# 🌐 OnPay

**OnPay** is a next-generation blockchain-powered payment app that makes transferring **IDRX** tokens effortless, lightning-fast, and user-friendly.

We believe crypto payments should be as simple as sending a message — and with OnPay, that's exactly what you get.

---

## ✨ Key Features

- ⚡ **Fast & Secure Transactions**  
  Built on a robust blockchain network to ensure quick and safe transfers of IDRX tokens.

- 🧠 **Effortless Wallets & Gas-Free Payments**
No need to worry about creating a wallet—OnPay will generate one for you if you don’t have one. Plus, you can send and receive payments instantly with IDRX, without ever paying gas fees.

- 🎨 **Clean & Intuitive UI**  
  A sleek and modern interface designed for simplicity, accessibility, and a seamless user experience.

- 🔐 **Decentralized & Trustless**  
  Your assets, your control. No middlemen, no compromises — full ownership over your funds.

- 💸 **Gas-Free Transactions**  
  Send IDRX tokens without paying gas fees using our meta-transaction system.

---

## 💡 Why OnPay?

Traditional crypto wallets rely on long hexadecimal addresses like:

`0x8cD9F1e0b7A12345aBcDe98765e123456789abcd`


That's hard to remember, easy to mistype, and not at all beginner-friendly.

**OnPay fixes this.**  
With our ENS-powered naming system, users can register unique usernames like:


`@jenny.idrx` `@markus.idrx` `@shop123.idrx`

This creates a payment experience that feels familiar — like sending money on your favorite messaging app — but fully decentralized.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- A wallet with some Lisk Sepolia testnet ETH for gas fees (if not using meta-transactions)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/onpay.git
cd onpay
```

2. Install dependencies
```bash
pnpm install
```

3. Set up environment variables
Create a `.env.local` file in the root directory with the following variables:
```
# Lisk Sepolia Testnet
RELAYER_PRIVATE_KEY=your_relayer_private_key_here
NEXT_PUBLIC_IDRX_CONTRACT=0x5b7E831A950C03275d92493265219d71FB58b73B
NEXT_PUBLIC_META_TX_FORWARDER=0xaDaD91104d4024D9374aFEBB28CdDad9fB1B95f3
```

4. Start the development server
```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🔧 Meta-Transactions

OnPay uses meta-transactions to allow users to send IDRX tokens without paying gas fees. The process works as follows:

1. The user signs a message authorizing the transfer
2. The signature is sent to our relay server
3. The relay server submits the transaction on behalf of the user
4. The user's tokens are transferred without them paying gas fees

To set up the relay server, you need to:

1. Create a wallet with some Lisk Sepolia testnet ETH
2. Add the private key to your `.env.local` file as `RELAYER_PRIVATE_KEY`
3. The relay server will use this wallet to pay for gas fees on behalf of users
