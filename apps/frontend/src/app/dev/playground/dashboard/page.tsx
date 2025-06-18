"use client";
import { Header } from "@/app/components/ui/Dashboard/Header";
import { Sidebar } from "@/app/components/ui/Dashboard/SideBar";
import React, {  useState } from "react";

export default function DashboardPlayground() {
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [tab, setTab] = useState("Dashboard");

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
