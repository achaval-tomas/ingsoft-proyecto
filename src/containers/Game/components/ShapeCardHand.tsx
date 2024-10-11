import { Rotation } from "../../../domain/Rotation";
import { ShapeCardUiState } from "../GameUiState";
import ShapeCard from "./ShapeCard";

type ShapeCardHandProps = {
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

function ShapeCardHand({ shapeCards, rotation, className }: ShapeCardHandProps) {
    const sharedClassNames = "relative overflow-hidden [border-radius:7.5%] top-[0em] " +
        "shadow-sm shadow-black transition-movement-card z-0";

    const nonBlockedClassNames = " group-hover:top-[-0.5em] group-hover:shadow-md group-hover:shadow-black group-hover:z-10";

    return (
        <div className={`${className} flex ${flexDirectionFromRotation(rotation)} gap-[3%]`}>
            {shapeCards.map(({ shape, status }, i) => (
                <div key={i} className="group max-h-full aspect-square">
                    <div className={sharedClassNames + (status === "blocked") ? "" : ` ${nonBlockedClassNames}`}>
                        <ShapeCard shape={shape} isBlocked={status === "blocked"} />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default ShapeCardHand;