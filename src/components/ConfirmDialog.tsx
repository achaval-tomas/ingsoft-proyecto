import Dialog from "./Dialog";
import OutlinedButton from "./OutlinedButton";
import FilledButton from "./FilledButton";

export type ConfirmDialogProps = {
    isOpen: boolean;
    title: string;
    body: string;
    dismissText: string;
    confirmText: string;
    onDismiss: () => void;
    onConfirm: () => void;
}

function ConfirmDialog({ isOpen, title, body, dismissText, confirmText, onDismiss, onConfirm }: ConfirmDialogProps) {
    return (
        <Dialog isOpen={isOpen} onClose={onDismiss}>
            <div className="flex flex-col gap-4">
                <p className="font-bold text-lg">{title}</p>
                <p>{body}</p>
                <div className="flex mt-2 gap-4">
                    <OutlinedButton
                        className="flex-1"
                        onClick={onDismiss}
                    >
                        {dismissText}
                    </OutlinedButton>
                    <FilledButton
                        className="flex-1"
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </FilledButton>
                </div>
            </div>
        </Dialog>
    );
}

export default ConfirmDialog;
