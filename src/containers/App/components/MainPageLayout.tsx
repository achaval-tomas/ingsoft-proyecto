import { useState } from "react";
import CreateLobbyDialog, { CreateLobbyFormState } from "./CreateLobbyDialog";
import { Button } from "@headlessui/react";

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
                <Button
                    type="button"
                    onClick={() => setCreateForm(true)}
                    className="p-3 rounded bg-primary-600 hover:bg-primary-500"
                >
                    <p>Crear sala</p>
                </Button>
                <Button
                    type="button"
                    onClick={() => {}}
                    className="p-3 rounded bg-primary-600 hover:bg-primary-500" 
                >
                    <p>Unirse a sala</p>
                </Button>
            </div>
        </div>
    );
}

export default MainPageLayout;
