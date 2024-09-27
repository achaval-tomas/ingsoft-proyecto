import { Movement } from "../../../domain/Movement";

type MovementCardProps = {
    movement: Movement;
}

function MovementCard({ movement }: MovementCardProps) {
    const imageSrc = `/src/assets/movements/${movement}.png`;

    return (
        <div>
            <img src={imageSrc} className="rounded"/>
        </div>
    );
}

export default MovementCard;