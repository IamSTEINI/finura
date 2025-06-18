import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

interface ProgressbarProps {
	current: number;
	goal: number;
	duration: number;
	color?: string;
	labelColor?: string;
	className?: string;
	labelinside?: boolean;
	animateProgress?: boolean;
	height?: number | string;
}

const Progressbar: React.FC<ProgressbarProps> = ({
	current,
	goal,
	duration,
	color = "#4CAF50",
	labelColor = "#fff",
	labelinside,
	animateProgress,
	className = "",
	height = 16,
}) => {
	const percent = Math.min(100, Math.max(0, (current / goal) * 100));
	const borderRadius =
		typeof height === "number" ? `${height / 2}px` : "9999px";

	const count = useMotionValue(0);
	const roundedCount = useTransform(count, Math.round);
	const [labelValue, setLabelValue] = useState(current);

	useEffect(() => {
		let controls: ReturnType<typeof animate> | null = null;

		if (animateProgress) {
			count.set(0);
			controls = animate(count, current, { duration });
		} else {
			count.set(current);
			setLabelValue(current);
		}

		const unsubscribe = roundedCount.on("change", (v) => {
			setLabelValue(Math.round(v));
		});

		return () => {
			unsubscribe();
			controls?.stop();
		};
	}, [current, animateProgress, duration]);

	return (
		<div
			className={`w-full relative ${className}`}
			style={{
				height,
				borderRadius,
				backgroundColor: "var(--progressbar-background-color, #d1c2d1)",
			}}>
			<motion.div
				initial={{ width: 0 }}
				animate={{ width: `${percent}%` }}
				transition={{ duration: 0.8 }}
				className="transition-all -translate-x-px"
				style={{
					background: color,
					height: "100%",
					borderRadius,
				}}
			/>
			{labelinside && (
				<div
					className="absolute inset-0 flex items-center justify-center text-xs font-semibold"
					style={{ color: labelColor }}>
					{labelValue} / {goal}
				</div>
			)}
		</div>
	);
};

export default Progressbar;
