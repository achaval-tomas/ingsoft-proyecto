import { Movement } from "../../../domain/Movement";
import MovementCard from "./MovementCard";

type MovementCardHandProps = {
    movements: [Movement, Movement, Movement];
}

function MovementCardHand({ movements }: MovementCardHandProps) {

    return (
        <div className="flex flex-row px-[1.4em] pb-[1.8em]">
            <div className="group">
                <div className="relative top-[1em] -rotate-[15deg] group-hover:top-[-1.5em] group-hover:z-30 transition-[top]">
                    <MovementCard movement={movements[0]}/>
                </div>
            </div>
            <div className="group">
                <div className="relative top-[0em] z-10 group-hover:top-[-2em] group-hover:z-30 transition-[top]">
                    <MovementCard movement={movements[1]}/>
                </div>
            </div>
            <div className="group">
                <div className="relative top-[1em] rotate-[15deg] z-20 group-hover:top-[-1.5em] group-hover:z-30 transition-[top]">
                    <MovementCard movement={movements[2]}/>
                </div>
            </div>
        </div>
    );
}

export default MovementCardHand;