import React, { LabelHTMLAttributes } from 'react';

// Tipamos las propiedades extendiendo los atributos nativos de la etiqueta <label>
interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode; // Permite pasar el texto o elementos internos
  htmlFor: string;           // Vincula obligatoriamente el label con su respectivo input
  isRequired?: boolean;      // Muestra un indicador visual de campo obligatorio
  error?: string;            // Recibe el mensaje de error de Zod/React Hook Form
}

export const Label: React.FC<LabelProps> = ({
  children,
  htmlFor,
  isRequired = false,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label
        htmlFor={htmlFor}
        className={`col-span-4 xs:col-span-1 sm:col-span-1 md:col-span-1 lg:col-span-1 gap-2 text-slate-700 font-medium
          ${error ? 'text-red-500' : 'text-slate-700'} 
          ${className}`}
        {...props}
      >
        {children}
        {isRequired && <span className="ml-1 text-red-500 font-bold">*</span>}
      </label>
      
      {/* Mensaje de error dinámico */}
      {error && (
        <span className="text-xs font-medium text-red-500 animate-fade-in" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

