import React from "react";
import { LobbyForm } from "../containers/MainPage";


interface CreateLobbyFormInterface {
    inputs: LobbyForm,
    handleChange: (e: React.FormEvent<HTMLInputElement>) => void,
    handleSubmit: React.FormEventHandler<HTMLFormElement>,
}

function CreateLobbyForm({ inputs, handleChange, handleSubmit }: CreateLobbyFormInterface) {
    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="name">Nombre del lobby:</label>
                <input
                    type="text"
                    name="name"
                    value={inputs.name || ""}
                    onChange={handleChange}
                >
                </input>
                { inputs.name === "" && <p>Elegí un nombre</p>}
            </div>
            { inputs.name !== "" &&
                <button type="submit">Crear</button>
            }
        </form>
    );
}

export default CreateLobbyForm;
