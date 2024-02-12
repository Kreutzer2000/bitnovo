// src/components/AmountInput.tsx
import { Dispatch, SetStateAction } from 'react';

interface Props {
    amount: string;
    setAmount: Dispatch<SetStateAction<string>>;
}

const AmountInput: React.FC<Props> = ({ amount, setAmount }) => {
    // Manejador para el cambio en el campo de importe, asegurándose de aceptar solo números y decimales
        const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            if (value === "" || value.match(/^\d*\.?\d{0,2}$/)) {
                setAmount(value);
            }
        };

    const handleBlur = () => {
        setAmount((prevAmount) => {
            const number = parseFloat(prevAmount);
            return isNaN(number) ? "" : number.toFixed(2);
        });
    };

    return (
        <div className="mb-4">
            <label htmlFor="amount" className="block text-gray-700 text-sm font-bold mb-2">
                Importe a pagar
            </label>
            <input
                type="text"
                id="amount"
                value={amount}
                onChange={handleAmountChange}
                onBlur={handleBlur}
                placeholder="Añade importe a pagar"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
        </div>
    );
};

export default AmountInput;