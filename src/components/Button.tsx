import React from "react";
import { optionalClassName } from "../util";

export interface ButtonProps {
    onClick?: () => void | undefined;
    children: React.ReactNode;
    className?: string | undefined;
    type?: "submit" | "reset" | "button" | undefined;
    padding?: string | null;
    border?: string | null;
    borderRadius?: string | null;
    foregroundColor?: string | null;
    backgroundColor?: string | null;
    testId?: string | undefined;
}

function Button({ onClick, children, className, type, testId, padding, border, borderRadius, foregroundColor, backgroundColor }: ButtonProps) {
    const computedClassName = (className ?? "") +
        optionalClassName(border) +
        optionalClassName(borderRadius, "rounded-lg") +
        optionalClassName(padding, "px-4 py-2") +
        optionalClassName(foregroundColor) +
        optionalClassName(backgroundColor) +
        " transition-colors";

    return (
        <button
            onClick={onClick}
            className={computedClassName}
            type={type}
            data-testid={testId}
        >
            {children}
        </button>
    );
}

export default Button;
