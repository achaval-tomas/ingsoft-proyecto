import FilledButton from "../../components/FilledButton";
import { Color } from "../../domain/Color";
import { Movement } from "../../domain/Movement";
import { Shape } from "../../domain/Shape";
import Board from "./components/Board";
import MovementCardDeck from "./components/MovementCardDeck";
import MovementCardHand from "./components/MovementCardHand";
import ShapeCardHand from "./components/ShapeCardHand";

type GameLayoutProps = {
    tiles: Color[];
    movements: [Movement, Movement, Movement];
    shapes: [Shape, Shape, Shape]
};

function GameLayout({ tiles, shapes, movements }: GameLayoutProps) {
    return (
        <div
            className="grid w-screen h-screen max-w-screen max-h-screen justify-center p-4"
            style={{ gridTemplateRows: "1fr auto", gridTemplateColumns: "1fr" }}
        >
            <div className="row-start-1 col-start-1 justify-self-center self-center">
                <div className="flex flex-row">
                    <Board tiles={tiles} />
                    <div className="relative w-0 h-[12em] self-center">
                        <div className="absolute left-32 w-[8em] h-[12em]">
                            <MovementCardDeck />
                        </div>
                    </div>
                </div>
            </div>
            <div className="row-start-2 col-start-1 justify-self-center pt-4">
                <ShapeCardHand shapes={shapes} />
            </div>
            <div className="row-start-3 col-start-1 justify-self-center self-end py-4">
                <MovementCardHand movements={movements} />
            </div>
            <div className="row-start-3 col-start-1 justify-self-end self-end">
                <FilledButton className="text-xl" padding="px-8 py-4">Terminar turno</FilledButton>
            </div>
        </div>
    );
}

export default GameLayout;