import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface CalendarProps {
	showToday?: boolean;
	showWeekdays?: boolean;
	showNavigation?: boolean;
	onDateSelect?: (date: Date) => void;
	selectedDate?: Date | null;
	className?: string;
	allowSelection?: boolean;
}

const Calendar = ({
	showToday = true,
	showWeekdays = true,
	showNavigation = true,
	onDateSelect,
	selectedDate = null,
	className = "",
	allowSelection = true,
}: CalendarProps) => {
	const [currentDate, setCurrentDate] = useState<Date>(new Date());
	const [internalSelectedDate, setInternalSelectedDate] =
		useState<Date | null>(selectedDate);
	const [monthDirection, setMonthDirection] = useState<"left" | "right">("right");
	const today = new Date();

	useEffect(() => {
		setInternalSelectedDate(selectedDate);
	}, [selectedDate]);

	const monthNames = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];

	const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

	const getDaysInMonth = (date: Date): number => {
		return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
	};

	const getFirstDayOfMonth = (date: Date): number => {
		return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
	};

	const getPreviousMonthDays = (date: Date): number => {
		const prevMonth = new Date(date.getFullYear(), date.getMonth() - 1, 0);
		return prevMonth.getDate();
	};

	const navigateMonth = (direction: number): void => {
		setMonthDirection(direction > 0 ? "right" : "left");
		setCurrentDate((prev) => {
			const newDate = new Date(prev);
			newDate.setMonth(prev.getMonth() + direction);
			return newDate;
		});
	};

	const isToday = (day: number, month: number, year: number): boolean => {
		return (
			showToday &&
			day === today.getDate() &&
			month === today.getMonth() &&
			year === today.getFullYear()
		);
	};

	const isSelected = (day: number, month: number, year: number): boolean => {
		if (!internalSelectedDate) return false;
		return (
			day === internalSelectedDate.getDate() &&
			month === internalSelectedDate.getMonth() &&
			year === internalSelectedDate.getFullYear()
		);
	};

	const handleDateClick = (
		day: number,
		month: number,
		year: number
	): void => {
		if (!allowSelection) return;

		const clickedDate = new Date(year, month, day);
		setInternalSelectedDate(clickedDate);

		if (onDateSelect) {
			onDateSelect(clickedDate);
		}
	};

	const renderCalendarDays = () => {
		const daysInMonth = getDaysInMonth(currentDate);
		const firstDay = getFirstDayOfMonth(currentDate);
		const prevMonthDays = getPreviousMonthDays(currentDate);
		const days = [];

		for (let i = firstDay - 1; i >= 0; i--) {
			const day = prevMonthDays - i;
			const prevMonth = currentDate.getMonth() - 1;
			const prevYear =
				prevMonth < 0
					? currentDate.getFullYear() - 1
					: currentDate.getFullYear();
			const adjustedMonth = prevMonth < 0 ? 11 : prevMonth;

			const isCurrentSelected = isSelected(day, adjustedMonth, prevYear);

			days.push(
				<button
					key={`prev-${day}`}
					onClick={() =>
						handleDateClick(day, adjustedMonth, prevYear)
					}
					disabled={!allowSelection}
					className={`calendar-day calendar-day--other-month ${
						isCurrentSelected ? "calendar-day--selected" : ""
					}`}>
					{day}
				</button>
			);
		}

		for (let day = 1; day <= daysInMonth; day++) {
			const isCurrentToday = isToday(
				day,
				currentDate.getMonth(),
				currentDate.getFullYear()
			);
			const isCurrentSelected = isSelected(
				day,
				currentDate.getMonth(),
				currentDate.getFullYear()
			);

			days.push(
				<button
					key={day}
					onClick={() =>
						handleDateClick(
							day,
							currentDate.getMonth(),
							currentDate.getFullYear()
						)
					}
					disabled={!allowSelection}
					className={`calendar-day ${
						isCurrentToday ? "calendar-day--today" : ""
					} ${isCurrentSelected ? "calendar-day--selected" : ""}`}>
					{day}
				</button>
			);
		}

		const remainingCells = 42 - days.length;
		for (let day = 1; day <= remainingCells; day++) {
			const nextMonth = currentDate.getMonth() + 1;
			const nextYear =
				nextMonth > 11
					? currentDate.getFullYear() + 1
					: currentDate.getFullYear();
			const adjustedMonth = nextMonth > 11 ? 0 : nextMonth;

			const isCurrentSelected = isSelected(day, adjustedMonth, nextYear);

			days.push(
				<button
					key={`next-${day}`}
					onClick={() =>
						handleDateClick(day, adjustedMonth, nextYear)
					}
					disabled={!allowSelection}
					className={`calendar-day calendar-day--other-month ${
						isCurrentSelected ? "calendar-day--selected" : ""
					}`}>
					{day}
				</button>
			);
		}

		return days;
	};

	return (
		<div className={`calendar ${className}`}>
			{showNavigation && (
				<div className="calendar-header">
					<button
						onClick={() => navigateMonth(-1)}
						className="calendar-nav">
						<ChevronLeft size={20} />
					</button>

					<h2 className="calendar-title">
						{monthNames[currentDate.getMonth()]}{" "}
						{currentDate.getFullYear()}
					</h2>
					<button
						onClick={() => navigateMonth(1)}
						className="calendar-nav">
						<ChevronRight size={20} />
					</button>
				</div>
			)}

			{showWeekdays && (
				<div className="calendar-weekdays">
					{weekdays.map((day) => (
						<div key={day} className="calendar-weekday">
							{day}
						</div>
					))}
				</div>
			)}

			<AnimatePresence mode="wait" initial={false}>
				<motion.div
					key={currentDate.getMonth() + "-" + currentDate.getFullYear()}
					initial={{
						x: monthDirection === "right" ? 40 : -40,
						opacity: 0,
					}}
					animate={{ x: 0, opacity: 1 }}
					exit={{
						x: monthDirection === "right" ? -40 : 40,
						opacity: 0,
					}}
					transition={{
						duration: 0.1,
						type: "spring",
						bounce: 0.2,
					}}
					className="calendar-grid"
				>
					{renderCalendarDays()}
				</motion.div>
			</AnimatePresence>
		</div>
	);
};

export default Calendar;
