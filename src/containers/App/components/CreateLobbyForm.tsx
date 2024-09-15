import React from "react";
import { LobbyForm } from "../containers/MainPage";


interface CreateLobbyFormInterface {
    inputs: LobbyForm,
    handleChange: (e: React.FormEvent<HTMLInputElement>) => void,
    handleSubmit: React.FormEventHandler<HTMLFormElement>,
}

function CreateLobbyForm({ inputs, handleChange, handleSubmit }: CreateLobbyFormInterface) {
    const submitDisabled = inputs.name === "";

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-rows-2 grid-cols-2">
                <label htmlFor="name" className="col-span-1 row-span-1">Nombre del lobby:</label>
                <input
                    type="text"
                    name="name"
                    value={inputs.name || ""}
                    onChange={handleChange}
                    className="col-span-1 row-span-1"
                >
                </input>
                { inputs.name === "" && <p className="text-sm col-start-2 text-red-400">Elegí un nombre</p>}
            </div>
            <button 
                className={"fancy-button " + (submitDisabled ? "bg-gray-500" : "")}
                type="submit" 
                disabled={submitDisabled}
            >
                Crear
            </button>
        </form>
    );
}

export default CreateLobbyForm;
