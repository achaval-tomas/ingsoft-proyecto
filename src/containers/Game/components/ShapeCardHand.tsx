import { ShapeCardState } from "../../../domain/GameState";
import { Rotation } from "../../../domain/Rotation";
import ShapeCard from "./ShapeCard";

type ShapeCardHandProps = {
    shapeCards: ShapeCardState[];
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
            {shapeCards.map(({ shape, isBlocked }, i) => (
                <div key={i} className="group max-h-full aspect-square">
                    <div className={sharedClassNames + (isBlocked ? "" : ` ${nonBlockedClassNames}`)}>
                        <ShapeCard shape={shape} isBlocked={isBlocked} />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default ShapeCardHand;