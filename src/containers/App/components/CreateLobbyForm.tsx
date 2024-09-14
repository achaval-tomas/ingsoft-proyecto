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
                <label htmlFor="name">Lobby name:</label>
                <input
                    type="text"
                    name="name"
                    value={inputs.name || ""}
                    onChange={handleChange}
                >
                </input>
                { inputs.name === "" && <p>You must type a name</p>}
            </div>
            <button type="submit">Send</button>
        </form>
    );
}

export default CreateLobbyForm;
