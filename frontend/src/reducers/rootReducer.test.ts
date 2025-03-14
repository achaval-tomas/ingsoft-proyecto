import { describe, expect, test } from "vitest";
import { GameState } from "../domain/GameState";
import deepFreeze from "deep-freeze";
import { toBoardTiles } from "../util";
import { Color } from "../domain/Color";
import Action from "./Action";
import rootReducer from "./rootReducer";
import AppState from "../domain/AppState";

const testBoardTiles: Color[] = deepFreeze<Color[]>(toBoardTiles([
    "rgbyby",
    "rrrgbb",
    "gyybrb",
    "ygbrrr",
    "yryryr",
    "rrrrrr",
])) as Color[];

const testGameState: GameState = deepFreeze<GameState>({
    selfPlayerState: {
        id: "1",
        name: "p0",
        roundOrder: 0,
        shapeCardsInHand: [
            {
                shape: "b-2",
                isBlocked: false,
            },
            {
                shape: "b-4",
                isBlocked: false,
            },
            {
                shape: "c-4",
                isBlocked: false,
            },
        ],
        shapeCardsInDeckCount: 17,
        movementCardsInHand: ["straight-adjacent", "diagonal-adjacent", "l-cw"],
    },
    otherPlayersState: [
        {
            id: "3",
            name: "p1",
            roundOrder: 2,
            shapeCardsInHand: [
                {
                    shape: "b-2",
                    isBlocked: false,
                },
                {
                    shape: "c-4",
                    isBlocked: false,
                },
                {
                    shape: "c-9",
                    isBlocked: true,
                },
            ],
            shapeCardsInDeckCount: 14,
            movementCardsInHandCount: 2,
        },
        {
            id: "5",
            name: "p2",
            roundOrder: 1,
            shapeCardsInHand: [
                {
                    shape: "b-0",
                    isBlocked: false,
                },
                {
                    shape: "b-3",
                    isBlocked: false,
                },
                {
                    shape: "b-1",
                    isBlocked: false,
                },
            ],
            shapeCardsInDeckCount: 11,
            movementCardsInHandCount: 2,
        },
        {
            id: "15",
            name: "p3",
            roundOrder: 3,
            shapeCardsInHand: [
                {
                    shape: "c-0",
                    isBlocked: false,
                },
                {
                    shape: "c-3",
                    isBlocked: false,
                },
                {
                    shape: "c-1",
                    isBlocked: false,
                },
            ],
            shapeCardsInDeckCount: 9,
            movementCardsInHandCount: 2,
        },
    ],
    boardState: {
        tiles: testBoardTiles,
        blockedColor: null,
    },
    currentRoundPlayer: 0,
    turnStart: (new Date()).toISOString(),
    temporalMovements: [],
}) as GameState;

const testAppState: AppState = deepFreeze<AppState>({
    gameState: testGameState,
    chatMessages: [],
    notifications: [],
}) as AppState;

type RootReducerTestOptions = {
    shouldTurnStartChange: boolean;
    chatMessageCountChange: number;
}

function testAction(
    action: Action,
    initalAppState: AppState,
    expectedAppState: AppState,
    options: RootReducerTestOptions,
) {
    const result = rootReducer(deepFreeze(initalAppState) as AppState, action);

    expect({
        ...result,
        chatMessages: undefined,
        gameState: { ...result.gameState, turnStart: undefined },
    }).toStrictEqual({
        ...expectedAppState,
        chatMessages: undefined,
        gameState: { ...expectedAppState.gameState, turnStart: undefined },
    });

    if (options.shouldTurnStartChange) {
        expect(result?.gameState?.turnStart).not.toEqual(initalAppState?.gameState?.turnStart);
    } else {
        expect(result?.gameState?.turnStart).toEqual(initalAppState?.gameState?.turnStart);
    }

    expect(result.chatMessages).toHaveLength(initalAppState.chatMessages.length + options.chatMessageCountChange);
}

