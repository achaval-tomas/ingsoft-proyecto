import { screen, render } from "@testing-library/react";
import { z } from "zod";
import { beforeEach, expect, test, vi } from "vitest";
import { Client, Server } from "mock-socket";
import Lobby from "./Lobby";
import userEvent from "@testing-library/user-event";
import * as apiFunctions from "../../api/lobby";
import { leaveLobby } from "../../api/lobby";

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

const sendLobbyState = (socket: Client) => {
    socket.send(JSON.stringify({
        type: "lobby-state",
        players: PLAYER_LIST,
        owner: PLAYER_ID,
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
    vi.mock("react-router-dom", async () => {
        const mod = await vi.importActual("react-router-dom");

        return {
            ...mod,
            useNavigate: () => { },
            useSearchParams: () => [
                { get: () => PLAYER_ID },
            ],
        };
    });

    const wsServer = new Server(`ws://127.0.0.1:8000/lobby/${PLAYER_ID}`);

    wsServer.on("connection", socket => {
        socket.on("message", message => {
            try {
                const m = ClientMessageSchema.parse(JSON.parse(message as string));
                switch (m.type) {
                    case "get-lobby-state":
                        sendLobbyState(socket);
                        break;
                }
            } catch {
                console.log("invalid client websocket message");
            }
        });
    });

    vi.mock("../../api/lobby.tsx", async (original) => {
        return {
            ...await original(),
            leaveLobby: () => "mocked",
        };
    });

    return () => {
        vi.restoreAllMocks();
        wsServer.close();
    };
});

test("It gets lobby state and renders lobby players", async () => {
    render(
        <Lobby />,
    );

    for (let i = 0; i < PLAYER_LIST.length; i++) {
        const playerName = PLAYER_LIST[i].name;

        expect(await screen.findByText(playerName, { exact: false })).not.toBeNull();
    }
});

test("It calls leaveLobby function when clicking button to leave lobby", async () => {
    vi.spyOn(apiFunctions, "leaveLobby");

    render(
        <Lobby />,
    );

    expect(leaveLobby).toHaveBeenCalledTimes(0);

    const button = screen.getByText("Salir");

    await userEvent.click(button);

    expect(leaveLobby).toHaveBeenCalledTimes(1);
});

test("It renders button to start game if player is owner", async () => {
    render(
        <Lobby />,
    );

    expect(await screen.findByText("Iniciar juego")).toBeVisible();
});
