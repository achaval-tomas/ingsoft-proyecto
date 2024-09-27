import { Movement } from "../../../domain/Movement";
import MovementCard from "./MovementCard";

type MovementCardHandProps = {
    movements: [Movement, Movement, Movement];
}

function MovementCardHand({ movements }: MovementCardHandProps) {

    return (
        <div className="flex flex-row px-[1.4em] pb-[1.8em]">
            <div className="relative top-[1em] -rotate-[15deg] hover:top-[-2em] hover:z-30 transition-[top]"><MovementCard movement={movements[0]}/></div>
            <div className="relative z-10 hover:top-[-2em] hover:z-30 transition-[top]"><MovementCard movement={movements[1]}/></div>
            <div className="relative top-[1em] rotate-[15deg] z-20 hover:top-[-2em] hover:z-30 transition-[top]"><MovementCard movement={movements[2]}/></div>
        </div>
    );
}

export default MovementCardHand;