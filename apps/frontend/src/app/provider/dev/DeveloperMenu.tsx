"use client";
import { useWebsocket } from "@/context/WebsocketContext";
import React, { ReactNode, useEffect, useState, MouseEvent } from "react";

interface DevProviderProps {
	children: ReactNode;
}

const DeveloperMenu = ({ children }: DevProviderProps) => {
	const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>(
		{}
	);
	const [localStorageItems, setLocalStorageItems] = useState<
		Record<string, string>
	>({});
	const [position, setPosition] = useState({ x: 20, y: 20 });
	const [isDragging, setIsDragging] = useState(false);
	const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
	const { connections } = useWebsocket();
	const [, setUpdateTrigger] = useState(0);

	useEffect(() => {
		const loadItems = () => {
			const items: Record<string, string> = {};
			for (let i = 0; i < localStorage.length; i++) {
				const key = localStorage.key(i);
				if (key) {
					const rawValue = localStorage.getItem(key) || "";
					try {
						const parsedValue = JSON.parse(rawValue);
						items[key] = JSON.stringify(parsedValue, null, 2);
					} catch (e) {
						console.log(e)
						items[key] = rawValue;
					}
				}
			}
			setLocalStorageItems(items);
		};

		loadItems();
		window.addEventListener("storage", loadItems);
		return () => window.removeEventListener("storage", loadItems);
	}, []);

	const handleMouseDown = (e: MouseEvent) => {
		setIsDragging(true);
		setDragOffset({
			x: e.clientX - position.x,
			y: e.clientY - position.y,
		});
	};

	const handleMouseMove = (e: MouseEvent) => {
		if (isDragging) {
			setPosition({
				x: e.clientX - dragOffset.x,
				y: e.clientY - dragOffset.y,
			});
		}
	};

	const handleMouseUp = () => {
		setIsDragging(false);
	};

	useEffect(() => {
		const intervalId = setInterval(() => {
			setUpdateTrigger((prev) => prev + 1);
		}, 1000);

		return () => clearInterval(intervalId);
	}, []);

	useEffect(() => {
		if (isDragging) {
			document.addEventListener("mousemove", handleMouseMove as never);
			document.addEventListener("mouseup", handleMouseUp);
		}

		return () => {
			document.removeEventListener("mousemove", handleMouseMove as never);
			document.removeEventListener("mouseup", handleMouseUp);
		};
	}, [isDragging, dragOffset, handleMouseMove]);

	return (
		<>
			{children}
			<div
				className="fixed rounded-md bg-black/40 border-color border backdrop-blur-sm p-5 min-w-[400px] max-w-[400px]"
				style={{
					top: position.y + "px",
					left: position.x + "px",
					cursor: isDragging ? "grabbing" : "grab",
				}}
				onMouseDown={handleMouseDown}>
				<div className="text-white text-sm">
					<h3 className="font-bold mb-2">Websockets</h3>
					{Object.keys(connections).length === 0 ? (
						<div className="text-gray-400">
							No active WebSocket connections
						</div>
					) : (
						<ul className="space-y-1">
							{Object.entries(connections).map(
								([key, connection]) => (
									<li key={key} className="cursor-pointer">
										<div
											onClick={() =>
												setExpandedKeys((prev) => ({
													...prev,
													[`ws-${key}`]:
														!prev[`ws-${key}`],
												}))
											}>
											<span>
												{expandedKeys[`ws-${key}`]
													? "▼"
													: "►"}{" "}
												{key}
											</span>
										</div>
										{expandedKeys[`ws-${key}`] && (
											<pre className="pl-4 mt-1 text-xs text-gray-300 break-all whitespace-pre-wrap">
												{JSON.stringify(
													connection,
													null,
													2
												)}
											</pre>
										)}
									</li>
								)
							)}
						</ul>
					)}
					<h3 className="font-bold mb-2">Local Storage</h3>
					{Object.keys(localStorageItems).length === 0 ? (
						<div className="text-gray-400">
							No items in localStorage
						</div>
					) : (
						<ul className="space-y-1">
							{Object.keys(localStorageItems).map((key) => (
								<li key={key} className="cursor-pointer">
									<div
										onClick={() =>
											setExpandedKeys((prev) => ({
												...prev,
												[key]: !prev[key],
											}))
										}>
										<span>
											{expandedKeys[key] ? "▼" : "►"}{" "}
											{key}
										</span>
									</div>
									{expandedKeys[key] && (
										<pre className="pl-4 mt-1 text-xs text-gray-300 break-all whitespace-pre-wrap">
											{localStorageItems[key]}
										</pre>
									)}
								</li>
							))}
						</ul>
					)}
				</div>
			</div>
		</>
	);
};

export default DeveloperMenu;
