import { useCallback, useEffect, useState } from "react";
import FilledButton from "../../../components/FilledButton";
import Field from "../../../components/Field";

type PlayerNameFormState = string;

interface PlayerNameFormProps {
    submitError: string | null;
    onSubmit: (state: PlayerNameFormState) => void;
}

function PlayerNameForm({ submitError, onSubmit }: PlayerNameFormProps) {
    const [playerName, setPlayerName] = useState<string>("");
    const [playerNameError, setPlayerNameError] = useState<string | null>(null);

    useEffect(() => setPlayerNameError(null), [playerName]);

    const handleSubmit = useCallback(() => {
        const playerNameTrimmed = playerName.trim();
        if (playerNameTrimmed === "") {
            setPlayerNameError("El nombre de jugador es obligatorio");
            return;
        }

        onSubmit(playerNameTrimmed);
    }, [playerName, onSubmit]);

    return (
        <form
            className="flex flex-col rounded gap-y-3 min-w-[24rem] p-12 border border-border bg-surface"
            onSubmit={e => { e.preventDefault(); handleSubmit(); }}
        >
            <Field
                label="Nombre de jugador"
                placeholder={"Ingrese su nombre"}
                error={playerNameError ?? undefined}
                value={playerName}
                onChange={setPlayerName}
                inputTestId="input-player-name"
            />
            <FilledButton
                type="submit"
                className="mt-4 w-full"
                testId="button-play"
            >
                Jugar
            </FilledButton>
            {(submitError != null) && <p className="mt-2 text-red-400">{submitError}</p>}
        </form>
    );
}

export default PlayerNameForm;
