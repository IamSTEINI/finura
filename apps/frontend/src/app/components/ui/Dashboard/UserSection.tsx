"use client";
import React, { useState, useRef, useEffect } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Moon, Settings, Sun, User } from "lucide-react";
import { useTheme } from "next-themes";

interface DashboardUserProps {
	isCollapsed: boolean;
}

const DashboardUser: React.FC<DashboardUserProps> = ({ isCollapsed }) => {
	const [open, setOpen] = useState(false);
	const userSectionRef = useRef<HTMLDivElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

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
					<div className="min-w-8 w-8 min-h-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
						<User className="w-4 h-4" />
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
									Administrator
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
				{open && (
					<motion.div
						ref={dropdownRef}
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.9 }}
						transition={{ duration: 0.2 }}
						className="absolute bottom-20 ml-20 card flex flex-col w-fit">
						<div className="border-b sidebar-border-color pb-1 gap-x-2 flex flex-row items-start justify-start w-full">
							<div className="min-w-8 w-8 min-h-8 h-8 bg-gray-500 mt-1 rounded-full flex items-center justify-center">
								<User className="w-4 h-4" />
							</div>
							<div className="flex flex-col justify-between">
								<h3 className="w-fit text-nowrap text-sm font-bold">
									John Doe
								</h3>
								<span className="text-sm opacity-50 truncate max-w-[90%] min-w-[50px]">
									thisisjohn97@gmail.com
								</span>
							</div>
						</div>
						<button className="btn-text-only-l my-0.5 btn-sp flex flex-row items-center justify-start gap-x-5 opacity-60 hover:opacity-100 transition-all ease-in">
							<Settings size={18} opacity={0.6} />
							Settings
						</button>
						<button className="btn-text-only-l my-0.5 btn-sp flex flex-row items-center justify-start gap-x-5 opacity-60 hover:opacity-100 transition-all ease-in">
							<User size={18} opacity={0.6} />
							Account
						</button>
						<button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="btn-text-only-l mb-1 btn-sp flex flex-row items-center justify-start gap-x-5 opacity-60 hover:opacity-100 transition-all ease-in">
							{theme === "dark" ? (
								<Sun size={18} opacity={0.6} />
							) : (
								<Moon size={18} opacity={0.6} />
							)}
							Switch to {theme === "dark" ? "Light" : "Dark"}
						</button>
						<div className="border-t sidebar-border-color flex flex-col">
							<button className="btn-text-only-l mt-1 btn-sp flex flex-row items-center justify-start gap-x-5 opacity-60 hover:opacity-100 transition-all ease-in">
								<LogOut size={18} opacity={0.6} />
								Log out
							</button>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
};

export default DashboardUser;
