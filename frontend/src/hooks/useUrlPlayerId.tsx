import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

function useUrlPlayerId(): string | null {
    const [urlParams] = useSearchParams();
    const playerId = useMemo(() => urlParams.get("player"), [urlParams]);

    return playerId;
}

export default useUrlPlayerId;