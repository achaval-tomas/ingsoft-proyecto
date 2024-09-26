import { render, screen } from "@testing-library/react";
import { expect, test, vitest } from "vitest";
import { userEvent } from "@testing-library/user-event";
import CreateLobbyDialog, { CreateLobbyFormState } from "./CreateLobbyDialog";

test("correct state is returned", async () => {
    const formInputs = {
        name: "Hello World",
        maxPlayers: 3,
        password: "1234",
    };

    const onCancel = vitest.fn();
    const onSubmit = vitest.fn((formState: CreateLobbyFormState) => {
        expect(formState).toStrictEqual(formInputs);
    });

    render(
        <CreateLobbyDialog
            isOpen={true}
            lobbyNamePlaceholder="this should not have any side-effects"
            onCancel={onCancel}
            onSubmit={onSubmit}
        />,
    );

    await userEvent.type(screen.getByTestId("lobby-name"), formInputs.name);
    await userEvent.clear(screen.getByTestId("lobby-max-players"));
    await userEvent.type(screen.getByTestId("lobby-max-players"), formInputs.maxPlayers.toString());
    await userEvent.type(screen.getByTestId("lobby-password"), formInputs.password);

    await userEvent.click(screen.getByTestId("lobby-btn-create"));

    expect(onCancel).not.toHaveBeenCalled();
    expect(onSubmit).toHaveBeenCalledOnce();
});
