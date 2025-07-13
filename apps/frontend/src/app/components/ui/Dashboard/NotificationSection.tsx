"use client";
import React, { useState, useRef, useEffect } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { Bell } from "lucide-react";
import Seperator from "../Seperator";
import Notification from "./Notification";
import { useLocale } from "@/context/LocaleContext";

interface NotificationType {
	author: string;
	message: string;
	time: string;
	author_id: number;
}

interface NotificationSectionProps {
	notifications: NotificationType[];
	setTab: (tabLabel: string) => void;
}

const NotificationSection: React.FC<NotificationSectionProps> = ({
	notifications,
	setTab,
}) => {
	const { t } = useLocale();
	const [open, setOpen] = useState(false);
	const notifSectionRef = useRef<HTMLDivElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				notifSectionRef.current &&
				!notifSectionRef.current.contains(event.target as Node) &&
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

	return (
		<>
			<div
				className="relative"
				ref={notifSectionRef}
				onClick={() => {
					setOpen(!open);
				}}>
				<button
					className="p-2 relative rounded-full"
					style={{ backgroundColor: "transparent" }}>
					<Bell className="w-5 h-5 dashboard-text" />
					{notifications.length > 0 && (
						<span className="absolute rounded-full bg-red-500 min-w-5 min-h-5 max-w-5 max-h-5 text-xs text-center justify-center items-center flex -translate-y-7.5 translate-x-2.5">
							{notifications.length <= 9
								? notifications.length
								: "9+"}
						</span>
					)}
				</button>

				<AnimatePresence>
					{open && (
						<motion.div
							ref={dropdownRef}
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.9 }}
							transition={{ duration: 0.2 }}
							onClick={(e) => e.stopPropagation()}
							className="absolute top-16 right-0 card flex flex-col md:w-[350px] w-[370px]">
							<div className="flex flex-row justify-between items-center pb-1">
								<h3>
									{t(
										"dashboard.header_notifications"
									)}
								</h3>
								<span>{notifications.length}</span>
							</div>
							<Seperator />
							<div className="flex flex-col w-full max-h-[300px] overflow-y-scroll rounded-md pt-1">
								{notifications.length === 0 ? (
									<div className="py-2 pb-0 text-center text-gray-500">
										{t(
											"dashboard.header_no_notifications"
										)}
									</div>
								) : (
									notifications
										.slice()
										.sort(
											(a, b) =>
												new Date(b.time).getTime() -
												new Date(a.time).getTime()
										)
										.map((notification, index) => (
											<Notification
												onClick={() =>
													setTab("Chat-"+notification.author_id)
												}
												key={index}
												author={notification.author}
												content={notification.message}
												time={notification.time}
											/>
										))
								)}
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</>
	);
};

export default NotificationSection;
