import { Field as HUiField, Input, Label } from "@headlessui/react";
import { HTMLInputTypeAttribute } from "react";

interface FieldProps {
    value: string | number;
    onChange : (value: string) => void;
    label: string;
    placeholder?: string | undefined;
    type?: HTMLInputTypeAttribute | undefined;
    min?: number | string | undefined;
    max?: number | string | undefined;
}

function Field ({ value, onChange, label, placeholder, type, min, max }: FieldProps) {
    return <HUiField>
        <Label>{label}</Label>
        <Input
            className="mt-2.5 block w-full rounded-lg bg-black/20 py-1.5 px-3 text-sm/6 text-white"
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={e => onChange(e.target.value)}
            min={min}
            max={max}
        />
    </HUiField>;
}

export default Field;