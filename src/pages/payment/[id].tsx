// src/pages/payment/[id].tsx
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useRef, useState } from 'react';
import { FaBitcoin } from 'react-icons/fa';
import { FiClock, FiCopy } from "react-icons/fi";
import { PiWarningOctagonFill } from "react-icons/pi";
import Swal from 'sweetalert2';
import Web3 from 'web3';
import config from '../../config';

interface PaymentDetails {
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

export default function PaymentPage() {
    const router = useRouter();
    const { id } = router.query; // ID sigue siendo parte del path, no un parámetro de consulta
    const [activeButton, setActiveButton] = useState('smartQR');
    const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
    const [timer, setTimer] = useState(900);

    // Referencia para el WebSocket para poder cerrarlo en el efecto de limpieza
    const webSocketRef = useRef<WebSocket | null>(null);

    // Agrega un estado para Web3 y la cuenta
    const [web3, setWeb3] = useState<Web3 | null>(null);
    const [account, setAccount] = useState(null);

    // Este useEffect se encarga de manejar el temporizador y la lógica de reinicio
    useEffect(() => {
        // Función para iniciar o reiniciar el temporizador
        const startTimer = (durationSeconds = 900) => {
            const endTime = new Date().getTime() + durationSeconds * 1000;
            localStorage.setItem(`timerEnd-${id}`, endTime.toString()); // Guarda usando el ID del pago
            setTimer(durationSeconds);
        };

        const calculateTimeLeft = () => {
            // Obtiene el tiempo de finalización del temporizador desde localStorage
            const endTime = localStorage.getItem(`timerEnd-${id}`);
            if (!endTime) {
                return 900; // Retorna el valor predeterminado si no hay tiempo almacenado
            }
            const now = new Date().getTime();
            const timeLeft = Math.max((parseInt(endTime) - now) / 1000, 0);
            return timeLeft;
        };

        // Calcula el tiempo restante al cargar la página
        const timeLeft = calculateTimeLeft();

        // Establece el temporizador con el tiempo restante
        setTimer(timeLeft);

        // Actualiza el temporizador cada segundo
        const intervalId = setInterval(() => {
            setTimer(prevTimer => {
                const newTimer = prevTimer - 1;
                if (newTimer <= 0) {
                    clearInterval(intervalId);
                    // Acciones a realizar cuando el temporizador llega a 0
                    // Por ejemplo, mostrar una alerta o cambiar el estado de la página
                }
                return Math.max(newTimer, 0);
            });
        }, 1000);

        return () => clearInterval(intervalId);
    }, [id]); // Dependencia del useEffect al ID del pago

    // Este useEffect se encarga de guardar la hora de finalización en localStorage cuando el temporizador cambia
    useEffect(() => {
        const endTime = new Date().getTime() + timer * 1000;
        localStorage.setItem('timerEnd', endTime.toString());
    }, [timer]);

    useEffect(() => {
        const fetchPaymentDetails = async () => {
            if (id) {
                try {
                    // Intenta recuperar datos adicionales guardados localmente primero
                    const savedPaymentData = localStorage.getItem('paymentData');
                    const localPaymentData = savedPaymentData ? JSON.parse(savedPaymentData) : {};

                    const response = await fetch(`https://payments.pre-bnvo.com/api/v1/orders/info/${id}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': 'Basic ' + btoa('username:password'), // Debes reemplazar 'username:password' con tus credenciales reales
                            'X-Device-Id': config.X_DEVICE_ID
                        }
                    });

                    console.log('response:', response);

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const [data] = await response.json();
                    console.log('Detalles del pedido:', data);

                    console.log('Local payment data:', localPaymentData);
                    // Antes de calcular, verifica que 'rate' y 'data.fiat_amount' existen y no son null.
                    const rate = localPaymentData.rate ?? 1; // Proporciona un valor predeterminado si es null.
                    const fiatAmount = parseFloat(data.fiat_amount ?? '0'); // Proporciona un valor predeterminado si es null.
                    console.log('rate:', rate);
                    console.log('fiatAmount:', fiatAmount);

                    const paymentUrl = localPaymentData.paymentUrl ?? '';
                    console.log('paymentUrl:', paymentUrl);

                    // Calcula la cantidad de criptomoneda a enviar.
                    const cryptoAmountToSend = (fiatAmount / rate).toFixed(2); 
                    console.log('cryptoAmountToSend:', cryptoAmountToSend);

                    // Parsear la fecha de creación
                    const createdAt = new Date(data.created_at);

                    // Formatear la fecha al formato deseado: dia/mes/año hora:minuto
                    const formatDate = (date: Date) => {
                        const day = date.getDate().toString().padStart(2, '0');
                        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth() devuelve 0-11
                        const year = date.getFullYear();
                        const hour = date.getHours().toString().padStart(2, '0');
                        const minute = date.getMinutes().toString().padStart(2, '0');

                        return `${day}/${month}/${year} ${hour}:${minute}`;
                    };
                        
                    // Combina los datos de la API con los datos locales
                    const combinedPaymentDetails = {
                        ...localPaymentData, // Datos de localStorage
                        ...data, // Sobrescribe con datos de la API
                        fiat_amount: data.fiat_amount ? data.fiat_amount.toString() : '0',
                        currency: data.currency_id, // Usar currency_id de la API
                        amount: localPaymentData.amount || data.crypto_amount.toString(), // Usar amount de localStorage o crypto_amount de la API
                        tagMemo: data.tag_memo || 'No proporcionado',
                        blockchainAddress: data.address || 'No proporcionado',
                        qrCodeUrl: paymentUrl,
                        // cryptoAmountToSend: cryptoAmountToSend,
                        cryptoAmountToSend: data.crypto_amount,
                        fiat: data.fiat,
                        created_at: formatDate(createdAt),
                    };
                
                    console.log('Combined payment details:', combinedPaymentDetails);
                    setPaymentDetails(combinedPaymentDetails);
                } catch (error) {
                    console.error("Error fetching payment details:", error);
                }
            }
        };

        fetchPaymentDetails();
    }, [id]);

    // Nuevo useEffect para manejar el WebSocket
    useEffect(() => {

        // Asegúrate de definir los posibles estados como un tipo si estás usando TypeScript
        type PaymentStatus = 'CO' | 'AC' | 'EX' | 'OC' | 'PE' | 'IA' | 'RF' | 'FA';
        
        const handlePaymentStatus = async (status: PaymentStatus) => {
            switch (status) {
                case 'CO':
                case 'AC':
                    // Redirigir sin mostrar alerta
                    await router.push(`/payment/payment-success`);
                    break;
                case 'EX':
                case 'OC':
                    // Redirigir sin mostrar alerta
                    await router.push(`/payment/payment-failure`);
                    break;
                case 'PE':
                    // Mostrar alerta de pago pendiente
                    await Swal.fire({
                        title: 'Pago Pendiente',
                        text: 'El pago está pendiente de confirmación.',
                        icon: 'warning',
                    });
                    break;
                case 'IA':
                    // Mostrar alerta de cantidad insuficiente
                    await Swal.fire({
                        title: 'Cantidad Insuficiente',
                        text: 'La cantidad de criptomoneda es menor que la requerida.',
                        icon: 'info',
                    });
                    break;
                case 'RF':
                    // Mostrar alerta de pago reembolsado
                    await Swal.fire({
                        title: 'Pago reembolsado',
                        text: 'La transacción ha sido reembolsada.',
                        icon: 'info',
                    });
                    break;
                case 'FA':
                    // Mostrar alerta de pago fallido
                    await Swal.fire({
                        title: 'Pago Fallido',
                        text: 'El pago ha fallado.',
                        icon: 'error',
                    });
                    break;
                default:
                    console.log(`Estado desconocido: ${status}`);
                    break;
            }
        };

        if (id) {
            try {
                const socketUrl = `wss://payments.pre-bnvo.com/ws/${id}`;
                console.log(`Conectando a WebSocket en URL: ${socketUrl}`);
                const socket = new WebSocket(socketUrl);
                webSocketRef.current = socket;

                socket.onopen = () => console.log("WebSocket conectado.");
                socket.onerror = (error) => console.error("WebSocket error:", error);
                
                socket.onmessage = (event) => {
                    console.log("Mensaje recibido desde WebSocket:", event.data);
                    const data = JSON.parse(event.data);
                    console.log('Data:', data);

                    // Actualizar el estado del pago con la nueva información recibida
                    setPaymentDetails((prevDetails) => ({ ...prevDetails, ...data }));

                    // Manejo de estados del pago
                    handlePaymentStatus(data.status);
                };
                socket.onerror = (error) => console.error("WebSocket Error:", error);
                socket.onclose = () => console.log("WebSocket Disconnected");

                console.log('webSocketRef:', webSocketRef);
                // Función de limpieza al desmontar el componente
                return () => {
                    socket.close();
                    webSocketRef.current = null;
                };
            } catch (error) {
                console.error("Error creating WebSocket:", error);
            }
            
        }
    }, [id, router]);

    const connectToMetaMask = async () => {
        if (window.ethereum) {
            const web3 = new Web3(window.ethereum);
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setAccount(accounts[0]);
                setWeb3(web3);
                console.log('Conectado a MetaMask');
                // No cambiar el botón activo aquí; dejar que el usuario continúe su acción deseada
                
            } catch (error) {
                console.error('Error al conectar con MetaMask:', error);
                Swal.fire('Error', 'No se pudo conectar con MetaMask. Asegúrate de haber concedido los permisos necesarios.', 'error');
            }
        } else {
            Swal.fire('MetaMask no encontrado', 'Instala MetaMask para continuar con la opción de pago Web3.', 'warning');
            // No redirigir automáticamente, dejar que el usuario decida
        }
    };

    // Función para copiar al portapapeles
    const handleCopyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(
            () => console.log('Texto copiado al portapapeles'),
            () => console.error('Error al copiar texto al portapapeles')
        );
    };

    // Función para cambiar el estado activo
    const handleActiveButton = async (buttonName: 'smartQR' | 'web3') => {
        if (buttonName === 'web3') {
            if (window.ethereum) {
                try {
                    // Intenta conectar a MetaMask aquí
                    await connectToMetaMask(); // Asume que esta función gestiona la conexión
                    setActiveButton(buttonName);
                } catch (error) {
                    // Maneja el error (usuario rechaza la conexión, etc.)
                    console.error('Error al conectar con MetaMask:', error);
                    Swal.fire('Error', 'No se pudo conectar con MetaMask.', 'error');
                }
            } else {
                // MetaMask no está instalado, muestra un mensaje y no cambies el botón activo.
                Swal.fire('MetaMask no encontrado', 'Instala MetaMask para usar esta opción.', 'warning');
            }
        } else {
            // Cambia al método de pago QR sin condiciones
            setActiveButton(buttonName);
        }
    };

    if (!paymentDetails) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>Detalles del Pago</title>
            </Head>

            <div className="flex flex-col justify-center min-h-screen bg-gray-50">

                {/* Contenido principal */}
                <div className="container mx-auto py-4">
                    <div className="flex flex-col md:flex-row justify-center items-start gap-16">
                        {/* ... (tus tarjetas de contenido aquí) ... */}

                        <div className="container mx-auto">
                            <div className="flex flex-col md:flex-row justify-center items-start px-32 gap-16">

                                {/* Card de resumen del pedido */}
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

                                {/* Card de realizar el pago */}
                                <div className="w-full md:w-1/2">
                                    <h2 className="text-xl font-bold mb-4">Realiza el pago</h2>
                                    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                                        <div className="flex justify-center items-center mb-4">
                                            <FiClock className="text-2xl m-1" />
                                            <span className="timer">{new Date(timer * 1000).toISOString().substr(14, 5)}</span> {/* Formato mm:ss */}
                                        </div>

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
                                        <div className="my-4 flex justify-center">
                                            {activeButton === 'smartQR' ? (
                                                // <Image src={paymentDetails.qrCodeUrl ?? ''} alt="Código QR de Pago" width={256} height={256} />
                                                <div className="px-6 py-4 bg-white rounded-md shadow-lg inline-block">
                                                  {/* ... otros componentes de tu página ... */}
                                                    {paymentDetails.qrCodeUrl && (
                                                        <div className="text-center my-4">
                                                            <QRCodeSVG value={paymentDetails.qrCodeUrl} size={200} />
                                                        </div>
                                                    )}
                                                  {/* ... más de tu JSX ... */}
                                                </div>
                                            ) : (
                                                <Image src="/images/metamask.jpg" alt="Metamask" width={250} height={250} />
                                            )}
                                        </div>
                                            
                                        <div className="flex justify-center items-center mb-2">
                                            <span>Enviar: {paymentDetails.cryptoAmountToSend  ?? '0.00'} {paymentDetails.currency}</span>
                                            <button onClick={() => handleCopyToClipboard(paymentDetails.cryptoAmountToSend  ?? '0.00')}>
                                                <FiCopy />
                                            </button>
                                        </div>
                                        <div className="text-gray-600 my-2">
                                            {paymentDetails.blockchainAddress ?? ''}
                                            <button onClick={() => handleCopyToClipboard(paymentDetails.blockchainAddress ?? '')}>
                                                <FiCopy />
                                            </button>
                                        </div>
                                        <div className="flex justify-center items-center my-2">
                                            <PiWarningOctagonFill className="text-lg mr-2 text-yellow-300"/>
                                            <div className='p-2'>
                                                <span className='text-blue-900'>Etiqueta de destino: {paymentDetails.tagMemo ?? ''}</span>
                                                <button onClick={() => handleCopyToClipboard(paymentDetails.tagMemo ?? '')}>
                                                    <FiCopy className='text-blue-400' />
                                                </button>
                                            </div>
                                        </div>
                                        {/* Añadir más elementos del diseño según sea necesario */}
                                    </div>
                                </div>
                                            
                            </div>
                        </div>

                    </div>
                </div>

                {/* Pie de página */}
                <footer className="w-full py-6 flex flex-col items-center justify-center">
                    <div className="flex items-center">
                        <span className="text-sm text-gray-600 mr-2">
                            Powered by
                        </span>
                        <FaBitcoin className="text-black h-6 w-6" />
                        <span className="font-bold">itnovo.</span>
                        <p className="text-center text-sm text-gray-600 mt-2">© 2022 Bitnovo. All rights reserved.</p>
                    </div>
                </footer>

            </div>
            
        </>
    );
}
