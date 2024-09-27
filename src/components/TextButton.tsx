import Button, { ButtonProps } from "./Button";

function TextButton({
    foregroundColor = "text-primary-600 hover:text-primary-500",
    ...props
}: ButtonProps) {
    return (
        <Button
            foregroundColor={foregroundColor}
            {...props}
        />
    );
}

export default TextButton;