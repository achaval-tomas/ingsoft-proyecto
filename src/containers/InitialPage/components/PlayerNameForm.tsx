import { useCallback, useEffect, useState } from "react";
import FilledButton from "../../../components/FilledButton";
import Field from "../../../components/Field";

type PlayerNameFormState = string;

interface PlayerNameFormProps {
    onSubmit: (state: PlayerNameFormState) => void;
}

function PlayerNameForm({ onSubmit }: PlayerNameFormProps) {
    const [playerName, setPlayerName] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => setError(null), [playerName]);

    const handleSubmit = useCallback(() => {
        const playerNameTrimmed = playerName.trim();
        if (playerNameTrimmed === "") {
            setError("El nombre de jugador es obligatorio");
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
                error={error ?? undefined}
                value={playerName}
                onChange={setPlayerName}
                inputTestId="input-player-name"
            />
            <div className="mt-4">
                <FilledButton
                    type="submit"
                    className="w-full"
                    testId="button-play"
                >
                    Jugar
                </FilledButton>
            </div>
        </form>
    );
}

export default PlayerNameForm;
