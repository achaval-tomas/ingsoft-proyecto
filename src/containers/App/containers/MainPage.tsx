import { useState } from "react";
import MainPageLayout from "../components/MainPageLayout";

export interface LobbyForm {
    name: string,
}

const initialInputs = {
    name: "",
};

function MainPage() {
    const [inputs, setInputs] = useState(initialInputs);

    const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
        const name = e.currentTarget.name;
        const value = e.currentTarget.value;
        setInputs(inputs => ({...inputs, [name]: value}));
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log(`Chosen name: ${inputs.name}`);
    }

    return (
        <MainPageLayout 
            lobbyFormInputs={inputs}
            handleLobbyFormChange={handleChange}
            handleLobbyFormSubmit={handleSubmit}
            resetForm={() => setInputs(initialInputs)}
        /> 
    );
}

export default MainPage;
