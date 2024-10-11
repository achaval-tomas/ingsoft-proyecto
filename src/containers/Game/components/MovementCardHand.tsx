import { Movement } from "../../../domain/Movement";
import MovementCard from "./MovementCard";

type MovementCardHandProps = {
    movements: Movement[];
    className: string;
    selectedMovementCard: number | null;
    onClickMovementCard: (i: number) => void;
}

function MovementCardHand({ movements, className, selectedMovementCard, onClickMovementCard }: MovementCardHandProps) {
    const sharedClassNames =
        "relative h-full overflow-hidden rounded-xl group-hover:z-[13] transition-movement-card";

    const individualClassNamesFor = (i: number) => {
        const isMiddleCard = ((i === 1 && movements.length === 3) || movements.length === 1);

        if (i === selectedMovementCard) {
            const offset = isMiddleCard
                ? "bottom-[30%]"
                : "bottom-[20%]";

            return `${offset} shadow-lg shadow-white z-[14]`;
        } else {
            const offset = isMiddleCard
                ? "bottom-[10%] group-hover:bottom-[20%]"
                : "bottom-[0%] group-hover:bottom-[10%]";

            const zIndex = (i === 0)
                ? "z-[10]"
                : (i === 1)
                    ? "z-[11]"
                    : "z-[12]";

            return `${offset} ${zIndex} shadow-lg shadow-black group-hover:shadow-xl group-hover:shadow-black`;
        }
    };

    const rotationFor = (i: number) => {
        switch (movements.length) {
            case 1: return "rotate-[0deg]";
            case 2: return (i === 0) ? "rotate-[-15deg]" : "rotate-[15deg]";
            case 3: return (i === 0)
                ? "rotate-[-15deg]"
                : (i === 1)
                    ? "rotate-[0deg]"
                    : "rotate-[15deg]";
            default: return "rotate-[0deg]";
        }
    };

    return (
        <div className={`${className} flex flex-row`}>
            {movements.map((m, i) => (
                <div key={i} className="group h-full aspect-[1/1.5] max-w-min">
                    <div
                        className={`${sharedClassNames} ${individualClassNamesFor(i)} ${rotationFor(i)}`}
                        onClick={() => onClickMovementCard(i)}
                    >
                        <MovementCard movement={m} />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default MovementCardHand;
