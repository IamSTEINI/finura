"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Hash } from "lucide-react";

const tabs = ["Preset", "Custom"];
const colors = [
	"#FF5252",
	"#FF9500",
	"#FFEB3B",
	"#4CAF50",
	"#2196F3",
	"#9C27B0",
	"#E91E63",
	"#9E9E9E",
	"#5C6BC0",
	"#26A69A",
	"#EC407A",
	"#8BC34A",
	"#795548",
	"#607D8B",
	"#FF4081"
];

interface ColorPanelProps {
	color?: string;
	onChange?: (color: string) => void;
}

const ColorPanel: React.FC<ColorPanelProps> = ({ color, onChange }) => {
	const [selectedTab, setSelectedTab] = useState(tabs[0]);
	const [internalColor, setInternalColor] = useState(
		colors[Math.floor(Math.random() * colors.length)]
	);

	const selectedColor = color !== undefined ? color : internalColor;

	const handleColorSelect = (newColor: string) => {
		if (color === undefined) {
			setInternalColor(newColor);
		}
		onChange?.(newColor);
	};

	return (
		<>
			<div className="w-full flex justify-between items-center select-none">
				{tabs.map((tab: string) => (
					<div
						key={tab}
						className="relative h-7 w-22 flex justify-center items-center">
						<a
							onClick={() => setSelectedTab(tab)}
							className={`text-xs transition-colors p-5 cursor-pointer ${
								selectedTab === tab
									? "text-default"
									: "text-default opacity-50"
							}`}>
							{tab}
						</a>
						{selectedTab === tab && (
							<motion.div
								transition={{
									type: "spring",
									duration: 0.3,
									bounce: 0.3,
								}}
								layoutId="underline"
								className="absolute top-0 left-0 h-full w-full border border-color bg-black/10 -z-10 rounded-lg"
							/>
						)}
					</div>
				))}
			</div>
			<AnimatePresence mode="wait">
				{selectedTab === "Preset" && (
					<motion.div
						key="preset"
						initial={{ x: 10, opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						exit={{ x: -10, opacity: 0 }}
						transition={{
							duration: 0.2,
							type: "spring",
							bounce: 0.3,
						}}
						className="w-full flex flex-row flex-wrap gap-3 justify-center items-center my-4">
						{colors.map((colorOption) => (
							<div
								key={colorOption}
								onClick={() => handleColorSelect(colorOption)}
								className="relative flex justify-center items-center rounded-full border-color cursor-pointer w-fit">
								<div
									className="w-6 h-6 border-none rounded-full z-10 overflow-hidden"
									style={{ backgroundColor: colorOption }}>
									{selectedColor === colorOption && (
										<div className="w-full h-full flex justify-center items-center default-text-color">
											<Check className="bg-black/50 p-1" />
										</div>
									)}
								</div>
							</div>
						))}
						<div className="w-full h-full p-x-5 flex flex-row justify-between border-color border rounded-md">
							<Hash className="p-1 opacity-50" />
							<input
								value={selectedColor.replace("#", "")}
								onChange={(e) => {
									const value = e.target.value.replace(
										/[^0-9a-fA-F]/g,
										""
									);
									handleColorSelect("#" + value);
								}}
								className="transparent-input mr-2"
								maxLength={6}
								placeholder="Hex color"
							/>
						</div>
					</motion.div>
				)}
				{selectedTab === "Custom" && (
					<motion.div
						key="custom"
						initial={{ x: 10, opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						exit={{ x: -10, opacity: 0 }}
						transition={{
							duration: 0.15,
							type: "spring",
							bounce: 0.3,
						}}
						className="w-full my-4 space-y-4">
						{["Red", "Green", "Blue"].map((channel, index) => {
							const hexToRgb = (hex: string) => {
								const result =
									/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(
										hex
									);
								return result
									? [
											parseInt(result[1], 16),
											parseInt(result[2], 16),
											parseInt(result[3], 16),
									  ]
									: [0, 0, 0];
							};

							const rgbValues = hexToRgb(selectedColor);
							const value = rgbValues[index];

							const rgbToHex = (
								r: number,
								g: number,
								b: number
							) => {
								return (
									"#" +
									((1 << 24) | (r << 16) | (g << 8) | b)
										.toString(16)
										.slice(1)
								);
							};

							const handleSliderChange = (
								e: React.ChangeEvent<HTMLInputElement>
							) => {
								const newValue = parseInt(e.target.value);
								const newRgb = [...rgbValues];
								newRgb[index] = newValue;
								const newColor = rgbToHex(
									newRgb[0],
									newRgb[1],
									newRgb[2]
								);
								handleColorSelect(newColor);
							};

							return (
								<div key={channel} className="w-full space-y-1">
									<div className="flex items-center gap-2">
										<div className="rounded-md flex justify-center items-center">
											<input
												type="range"
												min="0"
												max="255"
												value={value}
												onChange={handleSliderChange}
												className="w-full appearance-none border rounded-full outline-none white-thumb"
												style={{
													height: 10,
													background:
														index === 0
															? `linear-gradient(to right, #000, #f00)`
															: index === 1
															? `linear-gradient(to right, #000, #0f0)`
															: `linear-gradient(to right, #000, #00f)`,
												}}
											/>
										</div>

										<div className="border-color border rounded-md px-2 py-1">
											<input
												type="number"
												min="0"
												max="255"
												value={value}
												onChange={handleSliderChange}
												className="transparent-input w-14 text-center text-xs"
											/>
										</div>
									</div>
								</div>
							);
						})}
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
};

export default ColorPanel;
