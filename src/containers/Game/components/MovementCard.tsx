import { Movement } from "../../../domain/Movement";

type MovementCardProps = {
    movement: Movement;
}

function MovementCard({ movement }: MovementCardProps) {
    const imageSrc = `/src/assets/movements/${movement}.svg`;

    return <img src={imageSrc} className="h-full" />;
}

export default MovementCard;