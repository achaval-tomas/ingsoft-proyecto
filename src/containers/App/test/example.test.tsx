import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { userEvent } from "@testing-library/user-event";
import App from "../App";

test("Counter increases when clicked", async () => {
    render(
        <App />,
    );

    const button: HTMLButtonElement = screen.getByText("count is ", { exact: false });

    expect(button).toHaveTextContent("count is 0");

    await userEvent.click(button);

    await expect.poll(() => button).toHaveTextContent("count is 1");
});
