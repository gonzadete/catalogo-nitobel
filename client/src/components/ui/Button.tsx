import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
}

export const Button = ({ children, isLoading, ...props }: ButtonProps) => {
    return (
        <button
            {...props}
            disabled={isLoading || props.disabled}
            className="
                w-full 
                bg-indigo-600 
                hover:bg-indigo-700 
                text-white 
                font-medium 
                py-2 
                px-4 
                rounded-md 
                shadow-sm 
                transition-colors 
                focus:outline-none 
                focus:ring-2 
                focus:ring-indigo-500 
                focus:ring-offset-2 
                disabled:opacity-50 
                disabled:cursor-not-allowed"
        >
            {isLoading ? "Cargando..." : children}
        </button>
    );
};