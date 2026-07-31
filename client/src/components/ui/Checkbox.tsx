import React from 'react';
import type { InputHTMLAttributes } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
//    label: string;
    error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ error, name, ...props }, ref) => {
        return (
            <div className="mb-4">
                <div className="flex items-start">
                    <div className="flex items-center h-5">
                        <input
                            id={name}
                            name={name}
                            type="checkbox"
                            ref={ref}
                            {...props}
                            className=
                            {`
                                h-5 
                                w-5 
                                mt-3
                                border 
                                rounded 
                                transition-colors 
                                focus:ring-2 
                                cursor-pointer
                                text-indigo-600 
                                focus:ring-indigo-500
                                accent-blue-600 border-slate-400"
                                ${error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300'}
                            `}
                        />
                    </div>
                </div>
                {error &&
                    <p
                        className="
                            mt-1 
                            text-xs 
                            text-red-600 
                            font-medium">{error}
                    </p>
                }
            </div>
        );
    }
);

Checkbox.displayName = 'Checkbox';
