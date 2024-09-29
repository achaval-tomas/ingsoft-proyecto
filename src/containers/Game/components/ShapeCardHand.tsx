import { Shape } from "../../../domain/Shape";
import ShapeCard from "./ShapeCard";

type ShapeCardHandProps = {
    shapes: [Shape, Shape, Shape];
}

function ShapeCardHand({ shapes }: ShapeCardHandProps) {
    const sharedClassNames = "aspect-square relative top-[0em] group-hover:top-[-0.5em] transition-[top]"
    return (
        <div className="flex flex-row px-[3.8em] pb-[1.8em] space-x-2">
            <div className="group">
                <div className={sharedClassNames}>
                    <ShapeCard shape={shapes[0]} />
                </div>
            </div>
            <div className="group">
                <div className={sharedClassNames}>
                    <ShapeCard shape={shapes[1]} />
                </div>
            </div>
            <div className="group">
                <div className={sharedClassNames}>
                    <ShapeCard shape={shapes[2]} />
                </div>
            </div>
        </div>
    );
}

export default ShapeCardHand;