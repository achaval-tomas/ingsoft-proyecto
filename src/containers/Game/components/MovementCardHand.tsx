import { Movement } from "../../../domain/Movement";
import MovementCard from "./MovementCard";

type MovementCardHandProps = {
    movements: Movement[];
    className: string;
}

function MovementCardHand({ movements, className }: MovementCardHandProps) {
    const sharedClassNames =
        "relative h-full overflow-hidden rounded-xl group-hover:z-20 transition-movement-card " +
        "shadow-lg shadow-black group-hover:shadow-xl group-hover:shadow-black";

    return (
        <div className={`${className} flex flex-row w-0 justify-center`}>
            {movements.length >= 1 && <div className="group h-full aspect-[1/1.5] max-w-min">
                <div className={sharedClassNames + " bottom-[0em] group-hover:bottom-[2em] z-[10] -rotate-[15deg]"}>
                    <MovementCard movement={movements[0]} />
                </div>
            </div>}
            {movements.length >= 2 && <div className="group h-full aspect-[1/1.5] max-w-min">
                <div className={sharedClassNames + " bottom-[1em] group-hover:bottom-[3em] z-[11]"}>
                    <MovementCard movement={movements[1]} />
                </div>
            </div>}
            {movements.length >= 3 && <div className="group h-full aspect-[1/1.5] max-w-min">
                <div className={sharedClassNames + " bottom-[0em] group-hover:bottom-[2em] z-[12] rotate-[15deg]"}>
                    <MovementCard movement={movements[2]} />
                </div>
            </div>}
        </div>
    );
}

export default MovementCardHand;