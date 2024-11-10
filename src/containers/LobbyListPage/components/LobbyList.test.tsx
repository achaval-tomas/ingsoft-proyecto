import { render, screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import { userEvent } from "@testing-library/user-event";
import LobbyList from "../components/LobbyList";
import { LobbyElement } from "../../../services/lobbyService";

const mockItems: LobbyElement[] = [
    {
        lobby_id: "1",
        lobby_name: "my first lobby",
        player_amount: 1,
        max_players: 4,
        joined: false,
        isPasswordProtected: false,
    },
    {
        lobby_id: "2",
        lobby_name: "jorge's room",
        player_amount: 3,
        max_players: 4,
        joined: false,
        isPasswordProtected: false,
    },
    {
        lobby_id: "3",
        lobby_name: "excuse me, only friends",
        player_amount: 2,
        max_players: 4,
        joined: false,
        isPasswordProtected: false,
    },
];

test("All lobbies are rendered", () => {
    render(
        <LobbyList
            lobbies={mockItems}
            selectedLobbyId={null}
            isFiltered={false}
            onJoinLobby={() => {}}
            onSelectLobby={() => {}}
        />,
    );

    const rows = screen.getAllByTestId("lobby-item");

    expect(rows).toHaveLength(mockItems.length);

    mockItems.forEach((element, index) => {
        within(rows[index]).getByText(element.lobby_name);
        within(rows[index]).getByText(element.player_amount, { exact: false });
    });
});

test("Can join by double clicking", async () => {
    const clickedIds: { [key: string]: number } = {};

    render(
        <LobbyList
            lobbies={mockItems}
            selectedLobbyId={null}
            isFiltered={false}
            onJoinLobby={id => {
                if (clickedIds[id]) {
                    clickedIds[id] += 1;
                } else {
                    clickedIds[id] = 1;
                }
            }}
            onSelectLobby={() => {}}
        />,
    );

    const lobbyItems = screen.getAllByTestId("lobby-item");

    for (const lobbyItem of lobbyItems) {
        await userEvent.dblClick(lobbyItem);
        await userEvent.dblClick(lobbyItem);
        await userEvent.dblClick(lobbyItem);
    }

    mockItems.forEach(e => {
        expect(clickedIds[e.lobby_id]).toBe(3);
    });
});

test("Loading label is shown while loading", () => {
    render(
        <LobbyList
            lobbies={null}
            selectedLobbyId={null}
            isFiltered={false}
            onJoinLobby={() => {}}
            onSelectLobby={() => {}}
        />,
    );

    screen.getByTestId("lobby-list-loading");
});

test("No lobbies label is shown when there are no lobbies", () => {
    render(
        <LobbyList
            lobbies={[]}
            selectedLobbyId={null}
            isFiltered={false}
            onJoinLobby={() => {}}
            onSelectLobby={() => {}}
        />,
    );

    screen.getByTestId("lobby-list-no-lobbies");
});

test("No lobbies label is shown when there are no matches", () => {
    render(
        <LobbyList
            lobbies={[]}
            selectedLobbyId={null}
            isFiltered={true}
            onJoinLobby={() => {}}
            onSelectLobby={() => {}}
        />,
    );

    screen.getByTestId("lobby-list-no-matches");
});

