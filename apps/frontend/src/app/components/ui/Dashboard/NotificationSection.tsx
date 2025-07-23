"use client";
import React, { useState, useRef, useEffect } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { Bell } from "lucide-react";
import Seperator from "../Seperator";
import Notification from "./Notification";
import { useLocale } from "@/context/LocaleContext";
import { Mail, useMailbox } from "@/context/MailboxContext";

interface NotificationSectionProps {
	notifications: Mail[];
	setTab: (tabLabel: string) => void;
	markAsRead: (notificationId: string) => void;
}

const NotificationSection: React.FC<NotificationSectionProps> = ({
	notifications,
	setTab,
	markAsRead,
}) => {
	const { t } = useLocale();
	const { clearMailbox } = useMailbox();
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

	const unreadCount = notifications.filter(
		(notification) => !notification.read
	).length;
	const sortedNotifications = [...notifications].sort((a, b) => {
		if (a.read === b.read) {
			return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
		}
		return a.read ? -1 : 1;
	});
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
					{unreadCount > 0 && (
						<span className="absolute rounded-full bg-red-500 min-w-5 min-h-5 max-w-5 max-h-5 text-xs text-center justify-center items-center flex -translate-y-7.5 translate-x-2.5">
							{unreadCount <= 9 ? unreadCount : "9+"}
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
								<h3>{t("dashboard.header_notifications")}</h3>
								<div className="flex flex-row items-center space-x-2 justify-center">
									<span>{notifications.length}</span>
									<span
										className="opacity-50 hover:opacity-100 cursor-pointer select-none"
										onClick={() => {
											clearMailbox()
										}}>
										{t(
											"dashboard.header_notifications_clear"
										)}
									</span>
								</div>
							</div>
							<Seperator />
							<div className="flex flex-col w-full max-h-[300px] overflow-y-scroll rounded-md pt-1">
								{notifications.length === 0 ? (
									<div className="py-2 pb-0 text-center text-gray-500">
										{t("dashboard.header_no_notifications")}
									</div>
								) : (
									sortedNotifications
										.reverse()
										.map((notification) => (
											<div
												key={
													notification.notificationId
												}
												className={`${
													notification.read
														? "opacity-50"
														: "opacity-100"
												}`}>
												<Notification
													onClick={() =>
														setTab(
															"Chat-" +
																notification.author_id
														)
													}
													author={notification.author}
													content={
														notification.message
													}
													time={
														notification.timestamp
													}
													markAsRead={markAsRead}
													id={
														notification.notificationId
													}
												/>
											</div>
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
