export type SliderProps = {
    playerCountRange: [number, number];
    onPlayerCountRangeChange: (playerCountRange: [number, number]) => void;
};

function Slider({ playerCountRange, onPlayerCountRangeChange }: SliderProps) {
    return (
        <div className="self-end mr-4">
            <label className="text-sm font-normal">Jugadores en sala (min)</label>
            <input
                className="mb-0 mx-2 w-full cursor-pointer custom-slider"
                type="range"
                value={playerCountRange[0]}
                onChange={e => onPlayerCountRangeChange([parseInt(e.target.value), playerCountRange[1]])}
                onClick={e => e.preventDefault()}
                min={1}
                max={3}
            />
            <div className="flex justify-between mx-2 mt-0 mb-2 w-full text-xs font-normal">
                {[1, 2, 3].map((amount) => (
                    <span key={amount}>{amount}</span>
                ))}
            </div>

            <label className="text-sm font-normal">Jugadores en sala (max)</label>
            <input
                className="mb-0 mx-2 w-full cursor-pointer custom-slider"
                type="range"
                value={playerCountRange[1]}
                onChange={e => onPlayerCountRangeChange([playerCountRange[0], parseInt(e.target.value)])}
                onClick={e => e.preventDefault()}
                min={1}
                max={3}
            />
            <div className="flex justify-between mx-2 mt-0 mb-2 w-full text-xs font-normal">
                {[1, 2, 3].map((amount) => (
                    <span key={amount}>{amount}</span>
                ))}
            </div>
        </div>
    );
};

export default Slider;



