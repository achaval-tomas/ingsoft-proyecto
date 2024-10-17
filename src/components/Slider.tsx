import { Switch } from "@headlessui/react";
import React from "react";


export type SliderProps = {
    playerCountValue: number;
    onPlayerCountChange: (value: number) => void;
    searchByPCState: boolean;
    onSearchByPCChange: (switchState: boolean) => void;
};


const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
    function Slider({ playerCountValue, onPlayerCountChange, searchByPCState, onSearchByPCChange }, ref) {

    return <div 
                className="self-end mr-4"
                ref={ref}>
                <Switch
                    checked={searchByPCState}
                    onChange={onSearchByPCChange}
                    className="group flex h-6 w-12 cursor-pointer rounded-full bg-zinc-900/50 transition p-1 duration-200 data-[checked]:bg-primary-600/50 m-2"
                >
                    <span
                        aria-hidden="true"
                        className="relative size-4 rounded-full ring-4 ring-primary-600 bg-white transition duration-200 group-data-[checked]:translate-x-6"
                    />
                </Switch>
                <input className="mb-0 mx-2 w-full cursor-pointer" 
                    type="range"
                    disabled={!searchByPCState}
                    value={playerCountValue}
                    onChange={e => onPlayerCountChange(parseInt(e.target.value))}
                    onClick={e => e.preventDefault()}
                    min={1}
                    max={3}
                    />
                <div className="flex justify-between mx-2 mt-0 mb-2 w-full">
                    {[1, 2, 3].map((amount) => (
                        <span 
                            className="mx-1.5 font-bold"
                            key={amount}>{amount}</span>          
                    ))}
                </div>
            </div>
});

export default Slider