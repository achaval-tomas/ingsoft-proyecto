import Dialog from "../../../components/Dialog";
import FilledButton from "../../../components/FilledButton";

type WinnerDialogProps = {
    winnerName: string | undefined;
    onClose: () => void;
}

function WinnerDialog({ winnerName, onClose }: WinnerDialogProps) {
    if (winnerName == null) {
        return null;
    }

    return (
        <Dialog isOpen={true} onClose={onClose}>
            <div className="flex flex-col justify-center text-center gap-8">
                <p className="text-xl">¡{winnerName} ganó!</p>
                <FilledButton onClick={onClose}>OK</FilledButton>
            </div>
        </Dialog>
    );
}

export default WinnerDialog;