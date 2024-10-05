import { screen, render } from "@testing-library/react";
import { z } from "zod";
import { beforeAll, beforeEach, expect, test, vi } from "vitest";
import { Client, Server } from "mock-socket";
import Lobby from "./Lobby";

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
        owner: "1",
        id: LOBBY_ID,
        name: LOBBY_NAME,
    }));
};

const ClientMessageSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("get-lobby-state"),
    }),
]);

beforeAll(() => {
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

    return () => {
        vi.restoreAllMocks();
    };
});

beforeEach(() => {
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


    return () => {
        wsServer.close();
    };
});

test("It gets lobby state and renders lobby info", async () => {
    render(
        <Lobby />,
    );

    for (let i = 0; i < PLAYER_LIST.length; i++) {
        const playerName = PLAYER_LIST[i].name;

        expect(await screen.findByText(playerName, { exact: false })).not.toBeNull();
    }
});
