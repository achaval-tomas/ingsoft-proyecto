import "../../../components/FancyButton.css";

interface PlayerNameFormProps {
    name: string,
    handleChange: (e: React.FormEvent<HTMLInputElement>) => void,
    handleSubmit: React.FormEventHandler<HTMLFormElement>,
}

function PlayerNameForm({ name, handleChange, handleSubmit }: PlayerNameFormProps) {
    const submitDisabled = name === "";

    return (
        <form 
            onSubmit={handleSubmit} 
            className="border border-zinc-500 rounded p-6 flex flex-col justify-center items-center"
        >
            <div className="grid grid-rows-2 grid-cols-2">
                <label htmlFor="player-name" className="col-span-1 row-span-1">Nombre de jugador:</label>
                <input
                    type="text"
                    name="player-name"
                    value={name || ""}
                    onChange={handleChange}
                    className="col-span-1 row-span-1"
                >
                </input>
                { submitDisabled && <p className="text-sm col-start-2 text-red-400">Elegí un nombre</p>}
            </div>
                <button 
                    className={"fancy-button " + (submitDisabled ? "!bg-gray-500" : "")}
                    type="submit" 
                    disabled={submitDisabled}
                >
                    Crear
                </button>
        </form>
    );
}

export default PlayerNameForm;
