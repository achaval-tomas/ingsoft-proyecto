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
        }, 500);

        return () => clearInterval(interval);
    }, [turnStart]);

    const elapsedMillis = (new Date()).getTime() - turnStartDate.getTime();
    const remainingMillis = Math.max((120 * 1000) - elapsedMillis, 0);
    const remainingSeconds = Math.ceil(remainingMillis / 1000);

    const remainingMinutes = Math.floor(remainingSeconds / 60);
    const remainingMinuteSeconds = remainingSeconds % 60;

    return (
        <div className={`${className}`}>
            {remainingMinutes}:{remainingMinuteSeconds}
        </div>
    );
}

export default TurnTimer;