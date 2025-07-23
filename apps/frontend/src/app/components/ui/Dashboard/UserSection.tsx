"use client";
import React, { useState, useRef, useEffect } from "react";

import { motion, AnimatePresence } from "framer-motion";
import {
	Languages,
	LogOut,
	Moon,
	Settings,
	Sun,
	TestTube,
	User,
} from "lucide-react";
import { useTheme } from "next-themes";
import { getAllLocales, useLocale } from "@/context/LocaleContext";
import { useDevMode } from "@/context/DeveloperContext";
import DropDown from "../DropDown";
import { useNotification } from "@/context/NotificationContext";
import Image from "next/image";

interface DashboardUserProps {
	isCollapsed: boolean;
}

const DashboardUser: React.FC<DashboardUserProps> = ({ isCollapsed }) => {
	const { t, changeLocale, locale } = useLocale();
	const { devMode } = useDevMode();
	const [open, setOpen] = useState(false);
	const userSectionRef = useRef<HTMLDivElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	const { addNotification } = useNotification();

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				userSectionRef.current &&
				!userSectionRef.current.contains(event.target as Node) &&
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	if (!mounted) return null;

	const userObj =
		localStorage && localStorage.getItem("USER_INFO")
			? JSON.parse(localStorage.getItem("USER_INFO") || "{}")
			: null;

	return (
		<>
			<div
				ref={userSectionRef}
				onClick={() => {
					setOpen(!open);
				}}
				className="p-4 border-t sidebar-border-color select-none hover:backdrop-brightness-75 cursor-pointer">
				<div
					className={`flex items-center space-x-3 ${
						isCollapsed ? "justify-center" : "justify-start"
					}`}>
					<div className="min-w-8 w-8 min-h-8 h-8 bg-gray-500 rounded-full overflow-hidden flex items-center justify-center">
						<Image
							width={500}
							height={500}
							src={"/img/" + userObj.profile_picture}
							alt=""
							className="w-full h-full object-cover"
							style={{ objectFit: "cover" }}
						/>
					</div>
					<AnimatePresence initial={false}>
						{!isCollapsed && (
							<motion.div
								initial={{ opacity: 0, width: 0 }}
								animate={{ opacity: 1, width: "auto" }}
								exit={{ opacity: 0, width: 0 }}
								transition={{ duration: 0.2 }}
								className="truncate">
								<p className="text-md font-medium truncate max-w-[90%] min-w-[100px]">
									John Doe
								</p>
								<p className="text-xs dashboard-text opacity-75">
									{t("dashboard.sidebar_role_adminstrator")}
								</p>
							</motion.div>
						)}
					</AnimatePresence>
					{!isCollapsed && (
						<Settings size={20} opacity={0.6} className="ml-10" />
					)}
				</div>
			</div>
			<AnimatePresence>
				{open && userObj && (
					<motion.div
						ref={dropdownRef}
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.9 }}
						transition={{ duration: 0.2 }}
						className="absolute bottom-20 ml-20 card flex flex-col w-fit">
						<div className="border-b sidebar-border-color pb-1 gap-x-2 flex flex-row items-start justify-start w-full">
							<div className="min-w-8 w-8 min-h-8 h-8 bg-gray-500 mt-1 rounded-full overflow-hidden flex items-center justify-center">
								<Image
									width={500}
									height={500}
									src={"/img/" + userObj.profile_picture}
									alt=""
									className="w-full h-full object-cover"
									style={{ objectFit: "cover" }}
								/>
							</div>
							<div className="flex flex-col justify-between">
								<h3 className="w-fit text-nowrap text-sm font-bold">
									{userObj.firstname} {userObj.lastname}
								</h3>
								<span className="text-sm opacity-50 truncate max-w-[90%] min-w-[50px]">
									{userObj.email}
								</span>
							</div>
						</div>
						<button className="btn-text-only-l my-0.5 btn-sp flex flex-row items-center justify-start gap-x-5 opacity-75 hover:opacity-100 transition-all ease-in">
							<Settings size={18} opacity={0.6} />
							{t("dashboard.sidebar_menu_settings")}
						</button>
						<button className="btn-text-only-l my-0.5 btn-sp flex flex-row items-center justify-start gap-x-5 opacity-75 hover:opacity-100 transition-all ease-in">
							<User size={18} opacity={0.6} />
							{t("dashboard.sidebar_menu_account")}
						</button>
						<button
							onClick={() =>
								setTheme(theme === "dark" ? "light" : "dark")
							}
							className="btn-text-only-l mb-1 btn-sp flex flex-row items-center justify-start gap-x-5 opacity-75 hover:opacity-100 transition-all ease-in">
							{theme === "dark" ? (
								<Sun size={18} opacity={0.6} />
							) : (
								<Moon size={18} opacity={0.6} />
							)}
							{t("dashboard.sidebar_menu_switchmode")}{" "}
							{theme === "dark"
								? t("dashboard.sidebar_menu_switch_light")
								: t("dashboard.sidebar_menu_switch_dark")}
						</button>
						{devMode && (
							<div className="border rounded-md border-red-500 w-full">
								<div className="flex flex-row items-center justify-start z-[999] gap-x-5 opacity-75 hover:opacity-100 transition-all ease-in">
									<Languages
										size={18}
										opacity={0.6}
										className="ml-2.5"
									/>
									<DropDown
										data={getAllLocales()}
										onChange={(value) =>
											changeLocale(value)
										}
										searchable={true}
										placeholder={t(
											"general.select_language"
										)}
										className="w-full h-10 mb-1"
										defaultValue={getAllLocales()[0]?.value}
										selected={locale}
									/>
								</div>
								<button
									onClick={() =>
										addNotification("Hey", "Title")
									}
									className="btn-text-only-l my-0.5 btn-sp flex flex-row items-center justify-start gap-x-5 opacity-75 hover:opacity-100 transition-all ease-in">
									<TestTube
										size={18}
										opacity={0.6}
										className="ml-2.5"
									/>
									<div className="w-full text-start items-center flex justify-start">
										<span>Test notification</span>
									</div>
								</button>
							</div>
						)}
						<div className="border-t sidebar-border-color flex flex-col">
							<button className="btn-text-only-l mt-1 btn-sp flex flex-row items-center justify-start gap-x-5 opacity-75 hover:opacity-100 transition-all ease-in">
								<LogOut size={18} opacity={0.6} />
								{t("dashboard.sidebar_menu_logout")}
							</button>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
};

export default DashboardUser;
