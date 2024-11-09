import { useEffect, useMemo, useState } from "react";

type TurnTimerProps = {
    turnStart: string; // ISO 8601
    className: string;
}

function TurnTimer({ turnStart, className }: TurnTimerProps) {
    const turnStartDate = useMemo(() => new Date(turnStart), [turnStart]);
    const [, triggerRerender] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            triggerRerender(i => i + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [turnStart]);

    const elapsedMillis = (new Date()).getTime() - turnStartDate.getTime();
    const remainingMillis = Math.max((120 * 1000) - elapsedMillis, 0);
    const remainingSeconds = Math.ceil(remainingMillis / 1000);

    const remainingMinutes = Math.floor(remainingSeconds / 60);
    const remainingMinuteSeconds = remainingSeconds % 60;

    const dynamicClassName = remainingSeconds <= 10
        ? "text-red-500 border-red-500"
        : remainingSeconds <= 30
            ? "text-yellow-500 border-yellow-500"
            : "border-border";

    return (
        <div className={`${className} text-7xl text-center p-8 border rounded-lg ${dynamicClassName}`}>
            {remainingMinutes.toLocaleString(undefined, { minimumIntegerDigits: 2 })}
            :
            {remainingMinuteSeconds.toLocaleString(undefined, { minimumIntegerDigits: 2 })}
        </div>
    );
}

export default TurnTimer;