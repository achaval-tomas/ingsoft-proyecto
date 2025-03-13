import { expect, test } from "vitest";
import { boardIndexToPosition, positionToBoardIndex } from "./Position";

test("positionToBoardIndex() and boardIndexToPosition() work correctly", () => {
    let i = 0;

    for (let y = 0; y < 6; y++) {
        for (let x = 0; x < 6; x++) {
            const computedIndex = positionToBoardIndex([x, y]);
            expect(computedIndex).toEqual(i);

            const computedPosition = boardIndexToPosition(computedIndex);
            expect(computedPosition).toEqual([x, y]);

            i += 1;
        }
    }
});