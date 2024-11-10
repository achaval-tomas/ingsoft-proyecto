import { describe, expect, test } from "vitest";
import { GameState } from "../domain/GameState";
import deepFreeze from "deep-freeze";
import { toBoardTiles } from "../util";
import { Color } from "../domain/Color";
import Action from "./Action";
import rootReducer from "./rootReducer";
import AppState from "../domain/AppState";

const testBoardTiles: Color[] = toBoardTiles([
    "rgbyry",
    "rrrgbb",
    "gyybry",
    "ygbrrr",
    "yryryr",
    "rrrrrr",
]);

const testGameState: GameState = {
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
};

const testAppState: AppState = {
    gameState: testGameState,
    chatMessages: [],
    notifications: [],
};

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
        expect(result?.gameState?.turnStart).not.toEqual(initalAppState?.gameState?.turnStart);
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
                                "rgbyry",
                                "rrrgbb",
                                "gbybry",
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
                                "rgbyry",
                                "rrrgbb",
                                "gbybry",
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
});