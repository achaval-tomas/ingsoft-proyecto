import Slider from "../../../components/Slider";
import Field from "../../../components/Field";

type FilterProps = {
    playerCountRange: [number, number];
    onPlayerCountRangeChange: (playerCountRange: [number, number]) => void;
    lobbyNameValue: string;
    onLobbyNameChange: (value: string) => void;
    className: string;
}

function LobbysFilter({
    playerCountRange,
    onPlayerCountRangeChange,
    lobbyNameValue,
    onLobbyNameChange,
    className,
}: FilterProps) {
    return (
        <div className={`${className} flex flex-col gap-2`}>
            <Field
                label="Nombre"
                value={lobbyNameValue}
                onChange={v => onLobbyNameChange(v)}
                placeholder="Buscar por nombre"
            />

            <Slider
                playerCountRange={playerCountRange}
                onPlayerCountRangeChange={onPlayerCountRangeChange}
                className="w-full"
            />
        </div>
    );
}

export default LobbysFilter;
