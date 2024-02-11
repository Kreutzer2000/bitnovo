// src/pages/index.tsx
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { AiOutlineSearch } from 'react-icons/ai';
import config from '../config';
import { Currency } from '../types/currency';

// Tipa las opciones para el componente Select
interface OptionType {
    value: string;
    label: string;
    image: string;
}

export default function CreatePayment() {
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [selectedCurrency, setSelectedCurrency] = useState<OptionType | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [amount, setAmount] = useState("");
    const router = useRouter();

    // Función para validar si todos los campos están llenos correctamente
    const isValidForm = () => {
        return selectedCurrency && amount.match(/^\d+(\.\d{0,2})?$/) && parseFloat(amount) > 0;
    };

    // Manejador para el cambio en el campo de importe, asegurándose de aceptar solo números y decimales
    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === "" || value.match(/^\d*\.?\d{0,2}$/)) {
            setAmount(value);
        }
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
                    cryptoAmount: orderData.expected_input_amount,
                    identifier: orderData.identifier,
                }));
                
                // Redirigir al usuario
                router.push(`/payment/${orderData.identifier}`);
            }
        }
    };

    const handleBlur = () => {
        setAmount((prevAmount) => {
            const number = parseFloat(prevAmount);
            return isNaN(number) ? "" : number.toFixed(2);
        });
    };

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

    // Filtra las monedas basándose en la entrada de búsqueda
    const filteredCurrencies = currencies?.filter(currency =>
        currency.name.toLowerCase().includes(inputValue.toLowerCase())
    );

    return (
        <>
            <Head>
                <title>Crear Pago</title>
            </Head>
            <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
                <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                    <h1 className="text-xl font-bold mb-8">Crear pago</h1>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="amount" className="block text-gray-700 text-sm font-bold mb-2">
                                Importe a pagar
                            </label>
                            <input
                                type="text"
                                id="amount"
                                value={amount}
                                onChange={handleAmountChange}
                                // onBlur={() => setAmount(amount => parseFloat(amount).toFixed(2))}
                                onBlur={handleBlur}
                                placeholder="Añade importe a pagar"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                        </div>
                        <div className="mb-4 relative">
                            <label htmlFor="currency" className="block text-gray-700 text-sm font-bold mb-2">
                                Seleccionar criptomoneda
                            </label>
                            <div className="relative">
                                <div
                                    onClick={() => setIsOpen(!isOpen)}
                                    className={`bg-white w-full p-2 flex items-center border ${
                                        !selectedCurrency && "text-gray-700"
                                    }`}
                                >
                                    {selectedCurrency ? (
                                        <>
                                            <Image
                                                src={selectedCurrency.image}
                                                alt={selectedCurrency.label}
                                                width={30}
                                                height={30}
                                                className="rounded-full"
                                                unoptimized // Solo si es necesario desactivar la optimización
                                            />
                                            <span className="ml-2">{selectedCurrency.label}</span>
                                        </>
                                    ) : (
                                        "Seleccionar criptomoneda"
                                    )}
                                    {/* Icono aquí */}
                                </div>
                                <div
                                    className={`absolute z-10 w-full bg-white border mt-1 ${
                                        isOpen ? "block" : "hidden"
                                    }`}
                                >
                                    <div className="flex items-center p-2">
                                        <AiOutlineSearch className="text-gray-700 mr-2" /> {/* Ícono de búsqueda */}
                                        <input
                                            type="text"
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            placeholder="Buscar"
                                            className="w-full p-2 border-b"
                                        />
                                    </div>
                                    <ul className="max-h-60 overflow-auto">
                                        {filteredCurrencies.map((currency) => (
                                            <li
                                                key={currency.symbol}
                                                className={`p-2 text-sm hover:bg-blue-500 hover:text-white ${
                                                    selectedCurrency?.value === currency.symbol && "bg-blue-500 text-white"
                                                }`}
                                                onClick={() => {
                                                    setSelectedCurrency({
                                                        value: currency.symbol,
                                                        label: currency.name,
                                                        image: currency.image, // Asegúrate de que la imagen esté disponible en los datos de la moneda
                                                    });
                                                    setIsOpen(false);
                                                }}
                                            >
                                                <div className="flex items-center">
                                                    {currency.image && (
                                                        <Image
                                                            src={currency.image}
                                                            alt={currency.name}
                                                            width={30}
                                                            height={30}
                                                            className="rounded-full"
                                                            unoptimized // Solo si es necesario desactivar la optimización
                                                        />
                                                    )}
                                                    <span className="ml-2">{currency.name}</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="mb-8">
                            <label htmlFor="concept" className="block text-gray-700 text-sm font-bold mb-2">
                                Concepto
                            </label>
                            <input type="text" id="concept" placeholder="Añade descripción del pago"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
                        </div>
                        <button
                            type="submit"
                            className={`w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                                !isValidForm() ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                            disabled={!isValidForm()}
                        >
                            Continuar
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
