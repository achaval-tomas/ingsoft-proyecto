export type SliderProps = {
    playerCountRange: [number, number];
    onPlayerCountRangeChange: (playerCountRange: [number, number]) => void;
    className: string;
};

function Slider({ playerCountRange, onPlayerCountRangeChange, className }: SliderProps) {
    return (
        <div className={className}>
            <label>Jugadores en sala (desde)</label>
            <input
                className="w-full cursor-pointer custom-slider mt-2"
                type="range"
                value={playerCountRange[0]}
                onChange={e => {
                    const newMin = parseInt(e.target.value);
                    onPlayerCountRangeChange([newMin, Math.max(newMin, playerCountRange[1])]);
                }}
                onClick={e => e.preventDefault()}
                min={1}
                max={3}
            />
            <div className="flex justify-between px-1.5 w-full text-xs">
                {[1, 2, 3].map((amount) => (
                    <span key={amount}>{amount}</span>
                ))}
            </div>

            <div className="h-2" />

            <label>Jugadores en sala (hasta)</label>
            <input
                className="w-full cursor-pointer custom-slider mt-2"
                type="range"
                value={playerCountRange[1]}
                onChange={e => {
                    const newMax = parseInt(e.target.value);
                    onPlayerCountRangeChange([Math.min(newMax, playerCountRange[0]), newMax]);
                }}
                onClick={e => e.preventDefault()}
                min={1}
                max={3}
            />
            <div className="flex justify-between px-1.5 w-full text-xs">
                {[1, 2, 3].map((amount) => (
                    <span key={amount}>{amount}</span>
                ))}
            </div>
        </div>
    );
};

export default Slider;



