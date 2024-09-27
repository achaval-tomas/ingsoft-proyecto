import { useState } from "react";
import FilledButton from "../../../components/FilledButton";

type PlayerNameFormState = string;

interface PlayerNameFormProps {
    handleSubmit: (state: PlayerNameFormState) => void;
}

function PlayerNameForm({ handleSubmit }: PlayerNameFormProps) {
    const [ name, setName ] = useState<string>("");
    const submitDisabled = name === "";

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(name);
            }}
            className="border border-surface-500 rounded p-6 flex flex-col justify-center items-center"
        >
            <div className="grid grid-rows-2 grid-cols-2">
                <label htmlFor="player-name" className="col-span-1 row-span-1">Nombre de jugador:</label>
                <input
                    type="text"
                    id="player-name"
                    value={name || ""}
                    onChange={e => setName(e.target.value)}
                    className="col-span-1 row-span-1"
                >
                </input>
                { submitDisabled && <p className="text-sm col-start-2 !text-red-400">Elegí un nombre</p>}
            </div>
            <FilledButton
                className={"mt-4 " + (submitDisabled ? "!bg-surface-500" : "")}
                type="submit"
            >
                Crear
            </FilledButton>
        </form>
    );
}

export default PlayerNameForm;
