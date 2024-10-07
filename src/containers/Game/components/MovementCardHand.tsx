import { Movement } from "../../../domain/Movement";
import MovementCard from "./MovementCard";

type MovementCardHandProps = {
    movements: Movement[];
    className: string;
    movementCardSelected: number | null;
    onClickMovementCard: (i: number) => void;
}

function MovementCardHand({ movements, className, movementCardSelected, onClickMovementCard }: MovementCardHandProps) {
    const sharedClassNames =
        "relative h-full overflow-hidden rounded-xl group-hover:z-20 transition-movement-card " +
        "shadow-lg shadow-black group-hover:shadow-xl group-hover:shadow-black";

    // make card be higher and above the ohters if it is the one currently selected
    const selectedStyle = (i: number) => {
        if (i === movementCardSelected) {
            const bottomPercentage = i === 1 ? 30 : 20;
            return {
                zIndex: "13",
                bottom: `${bottomPercentage}%`,
            };
        } else {
            return {};
        }
    };

    return (
        <div className={`${className} flex flex-row`}>
            {movements.length >= 1 && <div className="group h-full aspect-[1/1.5] max-w-min">
                <div
                    className={sharedClassNames + " bottom-[0%] group-hover:bottom-[10%] z-[10] -rotate-[15deg]"}
                    style={selectedStyle(0)}
                    onClick={() => onClickMovementCard(0)}
                >
                    <MovementCard movement={movements[0]} />
                </div>
            </div>}
            {movements.length >= 2 && <div className="group h-full aspect-[1/1.5] max-w-min">
                <div
                    className={sharedClassNames + " bottom-[10%] group-hover:bottom-[20%] z-[11]"}
                    style={selectedStyle(1)}
                    onClick={() => onClickMovementCard(1)}
                >
                    <MovementCard movement={movements[1]} />
                </div>
            </div>}
            {movements.length >= 3 && <div className="group h-full aspect-[1/1.5] max-w-min">
                <div
                    className={sharedClassNames + " bottom-[0%] group-hover:bottom-[10%] z-[12] rotate-[15deg]"}
                    style={selectedStyle(2)}
                    onClick={() => onClickMovementCard(2)}
                >
                    <MovementCard movement={movements[2]} />
                </div>
            </div>}
        </div>
    );
}

export default MovementCardHand;
