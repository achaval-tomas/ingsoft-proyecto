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
        <div className="w-screen flex justify-center">
            <div className="w-7/12 flex justify-around p-8 bg-zinc-700 rounded">
                { showCreateForm ? 
                    <>
                        <CreateLobbyForm 
                            inputs={lobbyFormInputs}
                            handleChange={handleLobbyFormChange} 
                            handleSubmit={handleLobbyFormSubmit} 
                        />
                        <FancyButton onClick={handleGoBack}>
                            <p>Atrás</p>
                        </FancyButton>
                    </>
                    :
                    <>
                        <FancyButton onClick={() => setCreateForm(true)}>
                            <p>Crear lobby</p>
                        </FancyButton>
                        <FancyButton onClick={() => {}}>
                            <p>Unirse a lobby</p>
                        </FancyButton>
                    </>
                }
            </div>
        </div>
    );
}

export default MainPageLayout;
