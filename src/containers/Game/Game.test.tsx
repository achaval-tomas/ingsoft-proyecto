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
            gameState = testGameState,
        }: {
            targetTilePosition: Position;
            targetShapeCardPlayerId: string;
            targetShapeCardIndex: number;
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
                        gameState={gameState}
                        sendMessage={sendMessage}
                    />,
                </Provider>,
            );

            const targetTile = screen.getByTestId(`tile-${targetTilePosition[0]}-${targetTilePosition[1]}`);
            const targetShapeCard = screen.getByTestId(`shape-card-${targetShapeCardPlayerId}-${targetShapeCardIndex}`);

            expect(targetTile).toBeVisible();
            expect(targetShapeCard).toBeVisible();

            await userEvent.click(targetShapeCard);
            await userEvent.click(targetTile);

            expect(sendMessage).toHaveBeenCalledTimes(expectedMessages.length);
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
});