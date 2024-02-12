// src/components/FormSubmitButton.tsx
import React from 'react';

interface FormSubmitButtonProps {
    isValidForm: boolean;
}

const FormSubmitButton: React.FC<FormSubmitButtonProps> = ({ isValidForm }) => {
    return (
        <button
            type="submit"
            className={`w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                !isValidForm ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={!isValidForm}
        >
            Continuar
        </button>
    );
};

export default FormSubmitButton;
