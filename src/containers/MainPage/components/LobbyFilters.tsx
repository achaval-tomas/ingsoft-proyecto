import Field from "../../../components/Field";
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";

type FilterProps = {
    playerCountRange: [number, number];
    onPlayerCountRangeChange: (playerCountRange: [number, number]) => void;
    lobbyNameValue: string;
    onLobbyNameChange: (value: string) => void;
    className: string;
}

function LobbyFilters({
    playerCountRange,
    onPlayerCountRangeChange,
    lobbyNameValue,
    onLobbyNameChange,
    className,
}: FilterProps) {
    return (
        <div className={`${className} flex flex-col gap-4`}>
            <Field
                label="Nombre"
                value={lobbyNameValue}
                onChange={v => onLobbyNameChange(v)}
                placeholder="Buscar por nombre"
            />

            <div className="flex flex-col">
                <div>Jugadores en sala</div>
                <RangeSlider
                    min={1}
                    max={3}
                    value={playerCountRange}
                    onInput={onPlayerCountRangeChange}
                    className="my-4"
                />
                <div className="flex justify-between px-2 w-full text-xs">
                    {[1, 2, 3].map((amount) => (
                        <span key={amount}>{amount}</span>
                    ))}
                </div>
            </div>

        </div>
    );
}

export default LobbyFilters;
