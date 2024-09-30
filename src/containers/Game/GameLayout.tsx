import FilledButton from "../../components/FilledButton";
import { Color } from "../../domain/Color";
import { OtherPlayerState, SelfPlayerState } from "../../domain/GameState";
import { Rotation } from "../../domain/Rotation";
import Board from "./components/Board";
import MovementCardDeck from "./components/MovementCardDeck";
import MovementCardHand from "./components/MovementCardHand";
import ShapeCardHand from "./components/ShapeCardHand";

type GameLayoutProps = {
    tiles: Color[];
    selfPlayerState: SelfPlayerState;
    otherPlayersState: OtherPlayerState[];
    onClickEndTurn: () => void;
};

function DummyInvisibleShapeCardHand({ rotation }: { rotation: Rotation} ) {
    return (
        <div className="invisible">
            <ShapeCardHand shapeCards={[{ shape: "b-0", isBlocked: false }]} rotation={rotation} />
        </div>
    );
}

function GameLayout({ tiles, selfPlayerState, otherPlayersState, onClickEndTurn }: GameLayoutProps) {
    return (
        <div
            className="grid w-screen h-screen max-w-screen max-h-screen justify-center p-4"
            style={{ gridTemplateRows: "1fr auto", gridTemplateColumns: "1fr" }}
        >
            <div className="row-start-1 col-start-1 justify-self-center self-center">
                <div className="flex flex-row">
                    <div className="grid" style={{ gridTemplateRows: "auto 1fr auto", gridTemplateColumns: "auto 1fr auto" }}>
                        <div className="row-start-2 col-start-2">
                            <Board tiles={tiles} activeSide="t" />
                        </div>
                        <div className="row-start-3 col-start-2 justify-self-center pt-[1em]">
                            {( selfPlayerState.shapeCardsInHand.length >= 1) ?
                                <ShapeCardHand shapeCards={selfPlayerState.shapeCardsInHand} rotation="r0" /> :
                                <DummyInvisibleShapeCardHand rotation="r0" />}
                        </div>
                        <div className="row-start-2 col-start-3 self-center pl-[1em]">
                            {(otherPlayersState.length >= 1 && otherPlayersState[0].shapeCardsInHand.length >= 1) ?
                                <ShapeCardHand shapeCards={otherPlayersState[0].shapeCardsInHand} rotation="r90" /> :
                                <DummyInvisibleShapeCardHand rotation="r90" />}
                        </div>
                        <div className="row-start-1 col-start-2 justify-self-center pb-[1em]">
                            {(otherPlayersState.length >= 2 && otherPlayersState[1].shapeCardsInHand.length >= 1) ?
                                <ShapeCardHand shapeCards={otherPlayersState[1].shapeCardsInHand} rotation="r180" /> :
                                <DummyInvisibleShapeCardHand rotation="r180" />}
                        </div>
                        <div className="row-start-2 col-start-1 self-center pr-[1em]">
                            {(otherPlayersState.length >= 3 && otherPlayersState[2].shapeCardsInHand.length >= 1) ?
                                <ShapeCardHand shapeCards={otherPlayersState[2].shapeCardsInHand} rotation="r270" /> :
                                <DummyInvisibleShapeCardHand rotation="r270" />}
                        </div>
                    </div>
                    <div className="relative w-0 h-[12em] self-center">
                        <div className="absolute left-32 w-[8em] h-[12em]">
                            <MovementCardDeck />
                        </div>
                    </div>
                </div>
            </div>
            <div className="row-start-2 col-start-1 justify-self-center self-end py-4">
                <MovementCardHand movements={selfPlayerState.movementCardsInHand} />
            </div>
            <div className="row-start-2 col-start-1 justify-self-end self-end">
                <FilledButton className="text-xl" padding="px-8 py-4" onClick={onClickEndTurn}>Terminar turno</FilledButton>
            </div>
        </div>
    );
}

export default GameLayout;