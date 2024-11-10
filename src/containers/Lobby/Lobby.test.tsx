import { screen, render } from "@testing-library/react";
import { z } from "zod";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { Client, Server } from "mock-socket";
import Lobby from "./Lobby";
import userEvent from "@testing-library/user-event";
import { wsServerUrl } from "../../services/config";
import lobbyService from "../../services/lobbyService";
import * as reactRouter from "react-router-dom";

const PLAYER_ID = "1234";
const PLAYER_NAME = "Pedro";
const LOBBY_ID = "666";
const LOBBY_NAME = "Test lobby";
const PLAYER_LIST = [
    { id: PLAYER_ID, name: PLAYER_NAME },
    { id: "1", name: "Juana" },
    { id: "2", name: "Ismael" },
    { id: "3", name: "Don Amancio" },
];

const sendLobbyState = (socket: Client, ownerId: string) => {
    socket.send(JSON.stringify({
        type: "lobby-state",
        players: PLAYER_LIST,
        owner: ownerId,
        id: LOBBY_ID,
        name: LOBBY_NAME,
    }));
};

const ClientMessageSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("get-lobby-state"),
    }),
]);

beforeEach(() => {
    const wsServer = new Server(`${wsServerUrl}/lobby/${LOBBY_ID}?player_id=${PLAYER_ID}`);

    wsServer.on("connection", socket => {
        socket.on("message", message => {
            try {
                const m = ClientMessageSchema.parse(JSON.parse(message as string));
                switch (m.type) {
                    case "get-lobby-state":
                        sendLobbyState(socket, PLAYER_ID);
                        break;
                }
            } catch {
                console.log("invalid client websocket message");
            }
        });
    });


    return () => {
        wsServer.close();
    };
});

describe("Lobby tests being owner", () => {
    beforeEach(() => {
        vi.mock("react-router-dom", async () => {
            const mod = await vi.importActual("react-router-dom");

            return {
                ...mod,
                useNavigate: () => { return () => {}; },
                useSearchParams: () => [
                    { get: () => PLAYER_ID },
                ],
            };
        });

        vi.mock("../../api/lobby.tsx", async (original) => {
            return {
                ...await original(),
                leaveLobby: () => {
                    return new Promise(resolve => {
                        resolve({ type: "Ok", message: "" });
                    });
                },
            };
        });

        return () => {
            vi.restoreAllMocks();
        };
    });

    test("It gets lobby state and renders lobby players", async () => {
        render(
            <reactRouter.MemoryRouter initialEntries={[`/lobby/${LOBBY_ID}?player=${PLAYER_ID}`]}>
                <reactRouter.Routes>
                    <reactRouter.Route path="/lobby/:lobbyId" element={<Lobby />} />
                </reactRouter.Routes>
            </reactRouter.MemoryRouter>,
        );

        for (let i = 0; i < PLAYER_LIST.length; i++) {
            const playerName = PLAYER_LIST[i].name;

            expect(await screen.findByText(playerName, { exact: false })).not.toBeNull();
        }
    });

    test("It calls leaveLobby function when clicking button to leave lobby", async () => {
        const navigateMock = vi.fn();
        vi.spyOn(reactRouter, "useNavigate").mockImplementation(() => navigateMock);
        vi.spyOn(lobbyService, "leaveLobby");

        render(
            <reactRouter.MemoryRouter initialEntries={[`/lobby/${LOBBY_ID}?player=${PLAYER_ID}`]}>
                <reactRouter.Routes>
                    <reactRouter.Route path="/lobby/:lobbyId" element={<Lobby />} />
                </reactRouter.Routes>
            </reactRouter.MemoryRouter>,
        );

        expect(lobbyService.leaveLobby).toHaveBeenCalledTimes(0);

        const button = screen.getByText("Salir");

        await userEvent.click(button);

        expect(lobbyService.leaveLobby).toHaveBeenCalledTimes(1);
    });

    test("It renders button to start game if player is owner", async () => {
        render(
            <reactRouter.MemoryRouter initialEntries={[`/lobby/${LOBBY_ID}?player=${PLAYER_ID}`]}>
                <reactRouter.Routes>
                    <reactRouter.Route path="/lobby/:lobbyId" element={<Lobby />} />
                </reactRouter.Routes>
            </reactRouter.MemoryRouter>,
        );

        expect(await screen.findByText("Iniciar juego")).toBeVisible();
    });
});

describe("Lobby tests not being owner", () => {
    beforeEach(() => {
        vi.mock("react-router-dom", async () => {
            const mod = await vi.importActual("react-router-dom");

            return {
                ...mod,
                useNavigate: () => { return () => {}; },
                useSearchParams: () => [
                    { get: () => PLAYER_ID },
                ],
            };
        });

        return () => {
            vi.restoreAllMocks();
        };
    });

    test("It doesn't render button to start game if player is not owner", () => {
        render(
            <reactRouter.MemoryRouter initialEntries={[`/lobby/${LOBBY_ID}?player=${PLAYER_ID}`]}>
                <reactRouter.Routes>
                    <reactRouter.Route path="/lobby/:lobbyId" element={<Lobby />} />
                </reactRouter.Routes>
            </reactRouter.MemoryRouter>,
        );

        expect(screen.queryByText("Iniciar juego")).toBeNull();
    });
});
