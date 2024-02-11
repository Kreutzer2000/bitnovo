// src/pages/payment/payment-failure.tsx
import Head from 'next/head';
import Link from 'next/link';

export default function PaymentFailure() {
    return (
        <>
            <Head>
                <title>Pago cancelado</title>
            </Head>
            <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center w-1/3 h-1/4">
                    <div className="mb-4">
                        <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold mb-4">Pago cancelado</h2>
                    <p className="mb-4">Lorem ipsum dolor sit amet consectetur. Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
                    <Link href="/" className="inline-block bg-blue-500 text-white font-bold py-2 px-4 rounded w-full hover:bg-blue-700">
                        Crear nuevo pago
                    </Link>
                </div>
            </div>
        </>
    );
}
