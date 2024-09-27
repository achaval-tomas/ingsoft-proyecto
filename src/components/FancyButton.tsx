import React from "react";
import "./FancyButton.css";

interface FancyButtonProps {
    onClick: () => void;
    children: React.ReactNode;
}

function FancyButton({ onClick, children }: FancyButtonProps) {
    return (
        <button className="fancy-button" onClick={onClick}>
            {children}
        </button>
    );
}

export default FancyButton;