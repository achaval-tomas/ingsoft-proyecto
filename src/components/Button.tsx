import React from "react";

interface ButtonProps {
    onClick?: () => void | undefined;
    children: React.ReactNode;
    className?: string | undefined;
    type?: "submit" | "reset" | "button" | undefined;
}

function Button({ onClick, children, className, type }: ButtonProps) {
    return (
        <button
            onClick={onClick}
            className={(className ?? "") + " p-2 rounded-lg transition-colors"}
            type={type}
        >
            {children}
        </button>
    );
}

export default Button;