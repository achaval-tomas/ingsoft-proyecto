import { Movement } from "../../../domain/Movement";

type MovementCardProps = {
    movement: Movement;
}

function MovementCard({ movement }: MovementCardProps) {
    const imageSrc = `/src/assets/movements/${movement}.jpg`;

    return (
        <div>
            <img src={imageSrc} className="rounded w-[8em] h-[12em]"/>
        </div>
    );
}

export default MovementCard;