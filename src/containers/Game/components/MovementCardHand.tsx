import { MovementCardUiState } from "../GameUiState";
import MovementCard from "./MovementCard";

type MovementCardHandProps = {
    movementCards: MovementCardUiState[];
    className: string;
    onClickMovementCard: (i: number) => void;
}

function MovementCardHand({ movementCards, className, onClickMovementCard }: MovementCardHandProps) {
    const sharedClassNames =
        "relative h-full overflow-hidden rounded-xl group-hover:z-[13] transition-movement-card";

    const individualClassNamesFor = (movementCard: MovementCardUiState, i: number) => {
        const isMiddleCard = ((i === 1 && movementCards.length === 3) || movementCards.length === 1);

        switch (movementCard.status) {
            case "normal": {
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
            case "selected": {
                const offset = isMiddleCard
                    ? "bottom-[30%]"
                    : "bottom-[20%]";

                return `${offset} shadow-lg shadow-white z-[14]`;
            }
        }

    };

    const rotationFor = (i: number) => {
        switch (movementCards.length) {
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
            {movementCards.map((mc, i) => (
                <div key={i} className="group h-full aspect-[1/1.4865757] max-w-min">
                    <div
                        className={`${sharedClassNames} ${individualClassNamesFor(mc, i)} ${rotationFor(i)}`}
                        onClick={() => onClickMovementCard(i)}
                    >
                        <MovementCard movement={mc.movement} />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default MovementCardHand;
