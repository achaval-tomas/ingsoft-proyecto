import { Menu, MenuButton, MenuItem, MenuItems, MenuSeparator } from "@headlessui/react"
import Slider, { SliderProps } from "../../../components/Slider"
import FilledButton from "../../../components/FilledButton";

type FilterProps = SliderProps & {
    lobbyNameValue: string;
    onLobbyNameChange: (value: string) => void;
    onResetQuerys: () => void;
}

function LobbysFilter({
    playerCountValue,
    onPlayerCountChange,
    onSearchByPCChange,
    lobbyNameValue,
    onLobbyNameChange,
    onResetQuerys }: FilterProps) {
    return (
        <div className="self-end">
            <Menu>
                <MenuButton className="rounded-lg bg-primary-600 hover:bg-primary-500 data-[active]:bg-primary-500 transition-colors px-4 py-2 mx-2 mb-3">
                    Filtros
                    <i className="fa-solid fa-chevron-down ml-2" />
                </MenuButton>
                <MenuItems
                    anchor="bottom end"
                    className="bg-zinc-700/90 w-80 [--anchor-gap:2px] rounded-lg">


                    <MenuItem as="div">
                        <input
                            type="string"
                            value={lobbyNameValue}
                            onChange={e => onLobbyNameChange(e.target.value)}
                            onClick={e => e.preventDefault()}
                            placeholder="Nombre de la sala"
                            className="px-3 py-1.5 rounded-lg bg-black/50 ml-2 text-sm/6 text-white"
                        />
                    </MenuItem>

                    <MenuSeparator className="m-3 h-0.5 rounded-lg bg-white/80" />


                    <MenuItem as="div">
                        <Slider
                            playerCountValue={playerCountValue}
                            onPlayerCountChange={onPlayerCountChange}
                            onSearchByPCChange={onSearchByPCChange}
                        />
                    </MenuItem>

                    <MenuSeparator className="m-3 h-0.5 rounded-lg bg-white/80" />

                    <MenuItem
                        as="div"
                        className="m-2"
                        onClick={e => e.preventDefault()}>
                        <FilledButton onClick={onResetQuerys}> Eliminar Filtros </FilledButton>
                    </MenuItem>
                </MenuItems>
            </Menu>
        </div>
    );
};

export default LobbysFilter

