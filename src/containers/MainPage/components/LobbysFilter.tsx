import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react"
import Slider, { SliderProps } from "../../../components/Slider"

type FilterProps = SliderProps

function LobbysFilter ({ value, onChange, switchState, onSwitch }: FilterProps) {

    return  <div 
                className="self-end">
            <Menu>
                <MenuButton className="rounded-lg bg-primary-600 hover:bg-primary-500 data-[active]:bg-primary-500 transition-colors px-4 py-2 mx-2 mb-3">
                    Buscar por cantidad de jugadores
                    <i className="fa-solid fa-chevron-down ml-2"/>
                </MenuButton>
                <MenuItems 
                    anchor="bottom end"
                    className="bg-zinc-700/90 w-[var(--button-width)] [--anchor-gap:2px] rounded-lg">
                    <MenuItem>
                        <Slider
                            value={value}
                            onChange={onChange}
                            switchState={switchState}
                            onSwitch={onSwitch}
                        />
                    </MenuItem>
                </MenuItems>
            </Menu>
            </div>
};

export default LobbysFilter