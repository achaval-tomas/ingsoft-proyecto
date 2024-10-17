import { useState } from "react";
import CreateLobbyDialog, { CreateLobbyFormState } from "./CreateLobbyDialog";
import FilledButton from "../../../components/FilledButton";
import LobbyList, { LobbyElement } from "./LobbyList";
import LobbysFilter from "./LobbysFilter";



interface MainPageLayoutProps {
    searchByNameQuery: string;
    searchByPlayerCQuery: number;
    onSearchNameQueryChange: (query: string) => void;
    onSearchPlayerQueryChange: (query: number) => void;
    searchByNameState: boolean
    searchByPlayerCState: boolean
    onChangeSearchByNameState: () => void
    onChangeSearchByPCState: () => void
    onResetQuerys: () => void
    onSubmitLobbyForm: (state: CreateLobbyFormState) => void;
    lobbies: LobbyElement[];
    refreshHandler: () => void;
    joinHandler: (lobbyId: string) => void;
}

function MainPageLayout({
    searchByNameQuery,
    searchByPlayerCQuery,
    onSearchNameQueryChange,
    onSearchPlayerQueryChange,
    searchByNameState,
    searchByPlayerCState,
    onChangeSearchByNameState,
    onChangeSearchByPCState,
    onResetQuerys,
    onSubmitLobbyForm,
    lobbies,
    refreshHandler,
    joinHandler,
}: MainPageLayoutProps) {
    const [showCreateForm, setCreateForm] = useState<boolean>(false);

    return (
        <div className="w-screen flex flex-col items-center">
            <div className="w-7/12 flex justify-around p-8 my-8 bg-zinc-700 rounded-lg">
                <div className="flex justify-around w-full">
                    <CreateLobbyDialog
                        isOpen={showCreateForm}
                        lobbyNamePlaceholder={"Nombre de tu sala"}
                        onCancel={() => setCreateForm(false)}
                        onSubmit={onSubmitLobbyForm}
                    />
                    <FilledButton onClick={() => setCreateForm(true)}>
                        <p>Crear sala</p>
                    </FilledButton>
                    <FilledButton onClick={refreshHandler}>
                        <p>Recargar salas disponibles</p>
                    </FilledButton>
                </div>
            </div>
            <LobbysFilter
                playerCountValue={searchByPlayerCQuery}
                onPlayerCountChange={onSearchPlayerQueryChange}
                searchByPCState={searchByPlayerCState}
                onSearchByPCChange={onChangeSearchByPCState}
                lobbyNameValue={searchByNameQuery}
                onLobbyNameChange={onSearchNameQueryChange}
                searchByNameState={searchByNameState}
                onChangeSearchByNameState={onChangeSearchByNameState}
                onResetQuerys={onResetQuerys}
            />
            <LobbyList
                lobbyList={lobbies}
                joinHandler={joinHandler}
            />
        </div>
    );
}

export default MainPageLayout;
