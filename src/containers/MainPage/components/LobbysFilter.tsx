import { Menu, MenuButton, MenuItem, MenuItems, MenuSeparator, Switch } from "@headlessui/react"
import Slider, { SliderProps } from "../../../components/Slider"
import FilledButton from "../../../components/FilledButton";

type FilterProps = SliderProps & {
    lobbyNameValue: string;
    onLobbyNameChange: (value: string) => void;
    searchByNameState: boolean;
    onChangeSearchByNameState: () => void;
    onResetQuerys: () => void;
}

function LobbysFilter ({ 
    playerCountValue, 
    onPlayerCountChange, 
    searchByPCState, 
    onSearchByPCChange,
    lobbyNameValue,
    onLobbyNameChange,
    searchByNameState,
    onChangeSearchByNameState,
    onResetQuerys }: FilterProps) {

    return  <div 
                className="self-end">
            <Menu>
                <MenuButton className="rounded-lg bg-primary-600 hover:bg-primary-500 data-[active]:bg-primary-500 transition-colors px-4 py-2 mx-2 mb-3">
                    Filtros
                    <i className="fa-solid fa-chevron-down ml-2"/>
                </MenuButton>
                <MenuItems
                    anchor="bottom end"
                    className="bg-zinc-700/90 w-80 [--anchor-gap:2px] rounded-lg">
                    <MenuItem
                        as="div">
                        <Switch
                        checked={searchByNameState}
                        onChange={onChangeSearchByNameState}
                        className="group flex h-6 w-12 cursor-pointer rounded-full bg-zinc-900/50 transition p-1 duration-200 data-[checked]:bg-primary-600/50 m-2">
                            <span
                                aria-hidden="true"
                                className="relative size-4 rounded-full ring-4 ring-primary-600 bg-white transition duration-200 group-data-[checked]:translate-x-6"
                            />
                        </Switch>
                        <input
                            type="string"
                            disabled={!searchByNameState}
                            value={lobbyNameValue}
                            onChange={e => onLobbyNameChange(e.target.value)}
                            onClick={e => e.preventDefault()}
                            placeholder="Nombre de la sala"
                            className="px-3 py-1.5 rounded-lg bg-black/50 ml-2 text-sm/6 text-white disabled:bg-black/20"
                            />
                    </MenuItem>
                    <MenuSeparator className="m-3 h-0.5 rounded-lg bg-white/80" />
                    <MenuItem
                        as="div">
                        <Slider
                            playerCountValue={playerCountValue}
                            onPlayerCountChange={onPlayerCountChange}
                            searchByPCState={searchByPCState}
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
};

export default LobbysFilter