"use client";
import { useLocale } from "@/context/LocaleContext";
import React, { useEffect, useState } from "react";
import { Sidebar } from "../components/ui/Dashboard/SideBar";
import { Header } from "../components/ui/Dashboard/Header";
import Invoices from "./dashboardpages/Invoices";
import CompanySettings from "./dashboardpages/CompanySettings";
import Dashboard from "./dashboardpages/Dashboard";

function DashboardPage() {
    const { t } = useLocale();
    const [tab, setTab] = useState("Dashboard");
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
            const savedState = localStorage.getItem("sidebarCollapsed");
            if (savedState === "true") {
                setIsCollapsed(true);
            }
        }
    }, [mounted]);

    useEffect(() => {
        if (mounted) {
            localStorage.setItem("sidebarCollapsed", isCollapsed.toString());
        }
    }, [isCollapsed, mounted]);

    const renderContent = () => {
        switch (tab) {
            case t("dashboard.sidebar_invoices"):
                return <Invoices />;
            case t("dashboard.sidebar_company_settings"):
                return <CompanySettings />;
            case t("dashboard.sidebar_dashboard"):
                return <Dashboard />;
            default:
                return <div>404!!1! Please refresh the page</div>;
        }
    };

    return (
        <div className="flex h-screen">
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

export default DashboardPage;