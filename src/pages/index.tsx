// src/pages/index.tsx
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import AmountInput from '../components/AmountInput';
import ConceptInput from '../components/ConceptInput';
import FormSubmitButton from '../components/FormSubmitButton';
import SelectCurrency from '../components/SelectCurrency';
import config from '../config';
import { Currency } from '../types/currency';
import { OptionType } from '../types/optionType';

export default function CreatePayment() {
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [selectedCurrency, setSelectedCurrency] = useState<OptionType | null>(null);
    const [amount, setAmount] = useState("");
    const [concept, setConcept] = useState("");
    const router = useRouter();

    useEffect(() => {
        async function fetchCurrencies() {
            try {
                const response = await fetch(`${config.API_BASE_URL}/currencies`, {
                    headers: {
                        'X-Device-Id': config.X_DEVICE_ID
                    }
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                let data: Currency[] = await response.json();
				
				// Aquí mapeamos los datos recibidos para cambiar los nombres
                data = data.map((item) => {
                    let name = item.name;
                    if (name.includes('Bitcoin Cash Test')) name = 'Bitcoin BCH';
                    if (name.includes('Bitcoin Test')) name = 'Bitcoin BTC';
                    if (name.includes('Ethereum Goerli')) name = 'Ethereum ETH';
                    if (name.includes('Ripple Test')) name = 'Ripple XRP';
                    if (name.includes('USD Coin')) name = 'USD Coin USDC';
                
                  return { ...item, name }; // Retorna el objeto modificado con el nuevo nombre
                });

                console.log("Currencies:", data);
                setCurrencies(data);
            } catch (error) {
                console.error("Error fetching currencies:", error);
            }
        }
        fetchCurrencies();
    }, []);

    const isValidForm = (): boolean => {
        return !!selectedCurrency && !!amount.match(/^\d+(\.\d{0,2})?$/) && parseFloat(amount) > 0;
    };

    // Manejador para el envío del formulario
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isValidForm() && selectedCurrency) {
            const orderResponse = await fetch('https://payments.pre-bnvo.com/api/v1/orders/', {
                method: 'POST',
                headers: {
                    'Authorization': 'Basic ' + btoa('username:password'), // Reemplaza con tus credenciales
                    'Content-Type': 'application/json',
                    'X-Device-Id': config.X_DEVICE_ID
                },
                body: JSON.stringify({
                    expected_output_amount: amount,
                    input_currency: selectedCurrency.value,
                    // notes: 'Descripción del pago',
                }),
            });
            console.log('orderResponse:', orderResponse);

            if (!orderResponse.ok) {
                throw new Error(`HTTP error! status: ${orderResponse.status}`);
            } else {
                const orderData = await orderResponse.json();
                console.log('orderData:', orderData);
                
                // Guardar los datos en localStorage
                localStorage.setItem('paymentData', JSON.stringify({
                    amount: amount,
                    currency: selectedCurrency.value,
                    concept: (document.getElementById('concept') as HTMLInputElement).value,
                    rate: orderData.rate, // Guarda la tasa de cambio
                    paymentUrl: orderData.payment_uri,
                    cryptoAmount: orderData.expected_input_amount,
                    identifier: orderData.identifier,
                }));

                console.log('Payment data saved:', localStorage.getItem('paymentData'));
                
                // Redirigir al usuario
                router.push(`/payment/${orderData.identifier}`);
            }
        }
    };

    return (
        <>
            <Head>
                <title>Crear Pago</title>
            </Head>
            <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
                <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                    <h1 className="text-xl font-bold mb-8">Crear pago</h1>
                    <form onSubmit={handleSubmit}>
                        <AmountInput amount={amount} setAmount={setAmount} />
                        <SelectCurrency currencies={currencies} selectedCurrency={selectedCurrency} setSelectedCurrency={setSelectedCurrency} />
                        <ConceptInput concept={concept} setConcept={setConcept} />
                        <FormSubmitButton isValidForm={isValidForm()} />
                    </form>
                </div>
            </div>
        </>
    );
}
