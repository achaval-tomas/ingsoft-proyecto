import { useState } from "react";
import AppLayout from "./components/AppLayout";
import CreateLobbyDialog from "./components/CreateLobbyDialog";

function App() {
    const [showCreateLobbyDialog, setShowCreateLobbyDialog] = useState(true);

    return (
        <>
            <AppLayout
                count={99}
                onClickButton={() => setShowCreateLobbyDialog(true)}
            />
            <CreateLobbyDialog
                isOpen={showCreateLobbyDialog}
                onCancel={() => setShowCreateLobbyDialog(false)}
                onSubmit={formState => alert(JSON.stringify(formState))}
            />
        </>
    );
}

export default App;
