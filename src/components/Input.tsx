import { Input as HuiInput, InputProps as HuiInputProps } from "@headlessui/react";
import { classNames } from "../util";

type InputProps = Omit<HuiInputProps, "value" | "onChange"> & {
    value: string;
    onChange: (value: string) => void;
    padding?: string | null;
    borderRadius?: string | null;
    backgroundColor?: string | null;
    fontSize?: string | null;
    fontColor?: string | null;
    className?: string;
};

function Input({
    value,
    onChange,
    padding = "px-3 py-1.5",
    borderRadius = "rounded-lg",
    backgroundColor = "bg-black/20",
    fontSize = "text-sm/6",
    fontColor = "text-white",
    className,
    ...props
}: InputProps) {
    return <HuiInput
        value={value}
        onChange={e => onChange(e.target.value)}
        className={classNames([padding, borderRadius, backgroundColor, fontSize, fontColor, className ?? null])}
        {...props}
    />;
}

export default Input;