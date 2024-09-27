import { useState } from "react";
import CreateLobbyDialog, { CreateLobbyFormState } from "./CreateLobbyDialog";
import FilledButton from "../../../components/FilledButton";

interface MainPageLayoutProps {
    onSubmitLobbyForm: (state: CreateLobbyFormState) => void;
}

function MainPageLayout({
    onSubmitLobbyForm,
}: MainPageLayoutProps) {
    const [showCreateForm, setCreateForm] = useState<boolean>(false);

    return (
        <div className="w-screen flex justify-center">
            <div className="w-7/12 flex justify-around p-8 bg-zinc-700 rounded-lg">
                <CreateLobbyDialog
                    isOpen = {showCreateForm}
                    lobbyNamePlaceholder = {"Nombre de tu sala"}
                    onCancel = {() => setCreateForm(false)}
                    onSubmit = {onSubmitLobbyForm}
                />
                <FilledButton
                    type="button"
                    onClick={() => setCreateForm(true)}
                >
                    <p>Crear sala</p>
                </FilledButton>
                <FilledButton
                    type="button"
                    onClick={() => {}}
                >
                    <p>Unirse a sala</p>
                </FilledButton>
            </div>
        </div>
    );
}

export default MainPageLayout;
