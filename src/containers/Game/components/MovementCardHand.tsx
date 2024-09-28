import { Movement } from "../../../domain/Movement";
import MovementCard from "./MovementCard";

type MovementCardHandProps = {
    movements: [Movement, Movement, Movement];
}

function MovementCardHand({ movements }: MovementCardHandProps) {

    return (
        <div className="flex flex-row px-[1.4em] pb-[1.8em]">
            <div className="group">
                <div className="rounded relative top-[1em] group-hover:top-[-1em] group-hover:z-20 shadow-lg shadow-black hover:shadow-xl hover:shadow-black transition-movement-card z-[10] -rotate-[15deg]">
                    <MovementCard movement={movements[0]}/>
                </div>
            </div>
            <div className="group">
                <div className="rounded relative top-[0em] group-hover:top-[-2em] group-hover:z-20 shadow-lg shadow-black hover:shadow-xl hover:shadow-black transition-movement-card z-[11]">
                    <MovementCard movement={movements[1]}/>
                </div>
            </div>
            <div className="group">
                <div className="rounded relative top-[1em] group-hover:top-[-1em] group-hover:z-20 shadow-lg shadow-black hover:shadow-xl hover:shadow-black transition-movement-card z-[12] rotate-[15deg]">
                    <MovementCard movement={movements[2]}/>
                </div>
            </div>
        </div>
    );
}

export default MovementCardHand;