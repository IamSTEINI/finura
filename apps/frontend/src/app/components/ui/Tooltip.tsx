type ToolTipProps = {
	children: React.ReactNode;
	tooltip: string;
	direction?: "top" | "right" | "bottom" | "left";
};

const ToolTip: React.FC<ToolTipProps> = ({
	children,
	tooltip,
	direction = "top",
}) => {
	const getPositionClasses = () => {
		switch (direction) {
			case "top":
				return "translate-y-0 mb-2 origin-bottom group-hover:-translate-y-10";
			case "right":
				return "translate-x-0 ml-2 mt-2.5 origin-left group-hover:translate-x-15";
			case "bottom":
				return "translate-y-0 translate-y-[100%] mt-2 origin-top group-hover:translate-y-5";
			case "left":
				return "translate-x-0 mr-2 origin-right group-hover:-translate-x-25";
			default:
				return "translate-x-[-50%] translate-y-[-100%] mb-2 origin-bottom group-hover:translate-y-[-8px]";
		}
	};

	return (
		<div className="relative group cursor-auto">
			<span
				className={`absolute text-nowrap px-2 py-1 border tooltip-border-color tooltip-bg-color w-fit text-start text-[15px] rounded-md opacity-0 group-hover:opacity-100 scale-0 group-hover:scale-100 transition-all duration-100 ease-in-out transform pointer-events-none z-[999] ${getPositionClasses()}`}>
				{tooltip}
			</span>
			{children}
		</div>
	);
};

export default ToolTip;
