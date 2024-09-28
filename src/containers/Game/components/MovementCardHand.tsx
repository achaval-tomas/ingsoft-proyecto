import { Movement } from "../../../domain/Movement";
import MovementCard from "./MovementCard";

type MovementCardHandProps = {
    movements: [Movement, Movement, Movement];
}

function MovementCardHand({ movements }: MovementCardHandProps) {
    const sharedClassNames =
        "relative overflow-hidden rounded-xl group-hover:z-20 transition-movement-card " +
        "shadow-lg shadow-black group-hover:shadow-xl group-hover:shadow-black";

    return (
        <div className="flex flex-row px-[1.4em] pb-[1.8em]">
            <div className="group">
                <div className={sharedClassNames + " top-[1em] group-hover:top-[-1em] z-[10] -rotate-[15deg]"}>
                    <MovementCard movement={movements[0]}/>
                </div>
            </div>
            <div className="group">
                <div className={sharedClassNames + " top-[0em] group-hover:top-[-2em] z-[11]"}>
                    <MovementCard movement={movements[1]}/>
                </div>
            </div>
            <div className="group">
                <div className={sharedClassNames + " top-[1em] group-hover:top-[-1em] z-[12] rotate-[15deg]"}>
                    <MovementCard movement={movements[2]}/>
                </div>
            </div>
        </div>
    );
}

export default MovementCardHand;