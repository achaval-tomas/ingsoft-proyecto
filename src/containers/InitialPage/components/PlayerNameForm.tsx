import { useState } from "react";
import FilledButton from "../../../components/FilledButton";

type PlayerNameFormState = string;

interface PlayerNameFormProps {
    handleSubmit: (state: PlayerNameFormState) => void;
}

function PlayerNameForm({ handleSubmit }: PlayerNameFormProps) {
    const [ name, setName ] = useState<string>("");

    // this state will manage the display of a warning when the user
    // tries to create a player with no name
    const [ showWarning, setShowWarning ] = useState<boolean>(false);

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();

                if (name !== "")
                    handleSubmit(name);
                else {
                    // if user didn't input a name then do nothing with
                    // the form and show warning
                    setShowWarning(true);
                }
            }}
            className="border border-surface-500 rounded p-6 flex flex-col justify-center items-center"
        >
            <div className="grid grid-rows-2 grid-cols-2">
                <label htmlFor="player-name" className="col-span-1 row-span-1">Nombre de jugador:</label>
                <input
                    type="text"
                    id="player-name"
                    value={name || ""}
                    onChange={e => {
                        setName(e.target.value);
                        setShowWarning(false);
                    }}
                    className="col-span-1 row-span-1"
                >
                </input>
                { showWarning && <p className="text-sm col-start-2 !text-red-400">Elegí un nombre</p>}
            </div>
            <FilledButton
                className="mt-4"
                backgroundColor={showWarning ? "bg-red-600" : undefined}
                type="submit"
            >
                Crear
            </FilledButton>
        </form>
    );
}

export default PlayerNameForm;
