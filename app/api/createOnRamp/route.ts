// pages/api/create-onramp.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { createSignature } from '@/app/api/transaction/createSignature';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { bankCode, bankAccountNumber, mintAmount, walletAddress } = req.body;

  if (!bankCode || !bankAccountNumber || !mintAmount || !walletAddress) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const apiKey = process.env.IDRX_API_KEY;
  const secret = process.env.IDRX_SECRET_KEY;

  if (!apiKey || !secret) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    // Add bank account
    const bankPath = 'https://idrx.co/api/auth/add-bank-account';
    const bankReq = { bankAccountNumber, bankCode };
    const bankBufferReq = Buffer.from(JSON.stringify(bankReq)).toString('base64');
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const bankSig = createSignature('POST', bankPath, bankBufferReq, timestamp, secret);

    const bankResponse = await axios.post(bankPath, bankReq, {
      headers: {
        'Content-Type': 'application/json',
        'idrx-api-key': apiKey,
        'idrx-api-sig': bankSig,
      },
    });

    if (!bankResponse.data.success) {
      return res.status(400).json({ error: bankResponse.data.message || 'Failed to add bank account' });
    }

    // Create mint request
    const mintPath = 'https://idrx.co/api/transaction/mint-request';
    const mintReq = {
      toBeMinted: mintAmount,
      destinationWalletAddress: walletAddress,
      expiryPeriod: 3600,
      networkChainId: '2026',
      requestType: 'idrx',
    };
    const mintBufferReq = Buffer.from(JSON.stringify(mintReq)).toString('base64');
    const mintTimestamp = Math.floor(Date.now() / 1000).toString();
    const mintSig = createSignature('POST', mintPath, mintBufferReq, mintTimestamp, secret);

    const mintResponse = await axios.post(mintPath, mintReq, {
      headers: {
        'Content-Type': 'application/json',
        'idrx-api-key': apiKey,
        'idrx-api-sig': mintSig,
      },
    });

    if (!mintResponse.data.success) {
      return res.status(400).json({ error: mintResponse.data.message || 'Failed to create mint request' });
    }

    return res.status(200).json({ message: 'Transaction successful', data: mintResponse.data });
  } catch (error: any) {
    console.error('Transaction error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
