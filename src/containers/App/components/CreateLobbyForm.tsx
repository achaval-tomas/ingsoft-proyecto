import React from "react";
import { LobbyForm } from "../containers/MainPage";
import FancyButton from "../../../components/FancyButton";


interface CreateLobbyFormProps {
    inputs: LobbyForm,
    handleChange: (e: React.FormEvent<HTMLInputElement>) => void,
    handleSubmit: React.FormEventHandler<HTMLFormElement>,
    handleGoBack: () => void,
}

function CreateLobbyForm({ inputs, handleChange, handleSubmit, handleGoBack }: CreateLobbyFormProps) {
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
            <div className="flex justify-around">
                <button 
                    className={"fancy-button " + (submitDisabled ? "bg-gray-500" : "")}
                    type="submit" 
                    disabled={submitDisabled}
                >
                    Crear
                </button>
                <FancyButton onClick={handleGoBack}>
                    <p>Atrás</p>
                </FancyButton>
            </div>
        </form>
    );
}

export default CreateLobbyForm;
