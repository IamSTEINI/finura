import React, { useState } from "react";
import ColorBox from "./ColorBox";
import { AnimatePresence, motion } from "framer-motion";
import ColorPanel from "./ColorPanel";

interface ColorPickerProps {
	icon: React.ReactNode;
	color?: string;
	onChange?: (color: string) => void;
}

const ColorPicker = (props: ColorPickerProps) => {
	const { icon, onChange, color: externalColor } = props;
	const [openColorPicker, setOpenColorPicker] = useState<boolean>(false);
	const [internalColor, setInternalColor] = useState<string>("#FF5252");

	const color = externalColor !== undefined ? externalColor : internalColor;

	const handleColorChange = (newColor: string) => {
		if (externalColor === undefined) {
			setInternalColor(newColor);
		}
		onChange?.(newColor);
	};

	return (
		<div className="relative">
			<button
				className="btn-color-picker group"
				style={{ backgroundColor: color }}
				onClick={() => setOpenColorPicker(!openColorPicker)}>
				<div
					className={`${
						openColorPicker
							? "opacity-100"
							: "opacity-0 group-hover:opacity-100 transition-all ease-in duration-100"
					}`}>
					{icon}
				</div>
			</button>
			{openColorPicker && (
				<div
					className="fixed inset-0"
					onClick={() => setOpenColorPicker(false)}></div>
			)}
			<AnimatePresence>
				{openColorPicker && (
					<motion.div
						className="absolute top-full left-5 mt-1 z-10"
						transition={{
							type: "spring",
							duration: 0.3,
							bounce: 0.3,
						}}
						initial={{ scale: 0.6 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ opacity: 0, scale: 0.6 }}>
						<ColorBox>
							<ColorPanel
								onChange={handleColorChange}
								color={color}></ColorPanel>
						</ColorBox>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default ColorPicker;
