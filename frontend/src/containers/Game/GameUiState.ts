import { Color } from "../../domain/Color";
import { Direction } from "../../domain/Direction";
import { PlayerId } from "../../domain/GameState";
import { Movement } from "../../domain/Movement";
import { Shape } from "../../domain/Shape";

export type BoardTileStatus = "normal" | "highlighted" | "selected" | "selectable";

export type BoardTileUiState = {
    color: Color;
    status: BoardTileStatus;
}

export type BoardUiState = {
    tiles: BoardTileUiState[];
    activeSide: Direction;
    blockedColor: Color | null;
}

export type ShapeCardStatus = "normal" | "blocked" | "selected";

export type ShapeCardUiState = {
    shape: Shape;
    status: ShapeCardStatus;
}

export type CommonPlayerUiState = {
    id: PlayerId;
    name: string;
    shapeCardsInHand: ShapeCardUiState[];
    shapeCardsInDeckCount: number;
}

export type MovementCardStatus = "normal" | "selected";

export type MovementCardUiState = {
    movement: Movement;
    status: MovementCardStatus;
}

export type SelfPlayerUiState = CommonPlayerUiState & {
    movementCardsInHand: MovementCardUiState[];
    canCancelMovement: boolean;
}

export type OtherPlayerUiState = CommonPlayerUiState & {
    movementCardsInHandCount: number;
}

export type GameUiState = {
    selfPlayerUiState: SelfPlayerUiState;
    otherPlayersUiState: OtherPlayerUiState[];
    boardUiState: BoardUiState;
    turnStart: string;
    winnerName: string | undefined;
}
