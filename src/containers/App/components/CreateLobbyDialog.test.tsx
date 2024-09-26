import { render, screen } from "@testing-library/react";
import { expect, test, vitest } from "vitest";
import { userEvent } from "@testing-library/user-event";
import CreateLobbyDialog, { CreateLobbyFormState } from "./CreateLobbyDialog";

type FormInput = {
    name?: string;
    maxPlayers?: string;
    password?: string;
}

async function genericSuccessTest(input: FormInput, expectedOutput: CreateLobbyFormState) {
    const onCancel = vitest.fn();
    const onSubmit = vitest.fn((formState: CreateLobbyFormState) => {
        expect(formState).toStrictEqual(expectedOutput);
    });

    render(
        <CreateLobbyDialog
            isOpen={true}
            lobbyNamePlaceholder="this should not have any side-effects"
            onCancel={onCancel}
            onSubmit={onSubmit}
        />,
    );

    if (input.name != null) {
        await userEvent.type(screen.getByTestId("lobby-name"), input.name);
    }

    if (input.maxPlayers != null) {
        await userEvent.clear(screen.getByTestId("lobby-max-players"));
        await userEvent.type(screen.getByTestId("lobby-max-players"), input.maxPlayers);
    }

    if (input.password != null) {
        await userEvent.type(screen.getByTestId("lobby-password"), input.password);
    }

    await userEvent.click(screen.getByTestId("lobby-btn-create"));

    expect(onCancel).not.toHaveBeenCalled();
    expect(onSubmit).toHaveBeenCalledOnce();
}

test("correct state is returned", async () => {
    const input = {
        name: "Hello World",
        maxPlayers: "3",
        password: "1234",
    };

    const expectedOutput = {
        name: "Hello World",
        maxPlayers: 3,
        password: "1234",
    };

    await genericSuccessTest(input, expectedOutput);
});

test("empty name and password work fine", async () => {
    const input = {
        maxPlayers: "3",
    };

    const expectedOutput = {
        name: "",
        maxPlayers: 3,
        password: "",
    };

    await genericSuccessTest(input, expectedOutput);
});

test("maxPlayers defaults to 4", async () => {
    const input = {};

    const expectedOutput = {
        name: "",
        maxPlayers: 4,
        password: "",
    };

    await genericSuccessTest(input, expectedOutput);
});
