import { PanelLeft } from "lucide-react";

interface SidebarProps {
	isCollapsed: boolean;
	setIsCollapsed: (isCollapsed: boolean) => void;
	title?: string;
}

export const Header = ({
	isCollapsed,
	setIsCollapsed,
	title = "Dashboard",
}: SidebarProps) => {
	return (
		<header className="header max-h-[50px] min-h-[50px] px-2 border-b sidebar-border-color flex items-center justify-between">
			<div className="flex items-center w-full dashboard-text">
				<button
					style={{ backgroundColor: "transparent" }}
					onClick={() => setIsCollapsed(!isCollapsed)}
					className="p-2 rounded-md">
					<PanelLeft className="w-5 h-5 dashboard-text" />
				</button>
				<div className="w-px h-1 py-2.5 mr-4" style={{backgroundColor: "var(--seperator-color)"}}></div>
				<h4 className="text-lg font-[300]">{title}</h4>
			</div>
		</header>
	);
};
