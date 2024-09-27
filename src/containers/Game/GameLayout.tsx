import FilledButton from "../../components/FilledButton";
import { Color } from "../../domain/Color";
import { Movement } from "../../domain/Movement";
import Board from "./components/Board";
import MovementCardHand from "./components/MovementCardHand";

type GameLayoutProps = {
    tiles: Color[];
    movements: [Movement, Movement, Movement];
};

function GameLayout({ tiles, movements }: GameLayoutProps) {
    return (
        <div
            className="grid w-screen h-screen justify-center"
            style={{ gridTemplateRows: "1fr auto", gridTemplateColumns: "1fr 1fr 1fr" }}
        >
            <div className="self-center col-start-2">
                <Board tiles={tiles} />
            </div>
            <div className="self-center col-start-2 py-4">
                <MovementCardHand movements={movements} />
            </div>
            <div className="text-end self-end col-start-3 p-4">
                <FilledButton className="text-xl" padding="px-8 py-4">Terminar turno</FilledButton>
            </div>
        </div>
    );
}

export default GameLayout;