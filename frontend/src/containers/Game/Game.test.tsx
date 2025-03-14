import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";
import Game from "./Game";
import { Color } from "../../domain/Color";
import { toBoardTiles } from "../../util";
import deepFreeze from "deep-freeze";
import { GameState } from "../../domain/GameState";
import userEvent from "@testing-library/user-event";
import { GameMessageIn, GameMessageOut } from "../../domain/GameMessage";
import { Provider } from "react-redux";
import rootReducer from "../../reducers/rootReducer";
import AppState from "../../domain/AppState";
import { createStore } from "redux";
import { Position } from "../../domain/Position";

const testBoardTiles: Color[] = deepFreeze<Color[]>(toBoardTiles([
    "rgbyrb",
    "rrrybb",
    "gybgby",
    "bbbggr",
    "byybgb",
    "rrrrrb",
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
                isBlocked: true,
            },
        ],
        shapeCardsInDeckCount: 17,
        movementCardsInHand: ["straight-adjacent", "diagonal-adjacent", "straight-edge"],
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
        blockedColor: "yellow",
    },
    currentRoundPlayer: 0,
    turnStart: (new Date()).toISOString(),
    temporalMovements: [],
}) as GameState;

function createTestStore() {
    const initialAppState: AppState = {
        gameState: null,
        notifications: [],
        chatMessages: [],
    };

    return createStore<AppState, GameMessageIn>(rootReducer, initialAppState);
}

