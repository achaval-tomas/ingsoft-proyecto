import React from "react";
import { classNames } from "../util";

export interface ButtonProps {
    onClick?: () => void;
    children: React.ReactNode;
    className?: string | null;
    type?: "submit" | "reset" | "button";
    padding?: string | null;
    border?: string | null;
    borderRadius?: string | null;
    foregroundColor?: string | null;
    backgroundColor?: string | null;
    testId?: string;
}

function Button({
    onClick,
    children,
    className = null,
    type = "button",
    testId,
    padding = "px-4 py-2",
    border = null,
    borderRadius = "rounded-lg",
    foregroundColor = null,
    backgroundColor = null,
}: ButtonProps) {
    const computedClassName = classNames([
        className,
        border,
        borderRadius,
        padding,
        foregroundColor,
        backgroundColor,
        " transition-colors",
    ]);

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
