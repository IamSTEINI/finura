import React from "react";
import { useLocale } from "@/context/LocaleContext";

export const timestampToTime = (
	timestamp: number,
	t: (key: string, vars?: Record<string, any>) => string
): string => {
	const timestampMs = timestamp < 10000000000 ? timestamp * 1000 : timestamp;

	const now = Date.now();
	const secondsAgo = Math.floor((now - timestampMs) / 1000);

	if (secondsAgo < 60) {
		return t("time.just_now");
	}

	const minutesAgo = Math.floor(secondsAgo / 60);
	if (minutesAgo < 60) {
		return t("time.minutes_ago").replace(
			"%count",
			minutesAgo.toString()
		);
	}

	const hoursAgo = Math.floor(minutesAgo / 60);
	if (hoursAgo < 24) {
		return t("time.hours_ago").replace(
			"%count",
			hoursAgo.toString()
		);
	}

	const daysAgo = Math.floor(hoursAgo / 24);
	if (daysAgo < 7) {
		return t("time.days_ago").replace(
			"%count",
			daysAgo.toString()
		);
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
