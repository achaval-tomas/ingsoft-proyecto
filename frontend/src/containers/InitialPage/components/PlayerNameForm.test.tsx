import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { userEvent } from "@testing-library/user-event";
import PlayerNameForm from "../components/PlayerNameForm";

test("It passes the name on submit", async () => {
    let name = "";

    render(
        <PlayerNameForm
            onSubmit={n => { name = n; }}
            submitError={null}
        />,
    );

    const button = screen.getByTestId("button-play");
    const input = screen.getByTestId("input-player-name");

    await userEvent.type(input, "Tomás");
    await userEvent.click(button);

    expect(name).toEqual("Tomás");
});

test("It only enables submit when name isn't empty", async () => {
    const onSubmit = vi.fn();

    render(
        <PlayerNameForm
            onSubmit={onSubmit}
            submitError={null}
        />,
    );

    const button = screen.getByTestId("button-play");
    const input = screen.getByTestId("input-player-name");

    await userEvent.click(button);

    expect(onSubmit).not.toHaveBeenCalled();

    await userEvent.type(input, "Tomás");
    await userEvent.click(button);

    expect(onSubmit).toHaveBeenCalledOnce();
});
