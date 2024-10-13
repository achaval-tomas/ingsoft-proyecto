import FilledButton from "../../components/FilledButton";
import TextButton from "../../components/TextButton";
import { Position } from "../../domain/Position";
import Board from "./components/Board";
import MovementCardDeck from "./components/MovementCardDeck";
import MovementCardHand from "./components/MovementCardHand";
import ShapeCardHand from "./components/ShapeCardHand";
import { GameUiState } from "./GameUiState";

type GameLayoutProps = {
    uiState: GameUiState;
    onClickEndTurn: () => void;
    onClickLeaveGame: () => void;
    onClickMovementCard: (i: number) => void;
    onClickTile: (i: Position) => void;
};

function GameLayout({ uiState, onClickEndTurn, onClickLeaveGame, onClickMovementCard, onClickTile }: GameLayoutProps) {
    const { selfPlayerUiState, otherPlayersUiState, boardUiState } = uiState;

    return (
        <div
            className="grid w-screen h-screen max-w-screen max-h-screen justify-center p-4"
            style={{ gridTemplateRows: "5fr 2fr", gridTemplateColumns: "1fr" }}
        >
            <div className="row-start-1 col-start-1 h-full aspect-square justify-self-center self-center">
                <div className="flex flex-row w-full h-full ">
                    <div className="grid w-full h-full" style={{ gridTemplateRows: "1fr 4fr 1fr", gridTemplateColumns: "1fr 4fr 1fr" }}>
                        <div className="row-start-2 col-start-2">
                            <Board uiState={boardUiState} onClickTile={onClickTile} />
                        </div>
                        <ShapeCardHand
                            playerName={selfPlayerUiState.name}
                            shapeCards={selfPlayerUiState.shapeCardsInHand}
                            rotation="r0"
                            className="row-start-3 col-start-2 h-full w-full justify-center pt-[3%]"
                        />
                        {otherPlayersUiState[0] && <ShapeCardHand
                            playerName={otherPlayersUiState[0].name}
                            shapeCards={otherPlayersUiState[0].shapeCardsInHand}
                            rotation="r90"
                            className="row-start-2 col-start-3 h-full w-full justify-center pl-[15%]"
                        />}
                        {otherPlayersUiState[1] && <ShapeCardHand
                            playerName={otherPlayersUiState[1].name}
                            shapeCards={otherPlayersUiState[1].shapeCardsInHand}
                            rotation="r180"
                            className="row-start-1 col-start-2 h-full w-full justify-center pb-[3%]"
                        />}
                        {otherPlayersUiState[2] && <ShapeCardHand
                            playerName={otherPlayersUiState[2].name}
                            shapeCards={otherPlayersUiState[2].shapeCardsInHand}
                            rotation="r270"
                            className="row-start-2 col-start-1 h-full w-full justify-center pr-[15%]"
                        />}
                    </div>
                    <div className="relative w-0 h-[12em] self-center">
                        <div className="absolute left-32 w-[8em] h-[12em]">
                            <MovementCardDeck />
                        </div>
                    </div>
                </div>
            </div>
            <MovementCardHand
                movementCards={selfPlayerUiState.movementCardsInHand}
                className="row-start-2 col-start-1 justify-center justify-self-center h-full pt-[2.5%] pb-[0.5%] w-0 h-full"
                onClickMovementCard={onClickMovementCard}
            />
            <div className="row-start-2 col-start-1 justify-self-end self-end">
                <FilledButton className="text-xl" padding="px-8 py-4" onClick={onClickEndTurn}>Terminar turno</FilledButton>
            </div>
            <div className="row-start-1 col-start-1 justify-self-end self-start">
                <TextButton className="text-xl" padding="px-8 py-4" onClick={onClickLeaveGame}>Abandonar partida</TextButton>
            </div>
        </div>
    );
}

export default GameLayout;
