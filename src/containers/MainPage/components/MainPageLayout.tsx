import { useState } from "react";
import CreateLobbyDialog, { CreateLobbyFormState } from "./CreateLobbyDialog";
import FilledButton from "../../../components/FilledButton";
import LobbyList, { LobbyElement } from "./LobbyList";
import Slider from "../../../components/Slider";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";



interface MainPageLayoutProps {
    searchQuery: number | string;
    onSearchQueryChange: (searchQuery: number | string) => void;
    searchState: boolean;
    onSearchStateChange: () => void;
    onSubmitLobbyForm: (state: CreateLobbyFormState) => void;
    lobbies: LobbyElement[];
    refreshHandler: () => void;
    joinHandler: (lobbyId: string) => void;
}

function MainPageLayout({
    searchQuery,
    onSearchQueryChange,
    searchState,
    onSearchStateChange,
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
            <Menu>
                <MenuButton className="self-end rounded-lg bg-primary-600 hover:bg-primary-500 data-[active]:bg-primary-500 transition-colors px-4 py-2">
                        Buscar por cantidad de jugadores
                </MenuButton>
                <MenuItems 
                    anchor="bottom"
                    className="bg-zinc-700/90 rounded-lg"
                >
                    <MenuItem>
                        <Slider 
                            value={searchQuery}
                            onChange={onSearchQueryChange}
                            switchState={searchState}
                            onSwitch={onSearchStateChange}
                        />
                    </MenuItem>
                </MenuItems>
            </Menu>
            {/* <Slider
                value={searchQuery}
                onChange={onSearchQueryChange}
                switchState={searchState}
                onSwitch={onSearchStateChange}
            /> */}
            <LobbyList
                lobbyList={lobbies}
                joinHandler={joinHandler}
            />
        </div>
    );
}

export default MainPageLayout;
