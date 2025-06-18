import {
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
} from "recharts";

interface DataPoint {
    name: string;
    value: number;
    [key: string]: unknown;
}

interface ChartsProps {
    data: DataPoint[];
    areaStroke?: string;
    valueName?: string;
    showXAxis?: boolean;
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

export default function CHorizontalBarChart({
    data,
    colorTheme = "#8884d8",
    valueName = "Val",
    showXAxis = true,
    areaStroke: propAreaStroke,
    startStopOpacity = 1,
    endStopOpacity = 0.1,
}: ChartsProps) {
    const areaFill =
        typeof colorTheme === "string"
            ? colorTheme
            : colorTheme?.areaFill || "#8884d8";
    const derivedAreaStroke =
        typeof colorTheme === "string"
            ? "#ffffff"
            : colorTheme?.areaStroke || "#ffffff";
    return (
        <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{
                        top: 10,
                        right: 30,
                        left: 40,
                        bottom: 0,
                    }}
                >
                    <defs>
                        <linearGradient
                            id="colorValBarHorizontal"
                            x1="0"
                            y1="0"
                            x2="1"
                            y2="0"
                        >
                            <stop
                                offset="5%"
                                stopColor={areaFill}
                                stopOpacity={startStopOpacity}
                            />
                            <stop
                                offset="95%"
                                stopColor={areaFill}
                                stopOpacity={endStopOpacity}
                            />
                        </linearGradient>
                    </defs>
                    <CartesianGrid
                        horizontal={true}
                        vertical={false}
                        strokeWidth={0.1}
                        stroke="#e0e0e0"
                    />
                    <YAxis
                        dataKey="name"
                        type="category"
                        tickLine={false}
                        tick={{ fontSize: 12 }}
                        axisLine={{ strokeWidth: 0 }}
                        width={80}
                    />
                    {showXAxis && (
                        <XAxis
                            type="number"
                            tickLine={false}
                            tick={{ fontSize: 12 }}
                            axisLine={{ strokeWidth: 0 }}
                        />
                    )}
                    <Tooltip
                        cursor={false}
                        content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                                return (
                                    <div className="p-3 default-text-color h-fit gap-x-2 w-fit flex flex-row chart-tooltip-border-color border rounded-md font-xl chart-tooltip-bg">
                                        <div
                                            className="w-1 rounded-full self-stretch"
                                            style={{
                                                backgroundColor: areaFill,
                                            }}
                                        ></div>
                                        <div className="chart-tooltip-text">
                                            <p className="font-bold">{`${label}`}</p>
                                            <p className="text-xs">{`${valueName}: ${payload[0].value}`}</p>
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Bar
                        type="monotone"
                        dataKey="value"
                        stroke={propAreaStroke || derivedAreaStroke}
                        radius={[5, 5, 5, 5]}
                        fill="url(#colorValBarHorizontal)"
                        barSize={24}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}