"use client";
import CAreaChart from "@/app/components/ui/Charts/AreaChart";
import CBarChart from "@/app/components/ui/Charts/BarChart";
import CHorizontalBarChart from "@/app/components/ui/Charts/HorizontalBarChart";
import CMultipleBarChart from "@/app/components/ui/Charts/MultipleBarChart";
import CStackedAreaChart from "@/app/components/ui/Charts/StakedAreaChart";
import { useTheme } from "next-themes";
import Image from "next/image";
import React, { useEffect, useState } from "react";

const ACdata = [
    {
        name: "January",
        value: 4000,
        second_value: 2400,
        third_value: 2400,
    },
    {
        name: "February",
        value: 3000,
        second_value: 1398,
        third_value: 2210,
    },
    {
        name: "March",
        value: 2000,
        second_value: 9800,
        third_value: 2290,
    },
    {
        name: "April",
        value: 2780,
        second_value: 3908,
        third_value: 2000,
    },
    {
        name: "May",
        value: 1890,
        second_value: 4800,
        third_value: 2181,
    },
    {
        name: "June",
        value: 2390,
        second_value: 3800,
        third_value: 2500,
    },
    {
        name: "July",
        value: 3490,
        second_value: 4300,
        third_value: 2100,
    },
];

export default function Charts() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return null;

	return (
		<div className="flex flex-col frame w-screen gap-y-5">
			<div className="flex flex-col justify-center items-center mb-12">
				<Image
					src={"/finura/FINURA_BANNER.png"}
					width={1000}
					height={280}
					alt="Finura Banner"
					className="w-64"
				/>
				<h2>Finura Developer Playground</h2>
			</div>
			<button
				onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
				Current theme: {theme === "dark" ? "☀️" : "🌙"}
			</button>
			<div className="w-[500px] h-[300px]">
				<h1>Area Chart</h1>
				<CAreaChart
					data={ACdata}
					colorTheme={"#2020ff"}
					areaStroke={"#5050ff"}
					valueName="Money"
					showYAxis
                    endStopOpacity={0.6}
				/>
				<h1>Stacked Area Chart</h1>
				<CStackedAreaChart
					data={ACdata}
					showYAxis
					areas={[
						{
							dataKey: "value",
							fill: "#8884d8",
							stroke: "#5050ff",
							label: "Revenue",
						},
						{
							dataKey: "second_value",
							fill: "#82ca9d",
							stroke: "#2da44e",
							label: "Profit",
						},
						{
							dataKey: "third_value",
							fill: "#ffc658",
							stroke: "#d97706",
							label: "Cost",
						},
					]}
					colorTheme="#2020ff"
                    endStopOpacity={0.6}
				/>
				<h1>Bar Chart</h1>
				<CBarChart
					data={ACdata}
					colorTheme={"#ff20ee"}
					areaStroke={"#ff10ee"}
					valueName="Money"
					showYAxis
                    endStopOpacity={0.6}
				/>
				<h1>Multiple Bar Chart</h1>
				<CMultipleBarChart
					data={ACdata}
					showYAxis
					bars={[
						{
							dataKey: "value",
							fill: "#8884d8",
							stroke: "#5050ff",
							label: "Revenue",
						},
						{
							dataKey: "second_value",
							fill: "#ff10ee",
							stroke: "#ff10ee",
							label: "Profit",
						},
					]}
					colorTheme="#2020ff"
                    endStopOpacity={0.6}
				/>
                <h1>Horizontal Bar Chart</h1>
				<CHorizontalBarChart
					data={ACdata}
					colorTheme={"#ff20ee"}
					areaStroke={"#ff10ee"}
					valueName="Money"
                    
                    endStopOpacity={0.6}
				/>
			</div>
		</div>
	);
}
