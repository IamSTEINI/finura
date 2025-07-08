"use client";

import Calendar from "@/app/components/ui/Calender";
import Card from "@/app/components/ui/Card";
import ChildrenInput from "@/app/components/ui/ChildrenInput";
import CodeInput from "@/app/components/ui/CodeInput";
import ColorPicker from "@/app/components/ui/ColorPicker/ColorPicker";
import DropDown from "@/app/components/ui/DropDown";
import Progressbar from "@/app/components/ui/Progressbar";
import Seperator from "@/app/components/ui/Seperator";
import SimpleStat from "@/app/components/ui/SimpleStatComponent";
import Switch from "@/app/components/ui/Switch";
import ToolTip from "@/app/components/ui/Tooltip";
import CountUp from "@/app/components/utils/countUp";
import { ArrowUpCircle, Eye, Palette } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";

const PlaygroundUI: React.FC = () => {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	const [color, setColor] = useState("#FF5252");
	const [sliderValue, setSliderValue] = useState(10);
	const [selectedValue, setSelectedValue] = useState("");
	const [selectedDay, setSelectedDay] = useState<Date>();
	const [isEnabled, setIsEnabled] = useState(false);

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
			<h1>Headers</h1>
			<div className="w-full flex flex-row flex-wrap items-center gap-2">
				<h1>HEADER H1</h1>
				<h2>HEADER H2</h2>
				<h3>HEADER H3</h3>
			</div>
			<h1>Buttons</h1>
			<div className="w-full flex flex-row flex-wrap gap-2">
				<button>Normal button</button>
				<button className="btn-border-only">Border button</button>
				<button className="btn-full-round">Round button</button>
				<button className="btn-forward">Forward button</button>
				<button className="btn-text-only">Text button</button>
				<button className="btn-back">Back button</button>
				<button className="btn-glow">Glowing</button>
				<button className="btn-shiny">Glowing</button>
			</div>
			<h1>Inputs</h1>
			<div className="flex justify-center items-center gap-x-5">
				<span className="w-56">{color || "Select color"}</span>
				<ColorPicker
					icon={<Palette size={20} />}
					onChange={(e) => {
						setColor(e);
					}}
					color={color}></ColorPicker>
			</div>
			<label htmlFor="input">Label</label>
			<input id="input" placeholder="Normal Input"></input>
			<ChildrenInput placeholder="Children Input" childPosition="left">
				<div className="cursor-pointer">
					<Eye />
				</div>
			</ChildrenInput>
			<CodeInput />
			<h1>Dropdown</h1>
			<DropDown
				data={[
					{ label: "Apple", value: "apple" },
					{ label: "Banana", value: "banana" },
					{ label: "Orange", value: "orange" },
				]}
				selected={selectedValue}
				onChange={setSelectedValue}
				searchable={true}
			/>
			<h1>Slider</h1>
			<div className="flex flex-col gap-2">
				<div className="flex justify-between items-center">
					<span>Slider Value: {sliderValue}</span>
				</div>
				<input
					type="range"
					min={0}
					max={100}
					value={sliderValue}
					onChange={(e) => setSliderValue(parseInt(e.target.value))}
					className="w-full"
				/>
			</div>
			<Card>
				<h1>Progressbars</h1>
				<Progressbar current={993} goal={1200} color="#ee22ff" animateProgress duration={0.2} />
				<h3 className="mt-1"><CountUp target={993} duration={1000} decimals={0}/> / 12000 $</h3>
				<br />
				<Progressbar current={993} goal={1200} labelinside labelColor="#fff" color="#ee22ff" duration={0.3} />
				<h3 className="mt-1">993 / 12000 $</h3>
			</Card>
			<h1>ToolTip</h1>
			<div className="flex flex-col justify-center items-center">
				<ToolTip tooltip="Tooltip">
					<p>Hover ABOVE</p>
				</ToolTip>
				<ToolTip tooltip="Tooltip" direction="bottom">
					<p>Hover BOTTOM</p>
				</ToolTip>
				<ToolTip tooltip="Tooltip" direction="left">
					<p>Hover LEFT</p>
				</ToolTip>
				<ToolTip tooltip="Tooltip" direction="right">
					<p>Hover RIGHT</p>
				</ToolTip>
			</div>
			<h1>Switch</h1>
			<div className="flex flex-row gap-x-5 items-center">
				<Switch value={isEnabled} onChange={setIsEnabled} size="sm" />
				<Switch value={isEnabled} onChange={setIsEnabled} size="md" />
				<Switch value={isEnabled} onChange={setIsEnabled} size="lg" />
			</div>
			<h1>Checkbox</h1>
			<div className="flex flex-row items-center justify-center">
				<input type="checkbox" id="checkbox1" defaultChecked />
				<label htmlFor="checkbox1">Checked</label>
			</div>
			<h1>Calendars</h1>
			<Calendar
				onDateSelect={(e) => setSelectedDay(e)}
				selectedDate={selectedDay}
			/>
			<span>Selected day: {selectedDay?.toDateString()}</span>
			<h1>Table</h1>
			<div className="overflow-x-auto"></div>
			<table>
				<thead>
					<tr>
						<th>Worker</th>
						<th>Position</th>
						<th>Monthly Income</th>
						<th>Department</th>
						<th>Status</th>
					</tr>
				</thead>
				<tbody>
					{[
						{
							worker: "John Doe",
							position: "Developer",
							income: "$5,000",
							department: "Engineering",
							status: "Active",
						},
						{
							worker: "Jane Smith",
							position: "Designer",
							income: "$4,800",
							department: "Design",
							status: "Active",
						},
						{
							worker: "Mike Johnson",
							position: "Manager",
							income: "$6,500",
							department: "Product",
							status: "Active",
						},
						{
							worker: "Sarah Williams",
							position: "QA Tester",
							income: "$4,200",
							department: "Engineering",
							status: "Inactive",
						},
						{
							worker: "David Brown",
							position: "Marketing",
							income: "$4,700",
							department: "Marketing",
							status: "Active",
						},
					].map((item, index) => (
						<tr key={index}>
							<td>{item.worker}</td>
							<td>{item.position}</td>
							<td>{item.income}</td>
							<td>{item.department}</td>
							<td>
								<span>{item.status}</span>
							</td>
						</tr>
					))}
				</tbody>
			</table>

			<h1>Default Card</h1>
			<Card>
				<h2>Card Title</h2>
				<p className="card-description">
					Lorem ipsum, dolor sit amet consectetur adipisicing elit.
					Delectus, exercitationem?
				</p>
				<Seperator text="OR LOG IN WITH" />
			</Card>
			<div className="flex flex-row space-x-2 items-center w-full">
				<SimpleStat icon={<ArrowUpCircle/>} title="Data" data={125}/>
				<SimpleStat icon={<ArrowUpCircle/>} className="w-full" title="Data" data={125} colorTheme="#c55cff"/>
			</div>
		</div>
	);
};

export default PlaygroundUI;
