import { MovementCardUiState } from "../GameUiState";
import MovementCard from "./MovementCard";

type MovementCardHandProps = {
    movementCards: MovementCardUiState[];
    className: string;
    onClickMovementCard: (i: number) => void;
    onClickCancelMovement: (() => void) | null;
}

function MovementCardHand({ movementCards, className, onClickMovementCard, onClickCancelMovement }: MovementCardHandProps) {
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

                return `${offset} ${zIndex} shadow-[0_10px_15px_-3px_rgb(0,0,0),inset_0_0_8px_8px_rgb(0,0,0)]`
                    + " group-hover:shadow-[0_20px_25px_-5px_rgb(0,0,0),inset_0_0_8px_8px_rgb(0,0,0)]";
            }
            case "selected": {
                const offset = isMiddleCard
                    ? "bottom-[30%]"
                    : "bottom-[20%]";

                // The inset shadow is just for fixing some artifacting.
                return `${offset} shadow-[0_0_8px_8px_rgb(255,255,255),inset_0_0_8px_8px_rgb(255,255,255)] z-[14]`;
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
            {onClickCancelMovement && <div
                className="h-full aspect-[1/1] max-w-min relative flex invisible"
                onClick={() => { }}>
                <img className="h-1/2 aspect-[1/1] mr-[10%] self-end" src="/src/assets/undo-movement.svg" />
            </div>
            }
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
            {onClickCancelMovement && <div
                className="h-full aspect-[1/1] max-w-min relative flex"
                onClick={onClickCancelMovement}
            >
                <img className="relative h-1/2 aspect-[1/1] ml-[10%] self-end transition-movement-card bottom-[0%] hover:bottom-[10%]" src="/src/assets/undo-movement.svg" />
            </div>
            }
        </div>
    );
}

export default MovementCardHand;
