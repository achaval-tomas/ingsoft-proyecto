import { render, screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import { userEvent } from "@testing-library/user-event";
import LobbyList, { LobbyElement } from "../components/LobbyList";

test("It correctly renders all elements", async () => {

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
