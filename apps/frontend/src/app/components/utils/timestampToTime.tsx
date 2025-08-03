import React from "react";
import { useLocale } from "@/context/LocaleContext";

export const timestampToTime = (
	timestamp: number,
	t: (key: string, vars?: Record<string, any>) => string
): string => {
	const timestampMs = timestamp < 10000000000 ? timestamp * 1000 : timestamp;

	const now = Date.now();
	const diffSeconds = Math.floor((timestampMs - now) / 1000);
	const isPast = diffSeconds < 0;
	const secondsAbs = Math.abs(diffSeconds);

	if (secondsAbs < 60) {
		return isPast ? t("time.just_now") : t("time.in_a_moment");
	}

	const minutesAbs = Math.floor(secondsAbs / 60);
	if (minutesAbs < 60) {
		return isPast
			? t("time.minutes_ago").replace("%count", minutesAbs.toString())
			: t("time.in_minutes").replace("%count", minutesAbs.toString());
	}

	const hoursAbs = Math.floor(minutesAbs / 60);
	if (hoursAbs < 24) {
		return isPast
			? t("time.hours_ago").replace("%count", hoursAbs.toString())
			: t("time.in_hours").replace("%count", hoursAbs.toString());
	}

	const daysAbs = Math.floor(hoursAbs / 24);
	if (daysAbs < 7) {
		return isPast
			? t("time.days_ago").replace("%count", daysAbs.toString())
			: t("time.in_days").replace("%count", daysAbs.toString());
	}

	const date = new Date(timestampMs);
	return date.toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
	});
};

interface TimestampToTimeProps {
	timestamp: string | number;
}

const TimestampToTime: React.FC<TimestampToTimeProps> = ({ timestamp }) => {
	const { t } = useLocale();
	const numericTimestamp =
		typeof timestamp === "string" ? parseInt(timestamp, 10) : timestamp;
	return <>{timestampToTime(numericTimestamp, t)}</>;
};

export default TimestampToTime;
