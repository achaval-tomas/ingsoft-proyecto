import { Movement } from "../../../domain/Movement";
import MovementCard from "./MovementCard";

type MovementCardHandProps = {
    movements: [Movement, Movement, Movement];
}

function MovementCardHand({ movements }: MovementCardHandProps) {

    return (
        <div className="flex flex-row">
            <MovementCard movement={movements[0]}/>
            <MovementCard movement={movements[1]}/>
            <MovementCard movement={movements[2]}/>
        </div>
    );
}

export default MovementCardHand;