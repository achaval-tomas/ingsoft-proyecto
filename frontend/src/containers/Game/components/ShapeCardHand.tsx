import { Rotation } from "../../../domain/Rotation";
import { ShapeCardStatus, ShapeCardUiState } from "../GameUiState";
import ShapeCard from "./ShapeCard";
import ShapeCardDeck from "./ShapeCardDeck";

type ShapeCardHandProps = {
    playerId: string;
    playerName: string;
    shapeCards: ShapeCardUiState[];
    shapeCardsInDeckCount: number;
    rotation: Rotation;
    className: string;
    onClickShapeCard: (i: number) => void;
}

function flexDirectionFromRotation(rotation: Rotation): string {
    switch (rotation) {
        case "r0": return "flex-row";
        case "r90": return "flex-col-reverse";
        case "r180": return "flex-row-reverse";
        case "r270": return "flex-col";
    }
}

function flexOrthogonalDirectionFromRotation(rotation: Rotation): string {
    switch (rotation) {
        case "r0": return "flex-col";
        case "r90": return "flex-row";
        case "r180": return "flex-col-reverse";
        case "r270": return "flex-row-reverse";
    }
}

function writingModeFromRotation(rotation: Rotation): string {
    switch (rotation) {
        case "r0": return "[writing-mode:horizontal-tb]";
        case "r90": return "[writing-mode:vertical-lr]";
        case "r180": return "[writing-mode:horizontal-tb]";
        case "r270": return "[writing-mode:vertical-lr] rotate-180";
    }
}

function ShapeCardHand({ playerId, playerName, shapeCards, shapeCardsInDeckCount, rotation, className, onClickShapeCard }: ShapeCardHandProps) {
    const sharedClassNames = "relative overflow-hidden rounded-[7.5%] transition-movement-card";

    const individualClassNamesFor = (status: ShapeCardStatus) => {
        const nonSelectedClassNames = "bottom-[0%] z-0 shadow-sm shadow-black";

        switch (status) {
            case "selected":
                return "bottom-[20%] z-20 shadow-[0_0_4px_4px_rgb(255,255,255),inset_0_0_4px_4px_rgb(255,255,255)]";
            case "blocked":
                return nonSelectedClassNames;
            case "normal":
                return `${nonSelectedClassNames} group-hover:bottom-[10%] group-hover:shadow-md group-hover:shadow-black group-hover:z-10`;
        }
    };

    return (
        <div className={`${className} flex ${flexOrthogonalDirectionFromRotation(rotation)} items-center`}>
            <div className={`w-full h-full justify-center flex ${flexDirectionFromRotation(rotation)} gap-[3%]`}>
                {shapeCards.map(({ shape, status }, i) => (
                    <div key={i} className="group max-h-full aspect-square">
                        <div
                            className={`${sharedClassNames} ${individualClassNamesFor(status)}`}
                            onClick={() => onClickShapeCard(i)}
                            data-testid={`shape-card-${playerId}-${i}`}
                        >
                            <ShapeCard shape={shape} isBlocked={status === "blocked"} />
                        </div>
                    </div>
                ))}
                {shapeCardsInDeckCount > 0 && <div className="max-h-full aspect-square">
                    <ShapeCardDeck count={shapeCardsInDeckCount} />
                </div>}
            </div>
            <div className={`${writingModeFromRotation(rotation)}`}>{playerName}</div>
        </div>
    );
}

export default ShapeCardHand;