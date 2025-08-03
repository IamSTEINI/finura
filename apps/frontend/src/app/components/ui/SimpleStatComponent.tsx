import React from "react";
import CurrencyFormatter, { formatCurrency } from "../utils/currencyFormatter";
import CountUp from "../utils/countUp";

interface SimpleStatProps {
	icon?: React.ReactNode;
	data: string | number;
	title: string;
	className?: string;
	formatCurrency?: boolean;
	colorTheme?: string;
	useCountUpAnimation?: boolean;
	countUpDuration?: number;
}

const CountUpWithCurrency: React.FC<{
	target: number;
	duration: number;
	decimals: number;
}> = ({ target, duration, decimals }) => {
	const [count, setCount] = React.useState(0);
	const startTimeRef = React.useRef<number | null>(null);
	const requestRef = React.useRef<number | undefined>(undefined);

	React.useEffect(() => {
		startTimeRef.current = null;

		const animate = (timestamp: number) => {
			if (startTimeRef.current === null) {
				startTimeRef.current = timestamp;
			}

			const elapsed = timestamp - startTimeRef.current;
			const progress = Math.min(elapsed / duration, 1);

			const easedProgress = progress * (2 - progress);
			setCount(easedProgress * target);

			if (progress < 1) {
				requestRef.current = requestAnimationFrame(animate);
			}
		};

		requestRef.current = requestAnimationFrame(animate);

		return () => {
			if (requestRef.current) {
				cancelAnimationFrame(requestRef.current);
			}
		};
	}, [target, duration]);

	return <>{formatCurrency(count, decimals)}</>;
};

function SimpleStat({
	icon,
	data,
	title,
	className,
	formatCurrency,
	colorTheme,
	useCountUpAnimation = false,
	countUpDuration = 2000,
}: SimpleStatProps) {
	return (
		<div
			className={`flex items-center space-x-4 card ${className}`}
			style={{
				borderColor: colorTheme ? colorTheme : "",
				paddingRight: "15px",
			}}>
			{icon && (
				<div
					className="simple-stat-icon"
					style={{
						color: colorTheme ? colorTheme : "",
					}}>
					{icon}
				</div>
			)}
			<div>
				<div
					className="text-2xl font-bold"
					style={{
						color: colorTheme ? colorTheme : "",
					}}>
					{(() => {
						const shouldAnimate = useCountUpAnimation && typeof data === "number";
						
						if (shouldAnimate && formatCurrency) {
							return (
								<CountUpWithCurrency
									target={data}
									duration={countUpDuration}
									decimals={
										data.toString().split(".")[1]?.length || 0
									}
								/>
							);
						} else if (shouldAnimate) {
							return (
								<CountUp
									target={data}
									duration={countUpDuration}
									decimals={
										data.toString().split(".")[1]?.length || 0
									}
								/>
							);
						} else if (formatCurrency) {
							return (
								<CurrencyFormatter
									value={
										typeof data === "string"
											? parseFloat(data)
											: data
									}
									decimals={
										typeof data === "string"
											? data.split(".")[1]?.length || 0
											: (data.toString().split(".")[1] || "")
													.length
									}
								/>
							);
						} else {
							return data;
						}
					})()}
				</div>
				<div className="text-sm text-gray-500">{title}</div>
			</div>
		</div>
	);
}

export default SimpleStat;
