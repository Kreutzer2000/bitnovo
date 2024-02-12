// src/components/SelectCurrency.tsx
import Image from 'next/image';
import { useState } from 'react';
import { AiOutlineSearch } from 'react-icons/ai';
import { Currency } from '../types/currency';
import { OptionType } from '../types/optionType';

interface Props {
    currencies: Currency[];
    selectedCurrency: OptionType | null;
    setSelectedCurrency: (currency: OptionType | null) => void;
}

const SelectCurrency: React.FC<Props> = ({ currencies, selectedCurrency, setSelectedCurrency }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");

    // Filtra las monedas basándose en la entrada de búsqueda
    const filteredCurrencies = currencies?.filter(currency =>
        currency.name.toLowerCase().includes(inputValue.toLowerCase())
    );

    return (
        <div className="mb-4 relative">
            <label htmlFor="currency" className="block text-gray-700 text-sm font-bold mb-2">
                Seleccionar criptomoneda
            </label>
            <div className="relative">
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className={`bg-white w-full p-2 flex items-center border ${!selectedCurrency && "text-gray-700"}`}
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
                </div>
                <div className={`absolute z-10 w-full bg-white border mt-1 ${isOpen ? "block" : "hidden"}`}>
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
                                className={`p-2 text-sm hover:bg-blue-500 hover:text-white ${selectedCurrency?.value === currency.symbol && "bg-blue-500 text-white"}`}
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
    );
};

export default SelectCurrency;