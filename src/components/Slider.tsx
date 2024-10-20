import React from "react";


export type SliderProps = {
    playerCountValue: number;
    onPlayerCountChange: (value: number) => void;
};


const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
    function Slider({ playerCountValue, onPlayerCountChange }, ref) {

        return (
            <div className="self-end mr-4" ref={ref}>
                <input
                    className="mb-0 mx-2 w-full cursor-pointer"
                    type="range"
                    value={playerCountValue}
                    onChange={e => onPlayerCountChange(parseInt(e.target.value))}
                    onClick={e => e.preventDefault()}
                    min={0}
                    max={3}
                />
                <div className="flex justify-between mx-2 mt-0 mb-2 w-full font-bold">
                    <span>R</span>
                    {[1, 2, 3].map((amount) => (
                        <span
                            key={amount}>{amount}</span>
                    ))}
                </div>
            </div>
        );
    }
);

export default Slider;


