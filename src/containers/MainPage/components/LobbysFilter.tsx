import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import Slider, { SliderProps } from "../../../components/Slider";
import FilledButton from "../../../components/FilledButton";

type FilterProps = SliderProps & {
    lobbyNameValue: string;
    onLobbyNameChange: (value: string) => void;
    onClearFilters: () => void;
}

function LobbysFilter({
    minPlayerCountValue,
    maxPlayerCountValue,
    onMinPlayerCountChange,
    onMaxPlayerCountChange,
    lobbyNameValue,
    onLobbyNameChange,
    onClearFilters,
}: FilterProps) {
    return (
        <div className="self-end">
            <Menu>
                <MenuButton className="rounded-lg bg-primary-600 hover:bg-primary-500 data-[active]:bg-primary-500 transition-colors px-4 py-2 mx-2 mb-3">
                    Filtros
                    <i className="fa-solid fa-sliders ml-2" />
                </MenuButton>
                <MenuItems
                    anchor="bottom end"
                    className="bg-zinc-700/90 w-80 [--anchor-gap:2px] rounded-lg">

                    <MenuItem as="div">
                        <p className="ml-3 mb-1 mt-2 font-bold text-sm">Nombre</p>
                        <input
                            type="string"
                            value={lobbyNameValue}
                            onChange={e => onLobbyNameChange(e.target.value)}
                            onClick={e => e.preventDefault()}
                            placeholder="Nombre de la sala"
                            className="px-3 py-1.5 rounded-lg bg-black/50 ml-2 text-sm/6 text-white"
                        />
                    </MenuItem>

                    <MenuItem as="div" className="ml-3">
                        <Slider
                            minPlayerCountValue={minPlayerCountValue}
                            maxPlayerCountValue={maxPlayerCountValue}
                            onMinPlayerCountChange={onMinPlayerCountChange}
                            onMaxPlayerCountChange={onMaxPlayerCountChange}
                        />
                    </MenuItem>

                    <MenuItem
                        as="div"
                        className="m-2"
                        onClick={e => e.preventDefault()}>
                        <FilledButton onClick={onClearFilters}>Eliminar Filtros</FilledButton>
                    </MenuItem>
                </MenuItems>
            </Menu>
        </div>
    );
}

export default LobbysFilter;
