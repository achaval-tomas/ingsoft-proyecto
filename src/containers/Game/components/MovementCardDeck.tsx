function MovementCardDeck() {
    return (
        <div className="relative">
            <img
                src="/src/assets/movements/backside.jpg"
                className="relative w-[8em] h-[12em] shadow-sm shadow-black z-30"
            />
            <img
                src="/src/assets/movements/backside.jpg"
                className="absolute top-[2px] right-[2px] w-[8em] h-[12em] shadow-sm shadow-black z-20"
            />
            <img
                src="/src/assets/movements/backside.jpg"
                className="absolute top-[4px] right-[4px] w-[8em] h-[12em] shadow-sm shadow-black z-10"
            />
            <img
                src="/src/assets/movements/backside.jpg"
                className="absolute top-[6px] right-[6px] w-[8em] h-[12em] shadow-md shadow-black z-0"
            />
        </div>
    );
}

export default MovementCardDeck;