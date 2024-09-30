import Button, { ButtonProps } from "./Button";

function TextButton({
    foregroundColor = "text-primary-500 hover:text-primary-400",
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