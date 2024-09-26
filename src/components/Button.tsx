import React from "react";

interface ButtonProps {
    onClick?: () => void | undefined;
    children: React.ReactNode;
    className?: string | undefined;
    type?: "submit" | "reset" | "button" | undefined;
    testId?: string | undefined;
}

function Button({ onClick, children, className, type, testId }: ButtonProps) {
    return (
        <button
            onClick={onClick}
            className={(className ?? "") + " p-2 rounded-lg transition-colors"}
            type={type}
            data-testid={testId}
        >
            {children}
        </button>
    );
}

export default Button;