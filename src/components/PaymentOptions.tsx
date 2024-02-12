// src/components/PaymentOptions.tsx
import React from 'react';

interface PaymentOptionsProps {
    activeButton: 'smartQR' | 'web3';
    handleActiveButton: (buttonName: 'smartQR' | 'web3') => void;
}

const PaymentOptions: React.FC<PaymentOptionsProps> = ({ activeButton, handleActiveButton }) => (
    <div className="my-4 text-center">
        <button onClick={() => handleActiveButton('smartQR')}
                className={`py-2 px-4 rounded-3xl focus:outline-none ${activeButton === 'smartQR' ? 'bg-blue-500 text-white' : ''}`}>
            Smart QR
        </button>
        <button onClick={() => handleActiveButton('web3')}
                className={`ml-2 py-2 px-4 rounded-3xl focus:outline-none ${activeButton === 'web3' ? 'bg-blue-500 text-white' : ''}`}>
            Web3
        </button>
    </div>
);

export default PaymentOptions;
