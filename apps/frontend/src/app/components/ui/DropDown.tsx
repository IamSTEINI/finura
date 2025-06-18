import { Check } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";

interface DropDownProps {
	data: { label: string; value: string }[];
	selected: string | null;
	onChange: (value: string) => void;
	searchable?: boolean;
	placeholder?: string;
	className?: string;
	listClassName?: string;
	buttonClassName?: string;
	defaultValue?: string;
}

const DropDown: React.FC<DropDownProps> = ({
	data,
	selected,
	onChange,
	searchable = false,
	placeholder = "Select...",
	className = "",
	buttonClassName = "",
	listClassName = "",
	defaultValue = "default",
}) => {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const [hoveredIndex, setHoveredIndex] = useState<number>(-1);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (selected == null || selected == "") {
			const defaultItem = data.find(
				(item) => item.value === defaultValue
			);
			if (defaultItem) {
				onChange(defaultItem.value);
			}
		}
	}, [data, selected, onChange, defaultValue]);

	const filteredData = searchable
		? data.filter((item) =>
				item.label.toLowerCase().includes(search.toLowerCase())
		  )
		: data;

	const selectedItem = data.find((item) => item.value === selected);

	useEffect(() => {
		const handleClick = (e: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(e.target as Node)
			) {
				setOpen(false);
				setSearch("");
			}
		};
		if (open) {
			document.addEventListener("mousedown", handleClick);
		}
		return () => document.removeEventListener("mousedown", handleClick);
	}, [open]);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (!open) return;
		if (e.key === "ArrowDown") {
			setHoveredIndex((prev) =>
				prev < filteredData.length - 1 ? prev + 1 : 0
			);
		} else if (e.key === "ArrowUp") {
			setHoveredIndex((prev) =>
				prev > 0 ? prev - 1 : filteredData.length - 1
			);
		} else if (e.key === "Enter" && hoveredIndex >= 0) {
			const item = filteredData[hoveredIndex];
			if (item) {
				onChange(item.value);
				setOpen(false);
				setSearch("");
			}
		} else if (e.key === "Escape") {
			setOpen(false);
			setSearch("");
		}
	};

	return (
		<div
			ref={containerRef}
			tabIndex={0}
			className={`relative w-64 ${className}`}
			onKeyDown={handleKeyDown}>
			<button
				type="button"
				className={`w-full h-full text-left px-4 py-2 border dropdown rounded bg-white shadow-sm cursor-pointer flex items-center justify-between focus:outline-none ${buttonClassName}`}
				onClick={() => setOpen((o) => !o)}>
				<span
					style={{ color: "var(--input-text-color-primary)" }}
					className="opacity-75">
					{selectedItem ? (
						selectedItem.label
					) : (
						<span>{placeholder}</span>
					)}
				</span>
				<svg
					className={`w-4 h-4 ml-2 transition-transform ${
						open ? "rotate-180" : ""
					}`}
					fill="none"
					style={{ color: "var(--input-text-color-primary)" }}
					stroke="currentColor"
					viewBox="0 0 24 24">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M19 9l-7 7-7-7"
					/>
				</svg>
			</button>
			{open && (
				<div className={`absolute left-0 w-full mt-2 bg-white border dropdown overflow-hidden rounded-lg shadow-lg z-50 ${listClassName}`}>
					{searchable && (
						<input
							autoFocus
							className="w-full px-3 py-2 border-b outline-none dropdown-input"
							placeholder="Search..."
							value={search}
							onChange={(e) => {
								setSearch(e.target.value);
								setHoveredIndex(0);
							}}
							onKeyDown={(e) => e.stopPropagation()}
						/>
					)}
					<ul className="max-h-60 overflow-y-auto">
						{filteredData.length === 0 && (
							<li className="px-4 py-2 text-gray-400">
								No results
							</li>
						)}
						{filteredData.map((item, idx) => (
							<li
								key={item.value}
								className={`px-4 py-2 cursor-pointer flex flex-row justify-between items-center ${
									hoveredIndex === idx
										? "dropdown-item-hover"
										: ""
								} ${
									selected === item.value ? "font-bold" : ""
								} ${listClassName}`}
								onMouseEnter={() => setHoveredIndex(idx)}
								onMouseDown={() => {
									onChange(item.value);
									setOpen(false);
									setSearch("");
								}}>
								<>{item.label}</>
								{selected === item.value && (
									<Check size={15} opacity={0.5} />
								)}
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
};

export default DropDown;
