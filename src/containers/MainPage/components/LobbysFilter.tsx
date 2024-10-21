import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import Slider, { SliderProps } from "../../../components/Slider";
import FilledButton from "../../../components/FilledButton";
import Field from "../../../components/Field";
import TextButton from "../../../components/TextButton";

type FilterProps = SliderProps & {
    lobbyNameValue: string;
    onLobbyNameChange: (value: string) => void;
    onClearFilters: () => void;
}

function LobbysFilter({
    playerCountRange,
    onPlayerCountRangeChange,
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
                    className="flex flex-col bg-zinc-700 w-96 [--anchor-gap:2px] rounded-lg p-8 gap-4"
                >
                    <Field
                        label="Nombre"
                        value={lobbyNameValue}
                        onChange={v => onLobbyNameChange(v)}
                        placeholder="Buscar por nombre..."
                    />

                    <Slider
                        playerCountRange={playerCountRange}
                        onPlayerCountRangeChange={onPlayerCountRangeChange}
                    />

                    <div className="flex flex-row w-full">
                        <MenuItem as="div" className="grow">
                            <TextButton className="w-full">
                                Cerrar
                            </TextButton>
                        </MenuItem>

                        <FilledButton onClick={onClearFilters} className="grow">
                            Limpiar filtros
                        </FilledButton>
                    </div>
                </MenuItems>
            </Menu>
        </div>
    );
}

export default LobbysFilter;
