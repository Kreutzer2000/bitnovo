// src/components/QRCodeDisplay.tsx
import { QRCodeSVG } from 'qrcode.react';
import React from 'react';

interface QRCodeDisplayProps {
    qrCodeUrl: string;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ qrCodeUrl }) => (
    <div className="text-center my-4">
        <QRCodeSVG value={qrCodeUrl} size={200} />
    </div>
);

export default QRCodeDisplay;
