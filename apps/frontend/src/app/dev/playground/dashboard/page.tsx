"use client";
import { Header } from "@/app/components/ui/Dashboard/Header";
import { Sidebar } from "@/app/components/ui/Dashboard/SideBar";
import { useLocale } from "@/context/LocaleContext";
import React, { useState, useEffect } from "react";

export default function DashboardPlayground() {
	const { t } = useLocale();
	const [isCollapsed, setIsCollapsed] = useState(() => {
		if (typeof window !== "undefined") {
			const savedState = localStorage.getItem("sidebarCollapsed");
			return savedState === "true";
		}
		return false;
	});

	const [tab, setTab] = useState("Dashboard");

	useEffect(() => {
		localStorage.setItem("sidebarCollapsed", isCollapsed.toString());
	}, [isCollapsed]);

	const renderContent = () => {
		if (tab.startsWith("Chat-")) {
			const chatId = tab.substring(5);
			return <ChatComponent chatId={chatId} />;
		}

		switch (tab) {
			case t("language.dashboard_sidebar_dashboard"):
				return <DashboardComponent />;
			case t("language.dashboard_sidebar_analytics"):
				return <AnalyticsComponent />;
			case t("language.dashboard_sidebar_products"):
				return <ProductsComponent />;
			default:
				return <DashboardComponent />;
		}
	};

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
					changeTab={(e) => setTab(e)}
					title={tab}
				/>
				<main className="flex-1 bg-color p-6 overflow-auto">
					{renderContent()}
				</main>
			</div>
		</div>
	);
}

// THESE ARE JUST PLACEHOLRDERS

const DashboardComponent = () => (
	<div>
		<h2 className="text-2xl font-bold mb-4">Dashboard Overview</h2>
		<p>Welcome to your dashboard!</p>
	</div>
);

const AnalyticsComponent = () => (
	<div>
		<h2 className="text-2xl font-bold mb-4">Analytics</h2>
		<p>Your analytics data will appear here.</p>
	</div>
);

const ProductsComponent = () => (
	<div>
		<h2 className="text-2xl font-bold mb-4">Products</h2>
		<p>Your products will be listed here.</p>
	</div>
);

const ChatComponent = ({ chatId }: { chatId: string }) => (
	<div>
		<h2 className="text-2xl font-bold mb-4">Chat {chatId}</h2>
		<p>This is chat conversation with ID: {chatId}</p>
	</div>
);
