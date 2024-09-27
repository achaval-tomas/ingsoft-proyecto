import Button, { ButtonProps } from "./Button";

function OutlinedButton({
    border = "border border-border",
    backgroundColor = "hover:bg-white/5",
    ...props
}: ButtonProps) {
    return (
        <Button
            border={border}
            backgroundColor={backgroundColor}
            {...props}
        />
    );
}

export default OutlinedButton;