import { PanelLeft, SearchIcon } from "lucide-react";
import ChildrenInput from "../ChildrenInput";
import NotificationSection from "./NotificationSection";
import { useLocale } from "@/context/LocaleContext";
import { useMailbox } from "@/context/MailboxContext";

interface SidebarProps {
	isCollapsed: boolean;
	setIsCollapsed: (isCollapsed: boolean) => void;
	title?: string;
	changeTab: (tabLabel: string) => void;
}

export const Header = ({
	isCollapsed,
	setIsCollapsed,
	title = "Dashboard",
	changeTab,
}: SidebarProps) => {
	const { t } = useLocale();
	const { mails, markAsRead } = useMailbox();
	return (
		<header className="header max-h-[50px] min-h-[50px] px-2 border-b sidebar-border-color flex items-center justify-between">
			<div className="flex items-center min-w-fit w-full dashboard-text">
				<button
					style={{ backgroundColor: "transparent" }}
					onClick={() => setIsCollapsed(!isCollapsed)}
					className="p-2 rounded-md">
					<PanelLeft className="w-5 h-5 dashboard-text" />
				</button>
				<div
					className="min-h-8 h-8 w-[1px] mx-4 ml-1"
					style={{ backgroundColor: "var(--seperator-color)" }}></div>
				<h4 className="text-lg font-[300] select-none text-nowrap min-w-[200px]">
					{title}
				</h4>
				<div className="flex flex-row w-full justify-end items-center pr-4 space-x-3 ml-4">
					<div className="min-w-[200px] w-[40%] max-w-[600px] rounded-md active:border hover:border focus:border border-color hidden lg:block">
						<ChildrenInput
							childPosition="left"
							border={false}
							placeholder={t(
								"dashboard.header_search_placeholder"
							)}
							className="w-full">
							<SearchIcon size={18} opacity={0.5} />
						</ChildrenInput>
					</div>
					<NotificationSection
						setTab={(e) => {
							changeTab(e);
						}}
						notifications={mails}
						markAsRead={markAsRead}
					/>
				</div>
			</div>
		</header>
	);
};
