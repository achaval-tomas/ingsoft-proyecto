import React from "react";

export type SliderProps = {
    minPlayerCountValue: number;
    maxPlayerCountValue: number;
    onMinPlayerCountChange: (value: number) => void;
    onMaxPlayerCountChange: (value: number) => void;
};

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
    function Slider({ minPlayerCountValue, maxPlayerCountValue, onMinPlayerCountChange, onMaxPlayerCountChange }, ref) {
        return (
            <div className="self-end mr-4" ref={ref}>
                <label className="text-sm font-normal">Jugadores en sala (min)</label>
                <input
                    className="mb-0 mx-2 w-full cursor-pointer custom-slider"
                    type="range"
                    value={minPlayerCountValue}
                    onChange={e => onMinPlayerCountChange(parseInt(e.target.value))}
                    onClick={e => e.preventDefault()}
                    min={0}
                    max={3}
                />
                <div className="flex justify-between mx-2 mt-0 mb-2 w-full text-xs font-normal">
                    {[0, 1, 2, 3].map((amount) => (
                        <span key={amount}>{amount}</span>
                    ))}
                </div>

                <label className="text-sm font-normal">Jugadores en sala (max)</label>
                <input
                    className="mb-0 mx-2 w-full cursor-pointer custom-slider"
                    type="range"
                    value={maxPlayerCountValue}
                    onChange={e => onMaxPlayerCountChange(parseInt(e.target.value))}
                    onClick={e => e.preventDefault()}
                    min={0}
                    max={3}
                />
                <div className="flex justify-between mx-2 mt-0 mb-2 w-full text-xs font-normal">
                    {[0, 1, 2, 3].map((amount) => (
                        <span key={amount}>{amount}</span>
                    ))}
                </div>
            </div>
        );
    }
);

export default Slider;



