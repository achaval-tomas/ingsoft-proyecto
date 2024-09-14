import { useState } from "react";
import FancyButton from "../../../components/FancyButton";
import { LobbyForm } from "../containers/MainPage";
import CreateLobbyForm from "./CreateLobbyForm";

interface MainPageLayoutProps {
    lobbyFormInputs: LobbyForm,
    handleLobbyFormChange: (e: React.FormEvent<HTMLInputElement>) => void,
    handleLobbyFormSubmit: React.FormEventHandler<HTMLFormElement>,
    resetForm: () => void,
}

function MainPageLayout({ 
    lobbyFormInputs,
    handleLobbyFormSubmit,
    handleLobbyFormChange,
    resetForm,
}: MainPageLayoutProps) {
    const [showCreateForm, setCreateForm] = useState(false);

    const handleGoBack = () => {
        setCreateForm(false);
        resetForm();
    }

    return (
        <div>
        { showCreateForm ? 
            <div>
                <CreateLobbyForm 
                    inputs={lobbyFormInputs}
                    handleChange={handleLobbyFormChange} 
                    handleSubmit={handleLobbyFormSubmit} 
                />
                <FancyButton onClick={handleGoBack}>
                    <p>Atrás</p>
                </FancyButton>
            </div>
            :
            <FancyButton onClick={() => setCreateForm(true)}>
                <p>Crear lobby</p>
            </FancyButton>
        }
        </div>
    );
}

export default MainPageLayout;
