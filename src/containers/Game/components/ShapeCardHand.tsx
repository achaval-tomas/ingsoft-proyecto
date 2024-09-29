import { Shape } from "../../../domain/Shape";
import ShapeCard from "./ShapeCard";

type ShapeCardHandProps = {
    shapes: [Shape, Shape, Shape];
}

function ShapeCardHand({ shapes }: ShapeCardHandProps) {
    const sharedClassNames = "relative overflow-hidden rounded-lg top-[0em] " +
        "shadow-sm shadow-black transition-movement-card";

    const nonBlockedClassNames = " group-hover:top-[-0.5em] group-hover:shadow-md group-hover:shadow-black";

    return (
        <div className="flex flex-row gap-x-[0.5em]">
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