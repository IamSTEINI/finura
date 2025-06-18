import {
	BarChart,
	Bar,
	CartesianGrid,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
} from "recharts";

interface DataPoint {
	name: string;
	[key: string]: unknown;
}

interface BarConfig {
	dataKey: string;
	fill?: string;
	stroke?: string;
	label?: string;
}

interface ChartsProps {
	data: DataPoint[];
	bars: BarConfig[];
	showYAxis?: boolean;
	colorTheme?:
		| string
		| {
				areaStroke?: string;
				areaFill?: string;
				tooltipIndicator?: string;
		  };
	startStopOpacity?: number;
	endStopOpacity?: number;
}

export default function CMultipleBarChart({
	data,
	bars,
	showYAxis = false,
	colorTheme = "#8884d8",
	startStopOpacity = 1,
	endStopOpacity = 0.1,
}: ChartsProps) {
	const defaultFill =
		typeof colorTheme === "string"
			? colorTheme
			: colorTheme?.areaFill || "#8884d8";
	const defaultStroke =
		typeof colorTheme === "string"
			? "#ffffff"
			: colorTheme?.areaStroke || "#ffffff";

	return (
		<div className="w-full h-full">
			<ResponsiveContainer width="100%" height="100%">
				<BarChart
					data={data}
					margin={{
						top: 10,
						right: 30,
						left: 10,
						bottom: 0,
					}}
					barGap={4}
					barCategoryGap="20%">
					<defs>
						{bars.map((bar) => (
							<linearGradient
								key={`gradient-${bar.dataKey}`}
								id={`colorBar-${bar.dataKey}`}
								x1="0"
								y1="0"
								x2="0"
								y2="1">
								<stop
									offset="5%"
									stopColor={bar.fill || defaultFill}
									stopOpacity={startStopOpacity}
								/>
								<stop
									offset="95%"
									stopColor={bar.fill || defaultFill}
									stopOpacity={endStopOpacity}
								/>
							</linearGradient>
						))}
					</defs>
					<CartesianGrid
						horizontal={true}
						vertical={false}
						strokeWidth={0.1}
						stroke="#e0e0e0"
					/>
					<XAxis
						dataKey="name"
						padding={{ left: 10, right: 10 }}
						tick={{ fontSize: 12 }}
						interval={0}
						tickLine={false}
						axisLine={{ strokeWidth: 0 }}
					/>
					{showYAxis && (
						<YAxis
							tickLine={false}
							tick={{ fontSize: 12 }}
							axisLine={{ strokeWidth: 0 }}
							width={40}
						/>
					)}
					<Tooltip
						cursor={false}
						content={({ active, payload, label }) => {
							if (active && payload && payload.length) {
								return (
									<div className="p-3 default-text-color h-fit gap-x-2 w-fit flex flex-row chart-tooltip-border-color border rounded-md font-xl chart-tooltip-bg">
										<div className="chart-tooltip-text">
											<p className="font-bold">{`${label}`}</p>
											{payload.map((entry, index) => {
												const bar = bars.find(
													(b) =>
														b.dataKey ===
														entry.dataKey
												);
												return (
													<div
														key={`tooltip-${index}`}
														className="flex items-center gap-2">
														<div
															className="w-2 h-2 rounded-full"
															style={{
																backgroundColor:
																	bar?.fill ||
																	defaultFill,
															}}
														/>
														<p className="text-xs">{`${
															bar?.label ||
															entry.dataKey
														}: ${entry.value}`}</p>
													</div>
												);
											})}
										</div>
									</div>
								);
							}
							return null;
						}}
					/>
					{bars.map((bar, index) => (
						<Bar
							key={`bar-${index}`}
							dataKey={bar.dataKey}
							fill={`url(#colorBar-${bar.dataKey})`}
							stroke={bar.stroke || defaultStroke}
							radius={[5, 5, 5, 5]}
							barSize={24}
						/>
					))}
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}
