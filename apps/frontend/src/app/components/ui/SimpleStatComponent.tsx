import React from "react";

interface SimpleStatProps {
	icon?: React.ReactNode;
	data: string | number;
	title: string;
	className?: string;
	colorTheme?: string;
}

function SimpleStat({
	icon,
	data,
	title,
	className,
	colorTheme,
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
					{data}
				</div>
				<div className="text-sm text-gray-500">{title}</div>
			</div>
		</div>
	);
}

export default SimpleStat;
