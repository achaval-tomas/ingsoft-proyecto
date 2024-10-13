type ShapeCardDeckProps = {
    count: number;
}

function ShapeCardDeck({ count }: ShapeCardDeckProps) {
    const cards: React.ReactNode[] = [];

    for (let i = 0; i < Math.min(count, 5); i++) {
        cards.push(
            <img
                src="/src/assets/shapes/backside.svg"
                className={`w-full h-full rounded-[7.5%] shadow-sm shadow-black ${(i === 0) ? "relative" : "absolute"}`}
                style={{
                    zIndex: i,
                    bottom: `${2 * i}px`,
                    left: `${2 * i}px`,
                }}
            />,
        );
    }

    return (
        <div className="relative">
            {cards}
        </div>
    );
}

export default ShapeCardDeck;