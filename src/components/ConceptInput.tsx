// src/components/ConceptInput.tsx
import React from 'react';

interface ConceptInputProps {
    concept: string;
    setConcept: (concept: string) => void;
}

const ConceptInput: React.FC<ConceptInputProps> = ({ concept, setConcept }) => {
    return (
        <div className="mb-4">
            <label htmlFor="concept" className="block text-gray-700 text-sm font-bold mb-2">
                Concepto
            </label>
            <input
                type="text"
                id="concept"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="Añade descripción del pago"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
        </div>
    );
};

export default ConceptInput;
