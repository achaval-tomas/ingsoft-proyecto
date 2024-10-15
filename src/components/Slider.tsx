import { Switch } from "@headlessui/react";
import Input from "./Input";
import { useState } from "react";

type SliderProps = {
    value: string | number;
    onChange: (value: string | number) => void;
    switchState: boolean;
    onSwitch: (switchState: boolean) => void;
};

function Slider ({ value, onChange, switchState, onSwitch }: SliderProps) {

    return <div className="self-end mr-4">
                <Switch
                    checked={switchState}
                    onChange={onSwitch}
                    className="group relative flex h-6 w-12 cursor-pointer rounded-full bg-white/10 p-1 transition-colors duration-200 ease-in-out focus:outline-none data-[focus]:outline-1 data-[focus]:outline-white data-[checked]:bg-primary-600/30"
                >
                    <span
                        aria-hidden="true"
                        className="pointer-events-none inline-block size-4 translate-x-0 rounded-full bg-white ring-0 shadow-lg transition duration-200 ease-in-out group-data-[checked]:translate-x-6"
                    />
                </Switch>
                <Input className="mb-0" 
                    disabled={!switchState}
                    value={value}
                    onChange={onChange}
                    type="range"
                    min={1}
                    max={3}
                    list="players"
                    />
                <div className="flex justify-between mx-4 mt-0">
                    {[1, 2, 3].map((amount) => (
                        <span key={amount}>{amount}</span>          
                    ))}
                </div>
            </div>
}

export default Slider