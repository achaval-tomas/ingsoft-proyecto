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
            className="grid w-screen h-screen max-w-screen max-h-screen justify-center p-4"
            style={{ gridTemplateRows: "1fr auto", gridTemplateColumns: "1fr" }}
        >
            <div className="row-start-1 col-start-1 justify-self-center self-center">
                <Board tiles={tiles} />
            </div>
            <div className="row-start-2 col-start-1 justify-self-center self-end py-4">
                <MovementCardHand movements={movements} />
            </div>
            <div className="row-start-2 col-start-1 justify-self-end self-end">
                <FilledButton className="text-xl" padding="px-8 py-4">Terminar turno</FilledButton>
            </div>
        </div>
    );
}

export default GameLayout;