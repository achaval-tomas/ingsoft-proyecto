import { Rotation } from "../../../domain/Rotation";
import { ShapeCardStatus, ShapeCardUiState } from "../GameUiState";
import ShapeCard from "./ShapeCard";

type ShapeCardHandProps = {
    playerName: string;
    shapeCards: ShapeCardUiState[];
    rotation: Rotation;
    className: string;
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

function ShapeCardHand({ playerName, shapeCards, rotation, className }: ShapeCardHandProps) {
    const sharedClassNames = "relative overflow-hidden rounded-[7.5%] bottom-[0%]"
        + " shadow-sm shadow-black transition-movement-card z-0";

    const individualClassNamesFor = (status: ShapeCardStatus) => {
        switch (status) {
            case "blocked":
                return "";
            case "selected":
                return "";
            case "normal":
                return "group-hover:bottom-[10%] group-hover:shadow-md group-hover:shadow-black group-hover:z-10";
        }

    };

    return (
        <div className={`${className} flex ${flexOrthogonalDirectionFromRotation(rotation)} items-center`}>
            <div className={`w-full h-full justify-center flex ${flexDirectionFromRotation(rotation)} gap-[3%]`}>
                {shapeCards.map(({ shape, status }, i) => (
                    <div key={i} className="group max-h-full aspect-square">
                        <div className={`${sharedClassNames} ${individualClassNamesFor(status)}`}>
                            <ShapeCard shape={shape} isBlocked={status === "blocked"} />
                        </div>
                    </div>
                ))}
            </div>
            <div className={`${writingModeFromRotation(rotation)}`}>{playerName}</div>
        </div>
    );
}

export default ShapeCardHand;