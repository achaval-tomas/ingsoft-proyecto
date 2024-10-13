type ShapeCardDeckProps = {
    count: number;
}

function ShapeCardDeck({ count }: ShapeCardDeckProps) {
    const cards: React.ReactNode[] = [];
    const displayCount = Math.min(count, 5);

    for (let i = 0; i < displayCount; i++) {
        cards.push(
            <div
                key={i}
                className={`w-full h-full ${(i === 0) ? "relative" : "absolute"} grid`}
                style={{
                    zIndex: i,
                    bottom: `${2 * i}px`,
                    left: `${2 * i}px`,
                }}
            >
                <img
                    src="/src/assets/shapes/backside.svg"
                    className={"row-start-1 col-start-1 w-full h-full rounded-[7.5%] shadow-sm shadow-black"}
                />
                {(i === displayCount - 1) && <div
                    className={"row-start-1 col-start-1 justify-self-center self-center z-[9999]"
                        + " rounded-md bg-black/70 text-xl p-[0px_6px_3px_6px] m-2"}
                >
                    {count}
                </div>}
            </div>,
        );
    }

    return (
        <div className="relative">
            {cards}
        </div>
    );
}

export default ShapeCardDeck;