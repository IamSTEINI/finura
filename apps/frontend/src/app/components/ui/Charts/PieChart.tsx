import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import React, { useState } from "react";

interface DataPoint {
	name: string;
	value: number;
	[key: string]: unknown;
}

interface ChartsProps {
	data: DataPoint[];
	colors?: string[];
	showTooltip?: boolean;
	endAngle?: number;
}

const defaultColors = ["#ff20ee"];

export default function CPieChart({
	data,
	colors = defaultColors,
	showTooltip = true,
	endAngle = 360,
}: ChartsProps) {
	const [activeIndex, setActiveIndex] = useState<number | null>(null);

	const getGradientId = (idx: number) => `pie-gradient-${idx}`;

	return (
		<div className="w-full h-full">
			<ResponsiveContainer width="100%" height="100%">
				<PieChart>
					<defs>
						{data.map((_, idx) => (
							<linearGradient
								key={getGradientId(idx)}
								id={getGradientId(idx)}
								x1="0"
								y1="0"
								x2="1"
								y2="1">
								<stop
									offset="5%"
									stopColor={colors[idx % colors.length]}
									stopOpacity={1}
								/>
								<stop
									offset="95%"
									stopColor={colors[idx % colors.length]}
									stopOpacity={0.1}
								/>
							</linearGradient>
						))}
					</defs>
					<Pie
						data={data}
						cx="50%"
						cy="50%"
						startAngle={0}
						endAngle={endAngle}
						innerRadius={60}
						outerRadius={80}
						paddingAngle={5}
						cornerRadius={4}
						dataKey="value"
						isAnimationActive={false}
						onMouseEnter={(_, idx) => setActiveIndex(idx)}
						onMouseLeave={() => setActiveIndex(null)}>
						{data.map((entry, idx) => (
							<Cell
								key={`cell-${idx}`}
								fill={
									activeIndex === idx
										? colors[idx % colors.length]
										: `url(#${getGradientId(idx)})`
								}
								stroke={
									activeIndex === idx
										? colors[idx % colors.length]
										: undefined
								}
								strokeWidth={activeIndex === idx ? 2 : 1}
								cursor="pointer"
							/>
						))}
					</Pie>
					{showTooltip && (
						<Tooltip
							content={({ active, payload }) => {
								if (active && payload && payload.length) {
									const entry = payload[0].payload;
									const idx = data.findIndex(
										(d) => d.name === entry.name
									);
									const color =
										activeIndex === idx &&
										activeIndex !== null
											? colors[idx % colors.length]
											: colors[idx % colors.length];

									return (
										<div className="p-3 flex items-center justify-center flex-row default-text-color h-fit w-fit flex flex-row space-x-3 chart-tooltip-border-color border rounded-md font-xl chart-tooltip-bg">
											<div
												className="w-1 rounded-full self-stretch mt-1"
												style={{
													background: color,
												}}></div>
											<div className="chart-tooltip-text">
												<p className="font-bold">
													{payload[0].name}
												</p>
												<p className="text-xs">{`Value: ${payload[0].value}`}</p>
											</div>
										</div>
									);
								}
								return null;
							}}
						/>
					)}
				</PieChart>
			</ResponsiveContainer>
		</div>
	);
}
