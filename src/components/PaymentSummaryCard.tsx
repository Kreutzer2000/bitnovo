// src/components/PaymentSummaryCard.tsx
import React from 'react';
import { PaymentDetails } from '../types/paymentDetails';

const PaymentSummaryCard: React.FC<{ paymentDetails: PaymentDetails }> = ({ paymentDetails }) => (
    
    <div className="w-full md:w-1/2"> 
        <h2 className="text-xl font-bold mb-4">Resumen del pedido</h2>
        <div className="bg-gray-100 p-6 rounded-lg shadow-lg">
            <div className="mb-3 flex justify-between border-b-2 border-gray-300 pb-2">
                <span><strong>Importe:</strong></span> 
                <span>{paymentDetails.amount} {paymentDetails.fiat}</span>
            </div>
            <div className="mb-3 flex justify-between border-b-2 border-gray-300 pb-2">
                <span><strong>Moneda seleccionada:</strong></span> 
                <span>{paymentDetails.currency}</span>
            </div>
            <div className="mb-3 flex justify-between">
                <span><strong>Comercio:</strong></span> 
                <span>Comercio de pruebas de Semega</span>
            </div>
            <div className="mb-3 flex justify-between border-b-2 border-gray-300 pb-2">
                <span><strong>Fecha:</strong></span> 
                <span>{paymentDetails.created_at}</span>
            </div>
            <div className="flex justify-between">
                <span><strong>Concepto:</strong></span> 
                <span>{paymentDetails.concept}</span>
            </div>
        </div>
    </div>
);

export default PaymentSummaryCard;