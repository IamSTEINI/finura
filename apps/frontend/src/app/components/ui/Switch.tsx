import React from "react";

interface SwitchProps {
	value: boolean;
	onChange: (value: boolean) => void;
	disabled?: boolean;
	size?: "sm" | "md" | "lg";
	className?: string;
}

const Switch: React.FC<SwitchProps> = ({
	value,
	onChange,
	disabled = false,
	size = "md",
	className = "",
}) => {
	const sizeClasses = {
		sm: {
			container: "w-10 h-6",
			circle: "w-4 h-4",
			translate: "translate-x-2",
		},
		md: {
			container: "w-12 h-7",
			circle: "w-5 h-5",
			translate: "translate-x-3",
		},
		lg: {
			container: "w-14 h-8",
			circle: "w-6 h-6",
			translate: "translate-x-4",
		},
	};

	const currentSize = sizeClasses[size];

	const handleClick = () => {
		if (!disabled) {
			onChange(!value);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if ((e.key === "Enter" || e.key === " ") && !disabled) {
			e.preventDefault();
			onChange(!value);
		}
	};

	return (
		<button
			type="button"
			role="switch"
			aria-checked={value}
			disabled={disabled}
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			className={`
				relative inline-flex items-center rounded-full switch transition-all duration-200 ease-in-out
				${currentSize.container}
				${value ? "switch-active-bg-color" : "switch-unactive-bg-color"}
				${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
				${className}
			`}>
			<span
				className={`
					inline-block rounded-full bg-white shadow-lg transform transition-transform duration-200 ease-in-out
					${currentSize.circle}
					${value ? currentSize.translate : "-translate-x-2"}
				`}
			/>
		</button>
	);
};

export default Switch;
