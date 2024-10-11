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
        if (i === selectedMovementCard) {
            const offset = (i === 1)
                ? "bottom-[30%]"
                : "bottom-[20%]";

            return `${offset} shadow-lg shadow-white z-[14]`;
        } else {
            const offset = (i === 1)
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

    return (
        <div className={`${className} flex flex-row`}>
            {movements.length >= 1 && <div className="group h-full aspect-[1/1.5] max-w-min">
                <div
                    className={`${sharedClassNames} ${individualClassNamesFor(0)} -rotate-[15deg]`}
                    onClick={() => onClickMovementCard(0)}
                >
                    <MovementCard movement={movements[0]} />
                </div>
            </div>}
            {movements.length >= 2 && <div className="group h-full aspect-[1/1.5] max-w-min">
                <div
                    className={`${sharedClassNames} ${individualClassNamesFor(1)}`}
                    onClick={() => onClickMovementCard(1)}
                >
                    <MovementCard movement={movements[1]} />
                </div>
            </div>}
            {movements.length >= 3 && <div className="group h-full aspect-[1/1.5] max-w-min">
                <div
                    className={`${sharedClassNames} ${individualClassNamesFor(2)} rotate-[15deg]`}
                    onClick={() => onClickMovementCard(2)}
                >
                    <MovementCard movement={movements[2]} />
                </div>
            </div>}
        </div>
    );
}

export default MovementCardHand;
