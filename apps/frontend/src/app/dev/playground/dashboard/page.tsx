"use client";
import { Header } from "@/app/components/ui/Dashboard/Header";
import { Sidebar } from "@/app/components/ui/Dashboard/SideBar";
import React, { useState, useEffect } from "react";

export default function DashboardPlayground() {
	const [isCollapsed, setIsCollapsed] = useState(() => {
		if (typeof window !== 'undefined') {
			const savedState = localStorage.getItem('sidebarCollapsed');
			return savedState === 'true';
		}
		return false;
	});
	
	const [tab, setTab] = useState("Dashboard");

	useEffect(() => {
		localStorage.setItem('sidebarCollapsed', isCollapsed.toString());
	}, [isCollapsed]);

	return (
		<div className="flex h-screen bg-gray-100">
			<Sidebar
				isCollapsed={isCollapsed}
				setIsCollapsed={setIsCollapsed}
				onChange={(e) => setTab(e)}
				currentSelectedTab={tab}
			/>

			<div className="flex-1 flex flex-col overflow-hidden">
				<Header
					isCollapsed={isCollapsed}
					setIsCollapsed={setIsCollapsed}
					title="Example"
				/>
				<main className="flex-1 bg-color p-6 overflow-auto">
					<div>
						<span>CONTENT</span>
					</div>
				</main>
			</div>
		</div>
	);
}
