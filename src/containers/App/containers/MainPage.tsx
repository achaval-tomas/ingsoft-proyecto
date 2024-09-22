import MainPageLayout from "../components/MainPageLayout";
import { CreateLobbyFormState } from "../components/CreateLobbyDialog";

export interface LobbyForm {
    name: string,
}

function MainPage() {
    const handleSubmit = (state: CreateLobbyFormState) => {
        alert(JSON.stringify(state));
    }

    return (
        <MainPageLayout 
            onSubmitLobbyForm = {handleSubmit}
        /> 
    );
}

export default MainPage;
