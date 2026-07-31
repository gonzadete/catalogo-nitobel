import React from 'react';

// Definimos la estructura básica que debe tener cada opción
export interface SelectOption {
  value: string | number;
  label: string;
}

// Propiedades que acepta nuestro componente reutilizable
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  error?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      
        <select
            className=
            {`
                w-full 
                px-3 
                py-2 
                border 
                rounded-md 
                shadow-sm 
                text-black
                bg-white 
                focus:outline-none 
                focus:ring-2 
                transition-colors
                ${error
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'
                }
            }`}
            {...props}
        >
            <option 
                value="">Selecciona una opción...
            </option>
                
            {options.map((option) => (
            <option key={option.value} value={option.value}>
                {option.label}
            </option>
            ))}
        </select>

        {error && 
            <span
                className="
                mt-1 
                text-xs 
                text-red-600 
                font-medium"
            >
                {error}
            </span>}
    </div>
  );
};

Select.displayName = 'Select';
