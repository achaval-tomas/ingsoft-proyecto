import Dialog from "../../../components/Dialog";
import FilledButton from "../../../components/FilledButton";
import { CommonPlayerState } from "../../../domain/GameState";

type WinnerDialogProps = {
    winner: CommonPlayerState | undefined;
    onClose: () => void;
}

function WinnerDialog({ winner, onClose }: WinnerDialogProps) {
    if (winner == null) {
        return null;
    }

    return (
        <Dialog isOpen={true} onClose={onClose}>
            <div className="flex flex-col justify-center text-center gap-8">
                <p className="text-xl">¡{winner.name} ganó!</p>
                <FilledButton onClick={onClose}>OK</FilledButton>
            </div>
        </Dialog>
    );
}

export default WinnerDialog;