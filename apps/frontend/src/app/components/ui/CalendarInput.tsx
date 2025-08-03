import React, { ChangeEvent, useRef, useState, useEffect } from "react";

interface CalendarInputProps {
	value?: string;
	onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
	border?: boolean;
	onComplete?: (date: string) => void;
	className?: string;
}

const CalendarInput: React.FC<CalendarInputProps> = ({
	value,
	onChange,
	border = true,
	onComplete,
	className = "",
	...props
}) => {
	const [day, setDay] = useState("");
	const [month, setMonth] = useState("");
	const [year, setYear] = useState("");

	const dayRef = useRef<HTMLInputElement>(null);
	const monthRef = useRef<HTMLInputElement>(null);
	const yearRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (value && /^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
			const [d, m, y] = value.split("/");
			setDay(d);
			setMonth(m);
			setYear(y);
		} else if (!value) {
			setDay("");
			setMonth("");
			setYear("");
		}
	}, [value]);

	const handleChange = (
		type: "day" | "month" | "year",
		e: ChangeEvent<HTMLInputElement>
	) => {
		const val = e.target.value.replace(/\D/g, "");
		let newDay = day,
			newMonth = month,
			newYear = year;

		if (type === "day") {
			newDay = val.slice(0, 2);
			setDay(newDay);
			if (val.length === 2) {
				monthRef.current?.focus();
			}
		}
		if (type === "month") {
			newMonth = val.slice(0, 2);
			setMonth(newMonth);
			if (val.length === 2) {
				yearRef.current?.focus();
			}
		}
		if (type === "year") {
			newYear = val.slice(0, 4);
			setYear(newYear);
		}

		const composed =
			newDay && newMonth && newYear
				? `${newDay}/${newMonth}/${newYear}`
				: [newDay, newMonth, newYear].filter(Boolean).join("/");

		if (onChange) {
			const syntheticEvent = {
				...e,
				target: {
					...e.target,
					value: composed,
				},
			};
			onChange(syntheticEvent as ChangeEvent<HTMLInputElement>);
		}

		if (
			newDay.length === 2 &&
			newMonth.length === 2 &&
			newYear.length === 4 &&
			onComplete
		) {
			onComplete(`${newDay}/${newMonth}/${newYear}`);
		}
	};

	return (
		<div className={`flex input-wrapper gap-2 ${className}`}>
			<input
				ref={dayRef}
				type="text"
				inputMode="numeric"
				pattern="\d{2}"
				maxLength={2}
				value={day}
				onChange={(e) => handleChange("day", e)}
				placeholder="DD"
				className={`w-12 text-center ${border ? "border" : ""}`}
				{...props}
			/>
			<span>/</span>
			<input
				ref={monthRef}
				type="text"
				inputMode="numeric"
				pattern="\d{2}"
				maxLength={2}
				value={month}
				onChange={(e) => handleChange("month", e)}
				placeholder="MM"
				className={`w-12 text-center ${border ? "border" : ""}`}
				{...props}
			/>
			<span>/</span>
			<input
				ref={yearRef}
				type="text"
				inputMode="numeric"
				pattern="\d{4}"
				maxLength={4}
				value={year}
				onChange={(e) => handleChange("year", e)}
				placeholder="YYYY"
				className={`w-16 text-center ${border ? "border" : ""}`}
				{...props}
			/>
		</div>
	);
};

export default CalendarInput;
