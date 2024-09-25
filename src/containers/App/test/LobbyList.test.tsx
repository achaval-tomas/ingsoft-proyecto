import { render, screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import { userEvent } from "@testing-library/user-event";
import LobbyList, { LobbyElement } from "../components/LobbyList";

test("It correctly renders all elements", () => {

    const mockItems: LobbyElement[] = [
        {
            id: "1",
            name: "my first lobby",
            numPlayers: 1,
        },
        {
            id: "2",
            name: "jorge's room",
            numPlayers: 3,
        },
        {
            id: "3",
            name: "excuse me, only friends",
            numPlayers: 2,
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
        const tdName = within(rows[index+1]).queryByText(element.name);
        expect(tdName).not.toBeNull();

        const tdNumPlayers = within(rows[index+1]).queryByText(element.numPlayers);
        expect(tdNumPlayers).not.toBeNull();
    });
});

test("It correctly handles join button", async () => {
    const mockItems: LobbyElement[] = [
        {
            id: "1",
            name: "my first lobby",
            numPlayers: 1,
        },
        {
            id: "2",
            name: "jorge's room",
            numPlayers: 3,
        },
        {
            id: "3",
            name: "excuse me, only friends",
            numPlayers: 2,
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
        expect(clickedIds[e.id]).toBe(3);
    });
});
