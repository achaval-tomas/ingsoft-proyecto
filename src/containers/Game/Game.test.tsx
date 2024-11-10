import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
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

const testBoardTiles: Color[] = deepFreeze<Color[]>(toBoardTiles([
    "rgbyry",
    "rrrybb",
    "gyygry",
    "ygbggr",
    "yryrgr",
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
    describe("use shape card", () => {
        test("our shape card", async () => {
            vi.mock("react-router-dom", async () => {
                const mod = await vi.importActual("react-router-dom");

                return {
                    ...mod,
                    useNavigate: () => (() => {}),
                };
            });

            const sendMessage = vi.fn<(msg: GameMessageOut) => void>();

            render(
                <Provider store={createTestStore()}>
                    <Game
                        gameState={testGameState}
                        sendMessage={sendMessage}
                    />,
                </Provider>,
            );

            const playerId = testGameState.selfPlayerState.id;

            const targetTile = screen.getByTestId("tile-0-4");
            const targetShapeCard = screen.getByTestId(`shape-card-${playerId}-1`);

            expect(targetTile).toBeVisible();
            expect(targetShapeCard).toBeVisible();

            await userEvent.click(targetShapeCard);
            await userEvent.click(targetTile);

            const expectedMessage: GameMessageOut = {
                type: "use-shape-card",
                targetPlayerId: playerId,
                position: [0, 4],
            };

            expect(sendMessage).toHaveBeenCalledOnce();
            expect(sendMessage).toBeCalledWith(expectedMessage);
        });

        test("their shape card", async () => {
            vi.mock("react-router-dom", async () => {
                const mod = await vi.importActual("react-router-dom");

                return {
                    ...mod,
                    useNavigate: () => (() => {}),
                };
            });

            const sendMessage = vi.fn<(msg: GameMessageOut) => void>();

            render(
                <Provider store={createTestStore()}>
                    <Game
                        gameState={testGameState}
                        sendMessage={sendMessage}
                    />,
                </Provider>,
            );

            const targetPlayerId = testGameState.otherPlayersState[1].id;

            const targetTile = screen.getByTestId("tile-4-1");
            const targetShapeCard = screen.getByTestId(`shape-card-${targetPlayerId}-0`);

            expect(targetTile).toBeVisible();
            expect(targetShapeCard).toBeVisible();

            await userEvent.click(targetShapeCard);
            await userEvent.click(targetTile);

            const expectedMessage: GameMessageOut = {
                type: "use-shape-card",
                targetPlayerId,
                position: [4, 1],
            };

            expect(sendMessage).toBeCalledWith(expectedMessage);
            expect(sendMessage).toHaveBeenCalledOnce();
        });
    });
});