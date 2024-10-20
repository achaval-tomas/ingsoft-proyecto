import React from "react";


export type SliderProps = {
    playerCountValue: number;
    onPlayerCountChange: (value: number) => void;
    onSearchByPCChange: (switchState: boolean) => void;
};


const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
    function Slider({ playerCountValue, onPlayerCountChange, onSearchByPCChange }, ref) {

        const handleSliderChange = (value: number) => {
            onSearchByPCChange(true);
            onPlayerCountChange(value);
        };

        return (
            <div className="self-end mr-4" ref={ref}>
                <input
                    className="mb-0 mx-2 w-full cursor-pointer"
                    type="range"
                    value={playerCountValue}
                    onChange={e => handleSliderChange(parseInt(e.target.value))}
                    onClick={e => e.preventDefault()}
                    min={0}
                    max={3}
                />
                <div className="flex justify-between mx-2 mt-0 mb-2 w-full">
                    {[0, 1, 2, 3].map((amount) => (
                        <span
                            className="mx-1.5 font-bold"
                            key={amount}>{amount}</span>
                    ))}
                </div>
            </div>
        );
    }
);

export default Slider


