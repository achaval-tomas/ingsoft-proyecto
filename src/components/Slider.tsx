import { Switch } from "@headlessui/react";
import Input from "./Input";

export type SliderProps = {
    value: string | number;
    onChange: (value: string | number) => void;
    switchState: boolean;
    onSwitch: (switchState: boolean) => void;
};


function Slider({ value, onChange, switchState, onSwitch }: SliderProps) {

    return <div className="self-end mr-4">
                <Switch
                    checked={switchState}
                    onChange={onSwitch}
                    className="group flex h-6 w-12 cursor-pointer rounded-full bg-zinc-900/50 transition p-1 duration-200 data-[checked]:bg-primary-600/50 m-2"
                >
                    <span
                        aria-hidden="true"
                        className="relative size-4 rounded-full ring-4 ring-primary-600 bg-white transition duration-200 group-data-[checked]:translate-x-6"
                    />
                </Switch>
                <Input className="mb-0 mx-2 w-full cursor-pointer" 
                    disabled={!switchState}
                    value={value}
                    onChange={onChange}
                    type="range"
                    min={1}
                    max={3}
                    />
                <div className="flex justify-between mx-2 mt-0 mb-2 w-full">
                    {[1, 2, 3].map((amount) => (
                        <span 
                            className="mx-3 font-bold"
                            key={amount}>{amount}</span>          
                    ))}
                </div>
            </div>
};

export default Slider