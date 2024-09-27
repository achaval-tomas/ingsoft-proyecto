import MovementCardHand from "./components/MovementCardHand";

function Game() {
    return (
        <MovementCardHand
            movements={["straight-adjacent", "straight-spaced", "diagonal-spaced"]}
        />
    );
}

export default Game;