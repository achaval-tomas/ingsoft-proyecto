import MovementCardHand from "./components/MovementCardHand";

function Game() {
    return (
        <div className="text-xs">
            <MovementCardHand
                movements={["straight-adjacent", "straight-spaced", "diagonal-spaced"]}
            />
            <MovementCardHand
                movements={["straight-adjacent", "straight-spaced", "diagonal-spaced"]}
            />
            <MovementCardHand
                movements={["straight-adjacent", "straight-spaced", "diagonal-spaced"]}
            />
        </div>
    );
}

export default Game;