describe("Game", () => {
    async function genericGameTest({
        setup,
        expectedMessages,
        gameState = testGameState,
    }: {
        setup: (() => void) | (() => Promise<void>);
        expectedMessages: GameMessageOut[];
        gameState?: GameState;
    }) {
        let messageIndex = 0;
        const sendMessage = vi.fn<(msg: GameMessageOut) => void>((message) => {
            expect(messageIndex).toBeLessThan(expectedMessages.length);
            expect(message).toStrictEqual(expectedMessages[messageIndex]);
            messageIndex++;
        });

        render(
            <Provider store={createTestStore()}>
                <Game
                    gameId="1"
                    gameState={gameState}
                    sendMessage={sendMessage}
                />,
            </Provider>,
        );

        await setup();

        expect(sendMessage).toHaveBeenCalledTimes(expectedMessages.length);
    }

    beforeAll(() => {
        vi.mock("react-router-dom", async () => {
            const mod = await vi.importActual("react-router-dom");

            return {
                ...mod,
                useNavigate: () => (() => {}),
            };
        });
    });

    afterEach(() => {
        cleanup();
    });

    describe("use shape card", () => {
        async function genericUseShapeCardTest({
            targetTilePosition,
            targetShapeCardPlayerId,
            targetShapeCardIndex,
            expectedMessages,
            gameState,
        }: {
            targetTilePosition: Position;
            targetShapeCardPlayerId: string;
            targetShapeCardIndex: number;
            expectedMessages: GameMessageOut[];
            gameState?: GameState;
        }) {
            await genericGameTest({
                setup: async () => {
                    const targetTile = screen.getByTestId(`tile-${targetTilePosition[0]}-${targetTilePosition[1]}`);
                    const targetShapeCard = screen.getByTestId(`shape-card-${targetShapeCardPlayerId}-${targetShapeCardIndex}`);

                    expect(targetTile).toBeVisible();
                    expect(targetShapeCard).toBeVisible();

                    await userEvent.click(targetShapeCard);
                    await userEvent.click(targetTile);
                },
                expectedMessages,
                gameState,
            });
        }

        test("our shape card", async () => {
            const targetPlayerId = testGameState.selfPlayerState.id;

            await genericUseShapeCardTest({
                targetTilePosition: [0, 4],
                targetShapeCardPlayerId: targetPlayerId,
                targetShapeCardIndex: 1,
                expectedMessages: [
                    {
                        type: "use-shape-card",
                        targetPlayerId,
                        position: [0, 4],
                    },
                ],
            });
        });

        test("their shape card", async () => {
            const targetPlayerId = testGameState.otherPlayersState[1].id;

            await genericUseShapeCardTest({
                targetTilePosition: [4, 1],
                targetShapeCardPlayerId: targetPlayerId,
                targetShapeCardIndex: 0,
                expectedMessages: [
                    {
                        type: "use-shape-card",
                        targetPlayerId,
                        position: [4, 1],
                    },
                ],
            });
        });

        test("can't use our blocked shape card", async () => {
            const targetPlayerId = testGameState.selfPlayerState.id;

            await genericUseShapeCardTest({
                targetTilePosition: [0, 0] as Position,
                targetShapeCardPlayerId: targetPlayerId,
                targetShapeCardIndex: 2,
                expectedMessages: [],
            });
        });

        test("can't use their blocked shape card", async () => {
            const targetPlayerId = testGameState.otherPlayersState[0].id;

            await genericUseShapeCardTest({
                targetTilePosition: [0, 1] as Position,
                targetShapeCardPlayerId: targetPlayerId,
                targetShapeCardIndex: 2,
                expectedMessages: [],
            });
        });

        test("can't use their shape card if they have a blocked shape card", async () => {
            const targetPlayerId = testGameState.otherPlayersState[0].id;

            await genericUseShapeCardTest({
                targetTilePosition: [5, 5] as Position,
                targetShapeCardPlayerId: targetPlayerId,
                targetShapeCardIndex: 0,
                expectedMessages: [],
            });
        });
    });

    describe("use movement card", () => {
        async function genericUseMovementCardTest({
            sourceTilePosition,
            targetTilePosition,
            targetMovementCardIndex,
            expectedMessages,
            gameState,
        }: {
            sourceTilePosition: Position;
            targetTilePosition: Position;
            targetMovementCardIndex: number;
            expectedMessages: GameMessageOut[];
            gameState?: GameState;
        }) {
            await genericGameTest({
                setup: async () => {
                    const sourceTile = screen.getByTestId(`tile-${sourceTilePosition[0]}-${sourceTilePosition[1]}`);
                    const targetTile = screen.getByTestId(`tile-${targetTilePosition[0]}-${targetTilePosition[1]}`);
                    const targetMovementCard = screen.getByTestId(`movement-card-${targetMovementCardIndex}`);

                    expect(targetMovementCard).toBeVisible();
                    expect(sourceTile).toBeVisible();
                    expect(targetTile).toBeVisible();

                    await userEvent.click(targetMovementCard);
                    await userEvent.click(sourceTile);
                    await userEvent.click(targetTile);
                },
                expectedMessages,
                gameState,
            });
        }

        test("can correctly use movement card", async () => {
            await genericUseMovementCardTest({
                sourceTilePosition: [1, 4],
                targetTilePosition: [2, 4],
                targetMovementCardIndex: 0,
                expectedMessages: [
                    {
                        type: "use-movement-card",
                        movement: "straight-adjacent",
                        position: [1, 4],
                        rotation: "r0",
                    },
                ],
            });
        });

        test("can't incorrectly use movement card", async () => {
            await genericUseMovementCardTest({
                sourceTilePosition: [1, 4],
                targetTilePosition: [2, 5],
                targetMovementCardIndex: 0,
                expectedMessages: [],
            });
        });

        test("can correctly use straight-edge movement card (A)", async () => {
            await genericUseMovementCardTest({
                sourceTilePosition: [1, 4],
                targetTilePosition: [0, 4],
                targetMovementCardIndex: 2,
                expectedMessages: [
                    {
                        type: "use-movement-card",
                        movement: "straight-edge",
                        position: [1, 4],
                        rotation: "r180",
                    },
                ],
            });
        });

        test("can correctly use straight-edge movement card (B)", async () => {
            await genericUseMovementCardTest({
                sourceTilePosition: [1, 4],
                targetTilePosition: [5, 4],
                targetMovementCardIndex: 2,
                expectedMessages: [
                    {
                        type: "use-movement-card",
                        movement: "straight-edge",
                        position: [1, 4],
                        rotation: "r0",
                    },
                ],
            });
        });

        test("can revert movement", async () => {
            await genericGameTest({
                setup: async () => {
                    const revertMovementButton = screen.getByTestId("btn-revert-movement");

                    expect(revertMovementButton).toBeVisible();

                    await userEvent.click(revertMovementButton);
                },
                gameState: {
                    ...testGameState,
                    selfPlayerState: {
                        ...testGameState.selfPlayerState,
                        movementCardsInHand: testGameState.selfPlayerState.movementCardsInHand.toSpliced(0),
                    },
                    temporalMovements: [
                        {
                            movement: "straight-adjacent",
                            position: [0, 0],
                            rotation: "r0",
                        },
                    ],
                },
                expectedMessages: [
                    {
                        type: "cancel-movement",
                    },
                ],
            });
        });

        test("revert movement not visible when there are no movements to revert", async () => {
            await genericGameTest({
                setup: () => {
                    const revertMovementButton = screen.queryByTestId("btn-revert-movement");

                    expect(revertMovementButton).toBeNull();
                },
                expectedMessages: [],
            });
        });
    });
});