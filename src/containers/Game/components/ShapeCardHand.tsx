import { Shape } from "../../../domain/Shape";
import ShapeCard from "./ShapeCard";

type ShapeCardHandProps = {
    shapes: [Shape, Shape, Shape];
}

function ShapeCardHand({ shapes }: ShapeCardHandProps) {
    const sharedClassNames = "relative overflow-hidden rounded-lg top-[0em] group-hover:top-[-0.5em] " +
        "shadow-sm shadow-black group-hover:shadow-md group-hover:shadow-black transition-movement-card";

    return (
        <div className="flex flex-row gap-x-[0.5em]">
            <div className="group">
                <div className={sharedClassNames}>
                    <ShapeCard shape={shapes[0]} isBlocked={false} />
                </div>
            </div>
            <div className="group">
                <div className={sharedClassNames}>
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