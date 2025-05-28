# OnPay — Seamless, Gasless Payments on Lisk

**OnPay** is a decentralized payment system built on the **Lisk** network that enables **gasless transactions** using **meta-transactions**, a custom **ENS-style naming system**, and smooth wallet integration with **Xellar SDK**.

## Features

- 🔋 **Meta-Transactions (Gasless UX):** Users sign transactions off-chain; the OnPay relayer sends them on-chain and covers the gas fees.
- 🌐 **Custom ENS Naming System on Lisk:** A human-readable naming service (`yourname.lisk.eth`) that works even though Lisk doesn't natively support ENS.
- 🔐 **Xellar SDK Integration:** Enables secure wallet login, message signing, and transaction interactions for both desktop and mobile users.
- 🔄 **Cross-Compatibility Ready:** Designed with a smooth path for potential L1-L2 integrations in the future.

---

## Tech Stack

| Layer       | Tech                        |
|------------|-----------------------------|
| Blockchain  | Lisk (L2 Rollup)            |
| Smart Contracts | Solidity (meta-tx logic, ens logic) |
| Wallet Integration | Xellar Kit      |
| Naming System | Custom ENS-like solution   |
| Frontend    | Next.js + Wagmi + viem      |
| Backend     | Cloudflare (D1 DB, Workers) |
| Offchain Resolver | CCIP-Read Architecture  |

---

## Demo

https://youtu.be/aYsm5ScMwxs?si=gnmFHeliwlzNUxDY


## Try it yourself 

https://onpay-seamless.vercel.app/