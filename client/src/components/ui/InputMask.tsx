import { IMaskInput } from "react-imask";

interface InputMaskProps {
  mask: string;
  definitions?: Record<string, RegExp>;
  value?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  // eslint-disable-next-line no-unused-vars
  onChange?(_event: { target: { name: string; value: string } }): void;
  placeholder?: string;
  label?: string;
  error?: string;
  name: string;
}

// Componente reutilizable
const InputMask = ({
  mask,
  definitions,
  value,
  disabled,
  autoFocus,
  onChange,
  placeholder,
  error,
  name,
}: InputMaskProps) => {
  return (
    <div
      style={{ marginBottom: "16px", display: "flex", flexDirection: "column" }}
    >
      <IMaskInput
        mask={mask}
        definitions={definitions}
        value={value}
        onAccept={(acceptedValue) => {
          if (onChange) {
            onChange({ target: { name, value: String(acceptedValue) } });
          }
        }}
        placeholder={placeholder}
        id={name}
        name={name}
        disabled={disabled}
        autoFocus={autoFocus}
        className={`px-3 py-2 border rounded-md shadow-sm text-black focus:outline-none focus:ring-2 transition-colors border-gray-300 focus:border-indigo-500 focus:ring-indigo-200`}
      />
      {error && (
        <p style={{ marginTop: "4px", fontSize: "12px", color: "#dc2626" }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default InputMask;
