import { useState } from "react";
import FancyButton from "../../../components/FancyButton";
import CreateLobbyDialog, { CreateLobbyFormState } from "./CreateLobbyDialog";

interface MainPageLayoutProps {
    onSubmitLobbyForm: (state: CreateLobbyFormState) => void,
}

function MainPageLayout({ 
    onSubmitLobbyForm,
}: MainPageLayoutProps) {
    const [showCreateForm, setCreateForm] = useState(false);

    return (
        <div className="w-screen flex justify-center">
            <div className="w-7/12 flex justify-around p-8 bg-zinc-700 rounded">
                <CreateLobbyDialog
                    isOpen = {showCreateForm}
                    lobbyNamePlaceholder = {"Nombre de tu sala"}
                    onCancel = {() => setCreateForm(false)}
                    onSubmit = {onSubmitLobbyForm}
                />
                <FancyButton onClick={() => setCreateForm(true)}>
                    <p>Crear sala</p>
                </FancyButton>
                <FancyButton onClick={() => {}}>
                    <p>Unirse a sala</p>
                </FancyButton>
            </div>
        </div>
    );
}

export default MainPageLayout;
