'use client'
import React from 'react';
import QRCode from 'react-qr-code';
import { useAccount, useEnsName } from 'wagmi';
import { useRouter } from 'next/navigation';

const ReceiveFunds: React.FC = () => {
    const { address: walletAddress } = useAccount();
    const { data: ensName } = useEnsName({ address: walletAddress });
    const router = useRouter();

    const baseUrl = "https://lisk-builders-challenge.vercel.app";
    const qrCodeValue = ensName
        ? `${baseUrl}/send?ens=${encodeURIComponent(ensName)}`
        : `${baseUrl}/send?address=${walletAddress}`;

    const handleScan = () => {
        router.push(qrCodeValue);
    };

    return (
<div className="flex flex-col items-center justify-center p-4 relative">
      {/* Background elements */}
      <div className="fixed inset-0 z-[-1]">
        {/* Hexagon grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15L30 0z' fillRule='evenodd' stroke='%230000FF' strokeWidth='2' fill='none'/%3E%3C/svg%3E")`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

        <div className="flex flex-col items-center p-4 bg-white rounded-3xl max-w-[45rem]">
            <h2 className="text-xl font-bold mb-4">Receive Funds</h2>
            <div className="bg-white p-4 rounded-lg cursor-pointer" onClick={handleScan}>
                <QRCode 
                    value={qrCodeValue}
                    size={256}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    viewBox={`0 0 256 256`}
                />
            </div>
            <p className="mt-4 text-sm text-gray-600">
                Click or scan this QR code to send funds to this address
            </p>
            <div className="mt-2 text-xs break-all text-gray-500">
                {ensName || walletAddress}
            </div>
        </div>
        </div>
    );
};

export default ReceiveFunds;
