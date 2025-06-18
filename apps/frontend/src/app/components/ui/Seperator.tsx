import React from "react";

interface SeperatorProps {
	text?: string;
	className?: string;
}

const Seperator: React.FC<SeperatorProps> = ({ text, className }) => {
	if (text) {
		return (
			<div
				className={`flex items-center w-full select-none ${
					className ?? ""
				}`}
				style={{ color: "var(--seperator-color)" }}>
				<div
					className="flex-1 h-px"
					style={{ background: "var(--seperator-color)" }}
				/>
                <span className="px-3 text-sm font-medium" style={{ filter: 'brightness(200%)' }}>{text}</span>
				<div
					className="flex-1 h-px"
					style={{ background: "var(--seperator-color)" }}
				/>
			</div>
		);
	}
	return (
		<div
			className={`w-full h-px ${className ?? ""}`}
			style={{ background: "var(--seperator-color)" }}
		/>
	);
};

export default Seperator;
