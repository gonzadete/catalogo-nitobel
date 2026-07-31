import React from "react";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
//    label: string;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ error, name, ...props }, ref) => {
        return (
            <div className="w-full mb-4">
 
                <input
                    id={name}
                    name={name}
                    ref={ref}
                    {...props}
                    className=
                    {`
                        w-full 
                        px-3 
                        py-2 
                        border 
                        rounded-md 
                        shadow-sm 
                        focus:outline-none 
                        focus:ring-2 
                        transition-colors
                        ${error
                            ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                            : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-200"
                        }
                    `}
                />
                {error && (
                    <p className="
                        mt-1 
                        text-xs 
                        text-red-600 
                        font-medium">{error}
                    </p>
                )}
            </div>
        );
    },
);

Input.displayName = "Input";
