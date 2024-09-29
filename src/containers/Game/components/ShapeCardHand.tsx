import { Rotation } from "../../../domain/Rotation";
import { Shape } from "../../../domain/Shape";
import ShapeCard from "./ShapeCard";

type ShapeCardHandProps = {
    shapes: [Shape, Shape, Shape];
    rotation: Rotation;
}

function flexDirectionFromRotation(rotation: Rotation): string {
    switch (rotation) {
        case "r0": return "flex-row";
        case "r90": return "flex-col-reverse";
        case "r180": return "flex-row-reverse";
        case "r270": return "flex-col";
    }
}

function ShapeCardHand({ shapes, rotation }: ShapeCardHandProps) {
    const sharedClassNames = "relative overflow-hidden rounded-lg top-[0em] " +
        "shadow-sm shadow-black transition-movement-card z-0";

    const nonBlockedClassNames = " group-hover:top-[-0.5em] group-hover:shadow-md group-hover:shadow-black group-hover:z-10";

    return (
        <div className={`flex ${flexDirectionFromRotation(rotation)} gap-[1em]`}>
            <div className="group">
                <div className={sharedClassNames + " " + nonBlockedClassNames}>
                    <ShapeCard shape={shapes[0]} isBlocked={false} />
                </div>
            </div>
            <div className="group">
                <div className={sharedClassNames + " " + nonBlockedClassNames}>
                    <ShapeCard shape={shapes[1]} isBlocked={false} />
                </div>
            </div>
            <div className="group">
                <div className={sharedClassNames}>
                    <ShapeCard shape={shapes[2]} isBlocked={true} />
                </div>
            </div>
        </div>
    );
}

export default ShapeCardHand;