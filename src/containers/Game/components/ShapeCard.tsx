import { Shape } from "../../../domain/Shape";

type ShapeCardProps = {
    shape: Shape;
    isBlocked: boolean;
}

function ShapeCard({ shape, isBlocked }: ShapeCardProps) {
    const imageSrc = `/src/assets/shapes/${isBlocked ? "backside" : shape}.svg`;

    return <img src={imageSrc} className="w-[6em] h-[6em]" />;
}

export default ShapeCard;