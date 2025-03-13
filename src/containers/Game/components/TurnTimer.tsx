import { useEffect, useMemo, useState } from "react";
import { clockSyncOffsetInMillis } from "../../../domain/AppState";

const turnLengthInSeconds = 120;

type TurnTimerProps = {
    turnStart: string; // ISO 8601
}

function computeRemainingSeconds(turnStartDateInMillis: number): number {
    const nowInMillis = (new Date()).getTime();
    const elapsedMillis = (nowInMillis - clockSyncOffsetInMillis.value) - turnStartDateInMillis;
    const remainingMillis = Math.max((turnLengthInSeconds * 1000) - elapsedMillis, 0);
    const remainingSeconds = Math.ceil(remainingMillis / 1000);

    return remainingSeconds;
}

function TurnTimer({ turnStart }: TurnTimerProps) {
    const turnStartDateInMillis = useMemo(() => (new Date(turnStart)).getTime(), [turnStart]);
    const [remainingSeconds, setRemainingSeconds] = useState(computeRemainingSeconds(turnStartDateInMillis));

    useEffect(() => {
        const interval = setInterval(() => {
            setRemainingSeconds(computeRemainingSeconds(turnStartDateInMillis));
        }, 100);

        return () => clearInterval(interval);
    }, [turnStartDateInMillis]);

    const remainingMinutes = Math.floor(remainingSeconds / 60);
    const remainingMinuteSeconds = remainingSeconds % 60;

    const dynamicClassName = remainingSeconds <= 10
        ? "text-red-500 border-red-500"
        : remainingSeconds <= 30
            ? "text-yellow-500 border-yellow-500"
            : "border-border";

    return (
        <div className={`text-7xl text-center p-8 border rounded-lg tabular-nums ${dynamicClassName}`}>
            {remainingMinutes.toLocaleString(undefined, { minimumIntegerDigits: 2 })}
            :
            {remainingMinuteSeconds.toLocaleString(undefined, { minimumIntegerDigits: 2 })}
        </div>
    );
}

export default TurnTimer;