describe("rootReducer", () => {
    describe("turn-ended", () => {
        test("self - no actions taken", () => {
            testAction(
                {
                    type: "turn-ended",
                    playerId: testGameState.selfPlayerState.id,
                    newShapeCards: testGameState.selfPlayerState.shapeCardsInHand,
                    newMovementCards: testGameState.selfPlayerState.movementCardsInHand,
                },
                testAppState,
                {
                    ...testAppState,
                    gameState: {
                        ...testGameState,
                        currentRoundPlayer: 1,
                    },
                },
                {
                    shouldTurnStartChange: true,
                    chatMessageCountChange: 1,
                },
            );
        });

        test("self - with temporal movements", () => {
            testAction(
                {
                    type: "turn-ended",
                    playerId: testGameState.selfPlayerState.id,
                    newShapeCards: testGameState.selfPlayerState.shapeCardsInHand,
                    newMovementCards: testGameState.selfPlayerState.movementCardsInHand.toSpliced(0, 2).concat("l-ccw", "diagonal-adjacent"),
                },
                {
                    ...testAppState,
                    gameState: {
                        ...testGameState,
                        selfPlayerState: {
                            ...testGameState.selfPlayerState,
                            movementCardsInHand: testGameState.selfPlayerState.movementCardsInHand.toSpliced(0, 2),
                        },
                        temporalMovements: [
                            {
                                movement: "diagonal-adjacent",
                                position: [1, 1],
                                rotation: "r0",
                            },
                            {
                                movement: "diagonal-adjacent",
                                position: [2, 2],
                                rotation: "r90",
                            },
                        ],
                    },
                },
                {
                    ...testAppState,
                    gameState: {
                        ...testGameState,
                        selfPlayerState: {
                            ...testGameState.selfPlayerState,
                            movementCardsInHand: testGameState.selfPlayerState.movementCardsInHand.toSpliced(0, 2).concat("l-ccw", "diagonal-adjacent"),
                        },
                        boardState: {
                            ...testGameState.boardState,
                            tiles: toBoardTiles([
                                "rgbyby",
                                "rrrgbb",
                                "gbybrb",
                                "ygrrrr",
                                "yyyryr",
                                "rrrrrr",
                            ]),
                        },
                        currentRoundPlayer: 1,
                    },
                },
                {
                    shouldTurnStartChange: true,
                    chatMessageCountChange: 1,
                },
            );
        });

        test("other - no actions taken", () => {
            const pidx = 0;

            testAction(
                {
                    type: "turn-ended",
                    playerId: testGameState.otherPlayersState[pidx].id,
                    newShapeCards: testGameState.otherPlayersState[pidx].shapeCardsInHand,
                },
                {
                    ...testAppState,
                    gameState: {
                        ...testGameState,
                        currentRoundPlayer: 2,
                    },
                },
                {
                    ...testAppState,
                    gameState: {
                        ...testGameState,
                        otherPlayersState: testGameState.otherPlayersState.map((otherPlayerState, i) => (i !== pidx) ? otherPlayerState : {
                            ...otherPlayerState,
                            movementCardsInHandCount: 3,
                        }),
                        currentRoundPlayer: 3,
                    },
                },
                {
                    shouldTurnStartChange: true,
                    chatMessageCountChange: 1,
                },
            );
        });

        test("other - with temporal movements", () => {
            const pidx = 0;

            testAction(
                {
                    type: "turn-ended",
                    playerId: testGameState.otherPlayersState[pidx].id,
                    newShapeCards: testGameState.otherPlayersState[pidx].shapeCardsInHand,
                },
                {
                    ...testAppState,
                    gameState: {
                        ...testGameState,
                        otherPlayersState: testGameState.otherPlayersState.map((otherPlayerState, i) => (i !== pidx) ? otherPlayerState : {
                            ...otherPlayerState,
                            movementCardsInHandCount: 1,
                        }),
                        temporalMovements: [
                            {
                                movement: "diagonal-adjacent",
                                position: [1, 1],
                                rotation: "r0",
                            },
                            {
                                movement: "diagonal-adjacent",
                                position: [2, 2],
                                rotation: "r90",
                            },
                        ],
                        currentRoundPlayer: 2,
                    },
                },
                {
                    ...testAppState,
                    gameState: {
                        ...testGameState,
                        otherPlayersState: testGameState.otherPlayersState.map((otherPlayerState, i) => (i !== 0) ? otherPlayerState : {
                            ...otherPlayerState,
                            movementCardsInHandCount: 3,
                        }),
                        boardState: {
                            ...testGameState.boardState,
                            tiles: toBoardTiles([
                                "rgbyby",
                                "rrrgbb",
                                "gbybrb",
                                "ygrrrr",
                                "yyyryr",
                                "rrrrrr",
                            ]),
                        },
                        currentRoundPlayer: 3,
                    },
                },
                {
                    shouldTurnStartChange: true,
                    chatMessageCountChange: 1,
                },
            );
        });
    });

    describe("player-left", () => {
        test("other - not current turn", () => {
            const pidx = 1;

            testAction(
                {
                    type: "player-left",
                    playerId: testGameState.otherPlayersState[pidx].id,
                },
                testAppState,
                {
                    ...testAppState,
                    gameState: {
                        ...testGameState,
                        otherPlayersState: testGameState.otherPlayersState.filter((_, i) => i !== pidx),
                    },
                },
                {
                    shouldTurnStartChange: false,
                    chatMessageCountChange: 1,
                },
            );
        });

        test("other - current turn without temporal movements", () => {
            const pidx = 1;

            testAction(
                {
                    type: "player-left",
                    playerId: testGameState.otherPlayersState[pidx].id,
                },
                {
                    ...testAppState,
                    gameState: {
                        ...testGameState,
                        currentRoundPlayer: 1,
                    },
                },
                {
                    ...testAppState,
                    gameState: {
                        ...testGameState,
                        otherPlayersState: testGameState.otherPlayersState.filter((_, i) => i !== pidx),
                        currentRoundPlayer: 2,
                    },
                },
                {
                    shouldTurnStartChange: true,
                    chatMessageCountChange: 1,
                },
            );
        });

        test("other - current turn with temporal movements", () => {
            const pidx = 1;

            testAction(
                {
                    type: "player-left",
                    playerId: testGameState.otherPlayersState[pidx].id,
                },
                {
                    ...testAppState,
                    gameState: {
                        ...testGameState,
                        temporalMovements: [
                            {
                                movement: "straight-adjacent",
                                position: [0, 0],
                                rotation: "r90",
                            },
                        ],
                        currentRoundPlayer: 1,
                    },
                },
                {
                    ...testAppState,
                    gameState: {
                        ...testGameState,
                        otherPlayersState: testGameState.otherPlayersState.filter((_, i) => i !== pidx),
                        boardState: {
                            ...testGameState.boardState,
                            tiles: toBoardTiles([
                                "rgbyby",
                                "rrrgbb",
                                "gyybrb",
                                "ygbrrr",
                                "rryryr",
                                "yrrrrr",
                            ]),
                        },
                        currentRoundPlayer: 2,
                    },
                },
                {
                    shouldTurnStartChange: true,
                    chatMessageCountChange: 1,
                },
            );
        });
    });

    describe("player-won", () => {
        test("self", () => {
            testAction(
                {
                    type: "player-won",
                    playerId: testGameState.selfPlayerState.id,
                },
                testAppState,
                {
                    ...testAppState,
                    gameState: {
                        ...testGameState,
                        winner: testGameState.selfPlayerState.id,
                    },
                },
                {
                    shouldTurnStartChange: false,
                    chatMessageCountChange: 0,
                },
            );
        });

        test("other", () => {
            const pidx = 1;

            testAction(
                {
                    type: "player-won",
                    playerId: testGameState.otherPlayersState[pidx].id,
                },
                testAppState,
                {
                    ...testAppState,
                    gameState: {
                        ...testGameState,
                        winner: testGameState.otherPlayersState[pidx].id,
                    },
                },
                {
                    shouldTurnStartChange: false,
                    chatMessageCountChange: 0,
                },
            );
        });
    });

    describe("movement-card-used", () => {
        test("self", () => {
            testAction(
                {
                    type: "movement-card-used",
                    movement: "diagonal-adjacent",
                    position: [2, 2],
                    rotation: "r270",
                },
                testAppState,
                {
                    ...testAppState,
                    gameState: {
                        ...testGameState,
                        selfPlayerState: {
                            ...testGameState.selfPlayerState,
                            movementCardsInHand: ["straight-adjacent", "l-cw"],
                        },
                        temporalMovements: [
                            {
                                movement: "diagonal-adjacent",
                                position: [2, 2],
                                rotation: "r270",
                            },
                        ],
                        boardState: {
                            ...testGameState.boardState,
                            tiles: toBoardTiles([
                                "rgbyby",
                                "rrrgbb",
                                "gyybrb",
                                "ygrrrr",
                                "yrybyr",
                                "rrrrrr",
                            ]),
                        },
                    },
                },
                {
                    shouldTurnStartChange: false,
                    chatMessageCountChange: 1,
                },
            );
        });

        test("other", () => {
            testAction(
                {
                    type: "movement-card-used",
                    movement: "straight-edge",
                    position: [1, 0],
                    rotation: "r90",
                },
                {
                    ...testAppState,
                    gameState: {
                        ...testGameState,
                        currentRoundPlayer: 3,
                    },
                },
                {
                    ...testAppState,
                    gameState: {
                        ...testGameState,
                        temporalMovements: [
                            {
                                movement: "straight-edge",
                                position: [1, 0],
                                rotation: "r90",
                            },
                        ],
                        boardState: {
                            ...testGameState.boardState,
                            tiles: toBoardTiles([
                                "rrbyby",
                                "rrrgbb",
                                "gyybrb",
                                "ygbrrr",
                                "yryryr",
                                "rgrrrr",
                            ]),
                        },
                        otherPlayersState: testGameState.otherPlayersState.map(p =>
                            p.id === "15" ? { ...p, movementCardsInHandCount: 1 } : p),
                        currentRoundPlayer: 3,
                    },
                },
                {
                    shouldTurnStartChange: false,
                    chatMessageCountChange: 1,
                },
            );
        });
    });

    describe("movement-cancelled", () => {
        test("self - current turn without temporal movements", () => {
            testAction(
                {
                    type: "movement-cancelled",
                },
                testAppState,
                testAppState,
                {
                    shouldTurnStartChange: false,
                    chatMessageCountChange: 0,
                },
            );
        });

        test("self - current turn with temporal movements", () => {
            testAction(
                {
                    type: "movement-cancelled",
                },
                {
                    ...testAppState,
                    gameState: {
                        ...testGameState,
                        selfPlayerState: {
                            ...testGameState.selfPlayerState,
                            movementCardsInHand: ["l-cw", "diagonal-adjacent"],
                        },
                        temporalMovements: [
                            {
                                movement: "straight-adjacent",
                                position: [5, 5],
                                rotation: "r270",
                            },
                        ],
                    },
                },
                {
                    ...testAppState,
                    gameState: {
                        ...testGameState,
                        selfPlayerState: {
                            ...testGameState.selfPlayerState,
                            movementCardsInHand: ["l-cw", "diagonal-adjacent", "straight-adjacent"],
                        },
                        temporalMovements: [],
                        boardState: {
                            ...testGameState.boardState,
                            tiles: toBoardTiles([
                                "rgbybb",
                                "rrrgby",
                                "gyybrb",
                                "ygbrrr",
                                "yryryr",
                                "rrrrrr",
                            ]),
                        },
                    },
                },
                {
                    shouldTurnStartChange: false,
                    chatMessageCountChange: 1,
                },
            );
        });

        test("other - current turn without temporal movements", () => {
            testAction(
                {
                    type: "movement-cancelled",
                },
                {
                    ...testAppState,
                    gameState: {
                        ...testGameState,
                        currentRoundPlayer: 2,
                    },
                },
                {
                    ...testAppState,
                    gameState: {
                        ...testGameState,
                        currentRoundPlayer: 2,
                    },
                },
                {
                    shouldTurnStartChange: false,
                    chatMessageCountChange: 0,
                },
            );
        });

        test("other - current turn with temporal movements", () => {
            testAction(
                {
                    type: "movement-cancelled",
                },
                {
                    ...testAppState,
                    gameState: {
                        ...testGameState,
                        temporalMovements: [
                            {
                                movement: "l-cw",
                                position: [2, 3],
                                rotation: "r90",
                            },
                        ],
                        currentRoundPlayer: 1,
                    },
                },
                {
                    ...testAppState,
                    gameState: {
                        ...testGameState,
                        otherPlayersState: testGameState.otherPlayersState.map(p =>
                            p.id === "5" ? { ...p, movementCardsInHandCount: 3 } : p),
                        temporalMovements: [],
                        currentRoundPlayer: 1,
                        boardState: {
                            ...testGameState.boardState,
                            tiles: toBoardTiles([
                                "rgbyby",
                                "yrrgbb",
                                "gyrbrb",
                                "ygbrrr",
                                "yryryr",
                                "rrrrrr",
                            ]),
                        },
                    },
                },
                {
                    shouldTurnStartChange: false,
                    chatMessageCountChange: 1,
                },
            );
        });
    });

    describe("shape-card-used", () => {
        test("self targets self - invalid shape in position", () => {
            testAction(
                {
                    type: "shape-card-used",
                    position: [2, 1],
                    targetPlayerId: "1",
                },
                testAppState,
                testAppState,
                {
                    shouldTurnStartChange: false,
                    chatMessageCountChange: 0,
                },
            );
        });

        test("self targets self - colour of shape in position is blocked", () => {
            testAction(
                {
                    type: "shape-card-used",
                    position: [0, 5],
                    targetPlayerId: "1",
                },
                {
                    ...testAppState,
                    gameState: {
                        ...testGameState,
                        boardState: {
                            tiles: testBoardTiles,
                            blockedColor: "red",
                        },
                    },
                },
                {
                    ...testAppState,
                    gameState: {
                        ...testGameState,
                        boardState: {
                            tiles: testBoardTiles,
                            blockedColor: "red",
                        },
                    },
                },
                {
                    shouldTurnStartChange: false,
                    chatMessageCountChange: 0,
                },
            );
        });

        test("self targets self - correctly discards shape card", () => {
            testAction(
                {
                    type: "shape-card-used",
                    position: [0, 5],
                    targetPlayerId: "1",
                },
                testAppState,
                {
                    ...testAppState,
                    gameState: {
                        ...testGameState,
                        boardState: {
                            tiles: testBoardTiles,
                            blockedColor: "red",
                        },
                        selfPlayerState: {
                            ...testGameState.selfPlayerState,
                            shapeCardsInHand: [
                                {
                                    shape: "b-2",
                                    isBlocked: false,
                                },
                                {
                                    shape: "c-4",
                                    isBlocked: false,
                                },
                            ],
                        },
                    },
                },
                {
                    shouldTurnStartChange: false,
                    chatMessageCountChange: 1,
                },
            );
        });

        test("self targets other - correctly blocks shape card", () => {
            testAction(
                {
                    type: "shape-card-used",
                    position: [4, 5],
                    targetPlayerId: "5",
                },
                testAppState,
                {
                    ...testAppState,
                    gameState: {
                        ...testGameState,
                        boardState: {
                            tiles: testBoardTiles,
                            blockedColor: "blue",
                        },
                        otherPlayersState: testGameState.otherPlayersState.map(p =>
                            p.id === "5"
                                ? {
                                    ...p,
                                    shapeCardsInHand: [
                                        {
                                            shape: "b-0",
                                            isBlocked: true,
                                        },
                                        {
                                            shape: "b-3",
                                            isBlocked: false,
                                        },
                                        {
                                            shape: "b-1",
                                            isBlocked: false,
                                        },
                                    ],
                                }
                                : p),
                    },
                },
                {
                    shouldTurnStartChange: false,
                    chatMessageCountChange: 1,
                },
            );
        });


        test("other targets themselves - correctly discards shape card", () => {
            testAction(
                {
                    type: "shape-card-used",
                    position: [4, 4],
                    targetPlayerId: "5",
                },
                {
                    ...testAppState,
                    gameState: {
                        ...testGameState,
                        currentRoundPlayer: 1,
                    },
                },
                {
                    ...testAppState,
                    gameState: {
                        ...testGameState,
                        currentRoundPlayer: 1,
                        boardState: {
                            tiles: testBoardTiles,
                            blockedColor: "blue",
                        },
                        otherPlayersState: testGameState.otherPlayersState.map(p =>
                            p.id === "5"
                                ? {
                                    ...p,
                                    shapeCardsInHand: [
                                        {
                                            shape: "b-3",
                                            isBlocked: false,
                                        },
                                        {
                                            shape: "b-1",
                                            isBlocked: false,
                                        },
                                    ],
                                }
                                : p),
                    },
                },
                {
                    shouldTurnStartChange: false,
                    chatMessageCountChange: 1,
                },
            );
        });

        test("other targets self - correctly blocks shape card", () => {
            testAction(
                {
                    type: "shape-card-used",
                    position: [0, 5],
                    targetPlayerId: "1",
                },
                {
                    ...testAppState,
                    gameState: {
                        ...testGameState,
                        currentRoundPlayer: 1,
                    },
                },
                {
                    ...testAppState,
                    gameState: {
                        ...testGameState,
                        currentRoundPlayer: 1,
                        boardState: {
                            tiles: testBoardTiles,
                            blockedColor: "red",
                        },
                        selfPlayerState: {
                            ...testGameState.selfPlayerState,
                            shapeCardsInHand: [
                                {
                                    shape: "b-2",
                                    isBlocked: false,
                                },
                                {
                                    shape: "b-4",
                                    isBlocked: true,
                                },
                                {
                                    shape: "c-4",
                                    isBlocked: false,
                                },
                            ],
                        },
                    },
                },
                {
                    shouldTurnStartChange: false,
                    chatMessageCountChange: 1,
                },
            );
        });

    });
});
