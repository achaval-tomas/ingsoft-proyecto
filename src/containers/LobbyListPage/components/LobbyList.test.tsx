import { render, screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import { userEvent } from "@testing-library/user-event";
import LobbyList from "../components/LobbyList";
import { LobbyElement } from "../../../services/lobbyService";

test("It correctly renders all elements", () => {

    const mockItems: LobbyElement[] = [
        {
            lobby_id: "1",
            lobby_name: "my first lobby",
            player_amount: 1,
            min_players: 2,
            max_players: 4,
            lobby_owner: "",
            players: "",
        },
        {
            lobby_id: "2",
            lobby_name: "jorge's room",
            player_amount: 3,
            min_players: 2,
            max_players: 4,
            lobby_owner: "",
            players: "",
        },
        {
            lobby_id: "3",
            lobby_name: "excuse me, only friends",
            player_amount: 2,
            min_players: 2,
            max_players: 4,
            lobby_owner: "",
            players: "",
        },
    ];

    render(
        <LobbyList
            lobbyList={mockItems}
            joinHandler={() => {}}
        />,
    );

    const rows = screen.getAllByRole("row");

    // + 1 to count the header row
    expect(rows).toHaveLength(mockItems.length + 1);

    mockItems.forEach((element, index) => {
        const tdName = within(rows[index + 1]).queryByText(element.lobby_name);
        expect(tdName).not.toBeNull();

        const tdNumPlayers = within(rows[index + 1]).queryByText(element.player_amount);
        expect(tdNumPlayers).not.toBeNull();
    });
});

test("It correctly handles join button", async () => {
    const mockItems: LobbyElement[] = [
        {
            lobby_id: "1",
            lobby_name: "my first lobby",
            player_amount: 1,
            min_players: 2,
            max_players: 4,
            lobby_owner: "",
            players: "",
        },
        {
            lobby_id: "2",
            lobby_name: "jorge's room",
            player_amount: 3,
            min_players: 2,
            max_players: 4,
            lobby_owner: "",
            players: "",
        },
        {
            lobby_id: "3",
            lobby_name: "excuse me, only friends",
            player_amount: 2,
            min_players: 2,
            max_players: 4,
            lobby_owner: "",
            players: "",
        },
    ];

    const clickedIds: { [key: string]: number } = {
    };

    render(
        <LobbyList
            lobbyList={mockItems}
            joinHandler={id => {
                if (clickedIds[id]) {
                    clickedIds[id] += 1;
                } else {
                    clickedIds[id] = 1;
                }
            }}
        />,
    );

    const buttons = screen.getAllByText("Unirse");

    for (let i = 0; i < buttons.length; i++) {
        await userEvent.click(buttons[i]);
        await userEvent.click(buttons[i]);
        await userEvent.click(buttons[i]);
    }

    mockItems.forEach(e => {
        expect(clickedIds[e.lobby_id]).toBe(3);
    });
});
