'use client'
import React from 'react';
import QRCode from 'react-qr-code';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';

const ReceiveFunds: React.FC = () => {
    const { address: walletAddress } = useAccount();
    const router = useRouter();
    const qrCodeValue = `/send?address=${walletAddress}`;

    const handleScan = () => {
        router.push(`/send?address=${walletAddress}`);
    };

    return (
        <div className="flex flex-col items-center p-4 bg-white rounded-3xl">
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
                {walletAddress}
            </div>
        </div>
    );
};

export default ReceiveFunds;
