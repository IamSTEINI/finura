import {
	Cog,
	// Calendar,
	// ChartArea,
	// Contact,
	FileText,
	Home,
	X,
	// Package,
	// Receipt,
	// Send,
	// Upload,
} from "lucide-react";
//import DropDown from "../DropDown";
//import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import DashboardUser from "./UserSection";
import ToolTip from "../Tooltip";
import { useLocale } from "@/context/LocaleContext";

interface SidebarProps {
	isCollapsed: boolean;
	setIsCollapsed: (isCollapsed: boolean) => void;
	currentSelectedTab?: string;
	onChange?: (tabLabel: string) => void;
}

export const Sidebar = ({
	isCollapsed,
	currentSelectedTab = "Dashboard",
	onChange,
	setIsCollapsed,
}: SidebarProps) => {
	const { t } = useLocale();
	const menuItems = [
		{ icon: Home, label: t("dashboard.sidebar_dashboard") },
		{ icon: FileText, label: t("dashboard.sidebar_invoices") },
		{ icon: Cog, label: t("dashboard.sidebar_company_settings") },
		// { icon: Contact, label: t("dashboard.sidebar_customers") },
		// { icon: Receipt, label: t("dashboard.sidebar_receipts") },
		// { icon: Send, label: t("dashboard.sidebar_chats") },
		// { icon: Calendar, label: t("dashboard.sidebar_appointments") },
		// { icon: ChartArea, label: t("dashboard.sidebar_analytics") },
		// { icon: Package, label: t("dashboard.sidebar_products") },
		// { icon: Upload, label: t("dashboard.sidebar_export") },
	];
	//const [selectedWorkSpace, setSelectedWorkspace] = useState("");

	return (
		<motion.div
			initial={false}
			animate={{
				width: isCollapsed
					? window.innerWidth >= 768
						? "4rem"
						: "0rem"
					: window.innerWidth >= 768
					? "16rem"
					: "100%",
			}}
			transition={{ duration: 0.3, ease: "easeInOut" }}
			className={`
		sidebar h-screen flex flex-col relative
		${isCollapsed ? "w-0 md:w-16" : "w-64"} 
		overflow-hidden
	`}>
			<div className="h-[50px] min-h-[50px] max-h-[50px] border-b sidebar-border-color flex items-center justify-between">
				<div className="flex items-center w-full h-full space-x-3">
					<div className="w-8 min-w-8 h-8 min-h-8 ml-4 flex items-center justify-center">
						<Image
							src={"/finura/icon.ico"}
							alt="Finura logo"
							width={100}
							height={100}
						/>
					</div>
					<div className="w-full flex flex-row items-center justify-end">
						<button
							className="btn-text-only block sm:hidden"
							onClick={() => setIsCollapsed(!isCollapsed)}>
							<X />
						</button>
					</div>
					{/* <AnimatePresence initial={false}>
						{!isCollapsed && (
							<motion.div
								className="flex-1 mr-2"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.2 }}>
								<DropDown
									data={[
										{
											label: "Marketing Team",
											value: "marketing",
										},
									]}
									selected={selectedWorkSpace}
									onChange={setSelectedWorkspace}
									searchable={false}
									placeholder="Select workspace"
									className="w-full h-8 min-h-8 max-h-8 dropdown-bare"
									buttonClassName="dropdown-bare"
									listClassName=""
									defaultValue="marketing"
								/>
							</motion.div>
						)}
					</AnimatePresence> */}
				</div>
			</div>

			<nav className="flex-1 p-2">
				<ul className="space-y-2">
					{menuItems.map((item, index) => {
						const Icon = item.icon;
						const isActive = currentSelectedTab === item.label;
						return (
							<li key={index}>
								{isCollapsed ? (
									<ToolTip
										tooltip={item.label}
										direction="right">
										<button
											onClick={() =>
												onChange?.(item.label)
											}
											className={`
                                        w-full flex items-center dropdown-bare space-x-3 px-3 py-2 rounded-lg
                                        ${isActive ? "font-bold" : "font-md"}
                                        ${
											isCollapsed
												? "justify-center"
												: "justify-start"
										}
                                        sidebar-button dashboard-text`}>
											<Icon
												className={`w-6.5 h-6.5 flex-shrink-0`}
												strokeWidth={
													isActive ? 2.5 : 1.5
												}
											/>
											<AnimatePresence initial={false}>
												{!isCollapsed && (
													<motion.span
														initial={{
															opacity: 0,
															width: 0,
														}}
														animate={{
															opacity: 1,
															width: "auto",
														}}
														exit={{
															opacity: 0,
															width: 0,
														}}
														transition={{
															duration: 0.2,
														}}
														className="truncate">
														{item.label}
													</motion.span>
												)}
											</AnimatePresence>
										</button>
									</ToolTip>
								) : (
									<button
										onClick={() => onChange?.(item.label)}
										className={`
                                        w-full flex items-center dropdown-bare space-x-3 px-3 py-2 rounded-lg
                                        ${
											isActive
												? "font-semibold"
												: "font-md"
										}
                                        ${
											isCollapsed
												? "justify-center"
												: "justify-start"
										}
                                        sidebar-button dashboard-text`}>
										<Icon
											className={`w-6.5 h-6.5 flex-shrink-0`}
											strokeWidth={isActive ? 2.5 : 1.5}
										/>
										<AnimatePresence initial={false}>
											{!isCollapsed && (
												<motion.span
													initial={{
														opacity: 0,
														width: 0,
													}}
													animate={{
														opacity: 1,
														width: "auto",
													}}
													exit={{
														opacity: 0,
														width: 0,
													}}
													transition={{
														duration: 0.2,
													}}
													className="truncate">
													{item.label}
												</motion.span>
											)}
										</AnimatePresence>
									</button>
								)}
							</li>
						);
					})}
				</ul>
			</nav>

			<DashboardUser isCollapsed={isCollapsed} />
		</motion.div>
	);
};
