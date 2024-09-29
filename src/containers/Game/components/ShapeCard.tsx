import { Shape } from "../../../domain/Shape";

type ShapeCardProps = {
    shape: Shape;
}

function ShapeCard({ shape }: ShapeCardProps) {
    const imageSrc = `/src/assets/shapes/${shape}.svg`;

    return <img src={imageSrc} className="rounded w-[6em] h-[6em]" />;
}

export default ShapeCard;