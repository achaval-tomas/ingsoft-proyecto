import { Field as HUiField, Label } from "@headlessui/react";
import { HTMLInputTypeAttribute } from "react";
import Input from "./Input";

export interface FieldProps {
    value: string | number;
    onChange: (value: string) => void;
    label: string;
    placeholder?: string;
    error?: string;
    type?: HTMLInputTypeAttribute;
    min?: number | string;
    max?: number | string;
    inputTestId?: string;
    disabled?: boolean;
}

function Field({ value, onChange, label, placeholder, error, type, min, max, inputTestId, disabled = false }: FieldProps) {
    return <HUiField>
        <Label>{label}</Label>
        <Input
            className="mt-2.5 block w-full"
            disabled={disabled}
            type={type}
            placeholder={placeholder}
            value={value.toString()}
            onChange={onChange}
            min={min}
            max={max}
            data-testid={inputTestId}
        />
        {(error != null) && <p className="mt-2.5 text-sm text-red-400">{error}</p>}
    </HUiField>;
}

export default Field;
