import Button, { ButtonProps } from "./Button";

function FilledButton({
    backgroundColor = "bg-primary-600 hover:bg-primary-500",
    ...props
}: ButtonProps) {
    return (
        <Button
            backgroundColor={backgroundColor}
            {...props}
        />
    );
}

export default FilledButton;