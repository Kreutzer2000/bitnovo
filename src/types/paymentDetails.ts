// src/types/paymentDetails.ts

export interface PaymentDetails {
    fiat_amount?: string;
    cryptoAmountToSend?: string;
    amount?: string;
    currency?: string;
    concept?: string;
    date?: string;
    qrCodeUrl?: string;
    blockchainAddress?: string;
    tagMemo?: string;
    fiat?: string;
    created_at?: string;
}
