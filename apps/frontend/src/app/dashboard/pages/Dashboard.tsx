import Calendar from "@/app/components/ui/Calender";
import Card from "@/app/components/ui/Card";
import CAreaChart from "@/app/components/ui/Charts/AreaChart";
import Progressbar from "@/app/components/ui/Progressbar";
import Seperator from "@/app/components/ui/Seperator";
import SimpleStat from "@/app/components/ui/SimpleStatComponent";
import { useLocale } from "@/context/LocaleContext";
import { Euro, FileText } from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";

export interface Invoice {
	id: number;
	invoiceNumber: string;
	customerId: string;
	dateIssued: number;
	dueDate: number;
	paid: boolean;
	amountGross: number;
	taxRate: number;
	paymentDate?: number;
	notes?: string;
}

function Dashboard() {
	const [invoices, setInvoices] = useState<Invoice[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { t } = useLocale();
	const redisServiceUrl =
		process.env.REDIS_SERVICE_URL || "http://localhost:8001";

	const fetchInvoices = async () => {
		setLoading(true);
		setError(null);
		const token = localStorage.getItem("DO_NOT_SHARE_SESSION_TOKEN");

		if (!token) {
			setError(t("errors.NO_TOKEN"));
			setLoading(false);
			return;
		}

		try {
			const response = await fetch(redisServiceUrl+"/api/invoices", {
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				throw new Error(
					`Error: ${response.status} ${response.statusText}`
				);
			}

			const data = await response.json();

			const transformedInvoices: Invoice[] = data.map(
				(invoice: {
					id: number;
					invoiceNumber: string;
					customer: { companyName: string };
					invoiceDate: string;
					dateOfService: string;
					notes?: string;
					noTax: boolean;
					paid: boolean;
					lineItems: Array<{
						unitPrice: number;
						quantity: number;
						taxRate: number;
					}>;
				}) => {
					const invoiceDate =
						new Date(invoice.invoiceDate).getTime() / 1000;
					const dueDate = new Date(invoiceDate * 1000);
					dueDate.setDate(dueDate.getDate() + 14);

					const grossAmount = invoice.lineItems.reduce(
						(
							sum: number,
							item: {
								unitPrice: number;
								quantity: number;
								taxRate: number;
							}
						) => {
							const itemTotal = item.unitPrice * item.quantity;
							const taxAmount = invoice.noTax
								? 0
								: (itemTotal * item.taxRate) / 100;
							return sum + itemTotal + taxAmount;
						},
						0
					);

					const taxRate =
						invoice.lineItems.length > 0
							? invoice.lineItems[0].taxRate
							: 0;

					return {
						id: invoice.id,
						invoiceNumber: invoice.invoiceNumber,
						customerId: invoice.customer.companyName,
						dateIssued: invoiceDate,
						dueDate: dueDate.getTime() / 1000,
						paid: invoice.paid,
						amountGross: grossAmount,
						taxRate: taxRate,
						notes: invoice.notes || undefined,
					};
				}
			);

			setInvoices(transformedInvoices);
		} catch (err) {
			console.error("Failed to fetch invoices:", err);
			setError(t("errors.FETCH_FAILED"));
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchInvoices();
	}, []);

	const totalInvoices = invoices.length;
	const totalGrossAmount = invoices
		.filter((inv) => inv.paid)
		.reduce((sum, inv) => sum + inv.amountGross, 0);
	const pendingAmount = invoices
		.filter((inv) => !inv.paid)
		.reduce((sum, inv) => sum + inv.amountGross, 0);

	const monthlyData = useMemo(() => {
		const currentDate = new Date();
		const currentYear = currentDate.getFullYear();
		const currentMonth = currentDate.getMonth();
		const months = [
			t("months.jan"),
			t("months.feb"),
			t("months.mar"),
			t("months.apr"),
			t("months.may"),
			t("months.jun"),
			t("months.jul"),
			t("months.aug"),
			t("months.sep"),
			t("months.oct"),
			t("months.nov"),
			t("months.dec"),
		];

		const data = [];
		for (let i = 0; i <= currentMonth; i++) {
			const monthInvoices = invoices.filter((invoice) => {
				const invoiceDate = new Date(invoice.dateIssued * 1000);
				return (
					invoiceDate.getFullYear() === currentYear &&
					invoiceDate.getMonth() === i
				);
			});

			const paidAmount = monthInvoices
				.filter((inv) => inv.paid)
				.reduce((sum, inv) => sum + inv.amountGross, 0);

			const pendingAmount = monthInvoices
				.filter((inv) => !inv.paid)
				.reduce((sum, inv) => sum + inv.amountGross, 0);

			const totalAmount = paidAmount + pendingAmount;

			data.push({
				name: months[i],
				value: Math.round(totalAmount * 100) / 100,
				second_value: Math.round(paidAmount * 100) / 100,
				third_value: Math.round(pendingAmount * 100) / 100,
			});
		}

		return data;
	}, [invoices]);

	const monthlyGoal = 20000;
	const currentProgress = totalGrossAmount;

	const userObj =
		localStorage && localStorage.getItem("USER_INFO")
			? JSON.parse(localStorage.getItem("USER_INFO") || "{}")
			: null;

	return (
		<div className="w-full h-full flex justify-center">
			<div className="w-full max-w-[1920px] h-full flex flex-col">
				{error && (
					<div className="card p-3 rounded-md mb-4 bg-red-50 border border-red-200">
						<span className="text-red-500">{error}</span>
						<button
							className="ml-2 btn-text-only"
							onClick={() => {
								setError(null);
								fetchInvoices();
							}}>
							{t("general.try_again")}
						</button>
					</div>
				)}
				<div className="flex-row flex items-center justify-between">
					<h1 className="text-nowrap">
						{t("general.message_welcome").replace(
							"%username",
							userObj?.firstname + " " + userObj?.lastname
						)}
						👋
					</h1>
					<span className="text-gray-500 text-sm md:block hidden">
						{t("dashboard.dashboard_info")}
					</span>
				</div>
				{/* <div className="w-full md:h-[300px] h-fit flex flex-row gap-2 flex-wrap md:flex-nowrap">
					<Card className="w-full md:w-3/4 md:h-full h-[300px] flex flex-col items-start justify-center">
						<h2>Company revenue this year</h2>
						<div className="w-full h-full -translate-x-5 mt-1">
							<CAreaChart
								data={monthlyData}
								colorTheme={"#2020ff"}
								areaStroke={"#5050ff"}
								valueName="Money"
								showYAxis
								endStopOpacity={0.6}
							/>
						</div>
					</Card>
					<Card className="flex flex-col space-x-10 w-full md:w-1/4 min-w-[200px] md:h-full h-[200px]">
						<h2>Invoice status</h2>
						<div className="w-full h-full translate-y-10 z-10">
							<CPieChart
								data={pieData}
								colors={pieColors}
								showTooltip
								endAngle={180}
							/>
						</div>
						<div className="flex flex-row justify-between px-10 z-[0] items-center md:-translate-y-10 -translate-y-15">
							<span>Unpaid</span>
							<span>Paid</span>
						</div>
					</Card>
				</div> */}
				<Seperator />
				<div className="flex flex-row flex-wrap xl:flex-nowrap gap-x-5">
					<div className="w-full max-w-[1200px] h-fit flex flex-row gap-2 flex-wrap md:flex-nowrap">
						<div className="w-full space-y-2 items-center mt-5">
							<h2>{t("dashboard.dashboard_appointments")}</h2>
							<div className="flex flex-row flex-wrap md:flex-nowrap items-start justify-between w-full gap-5">
								<div className="w-full md:w-fit h-fit flex items-center justify-center">
									<Calendar className="w-full" />
								</div>
								<div className="w-full min-w-[300px] max-h-[365px] overflow-y-scroll">
									<ul className="space-y-2">
										<li className="p-3 border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-900/20 rounded-md flex flex-col">
											<span className="font-semibold">
												Meeting with John Doe
											</span>
											<span className="text-sm text-gray-500 dark:text-gray-400">
												Today, 10:00 AM
											</span>
										</li>
										<Seperator text="Tomorrow" />
										<li className="p-3 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-md flex flex-col">
											<span className="font-semibold">
												Project Review
											</span>
											<span className="text-sm text-gray-500 dark:text-gray-400">
												2025-08-04, 2:00 PM
											</span>
										</li>
										<li className="p-3 border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 rounded-md flex flex-col">
											<span className="font-semibold">
												Client Call: Acme Corp
											</span>
											<span className="text-sm text-gray-500 dark:text-gray-400">
												2025-08-05, 4:30 PM
											</span>
										</li>
										<li className="p-3 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 rounded-md flex flex-col">
											<span className="font-semibold">
												Design Sync
											</span>
											<span className="text-sm text-gray-500 dark:text-gray-400">
												2025-08-05, 11:00 AM
											</span>
										</li>
										<Seperator text="Next days" />
										<li className="p-3 border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-900/20 rounded-md flex flex-col">
											<span className="font-semibold">
												Finance Review
											</span>
											<span className="text-sm text-gray-500 dark:text-gray-400">
												2025-08-06, 9:00 AM
											</span>
										</li>
										<li className="p-3 border-l-4 border-pink-500 bg-pink-50 dark:bg-pink-900/20 rounded-md flex flex-col">
											<span className="font-semibold">
												Team Standup
											</span>
											<span className="text-sm text-gray-500 dark:text-gray-400">
												2025-08-07, 10:00 AM
											</span>
										</li>
										<li className="p-3 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 rounded-md flex flex-col">
											<span className="font-semibold">
												Strategy Meeting
											</span>
											<span className="text-sm text-gray-500 dark:text-gray-400">
												2025-08-08, 3:00 PM
											</span>
										</li>
										<li className="p-3 border-l-4 border-teal-500 bg-teal-50 dark:bg-teal-900/20 rounded-md flex flex-col">
											<span className="font-semibold">
												Client Call: Beta Ltd
											</span>
											<span className="text-sm text-gray-500 dark:text-gray-400">
												2025-08-09, 1:30 PM
											</span>
										</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
					<div className="flex flex-col items-center justify-start gap-y-2 w-full">
						<h2 className="text-start w-full mt-5">
							{t("dashboard.dashboard_statistics")}
						</h2>
						<div className="w-full h-fit flex flex-row gap-2 flex-wrap md:flex-nowrap">
							{loading ? (
								<div className="w-full flex justify-center items-center py-8">
									<div className="border-[#825494] border-3 animate-spin w-[30px] h-[30px] rounded-full"></div>
									<span className="ml-2">
										{t(
											"dashboard.dashboard_loading_statistics"
										)}
										...
									</span>
								</div>
							) : (
								<>
									<SimpleStat
										icon={<FileText />}
										title={t("general.invoices")}
										data={totalInvoices}
										colorTheme="#be80d6ff"
										useCountUpAnimation={true}
										countUpDuration={1000}
										className="w-full"
									/>
									<SimpleStat
										icon={<Euro />}
										title={t("general.gross_amount")}
										data={totalGrossAmount}
										colorTheme="#56a356ff"
										formatCurrency
										useCountUpAnimation={true}
										countUpDuration={1200}
										className="w-full"
									/>
									<SimpleStat
										icon={<Euro />}
										title={t("general.pending_amount")}
										data={pendingAmount}
										colorTheme="#808080ff"
										formatCurrency
										useCountUpAnimation={true}
										countUpDuration={1400}
										className="w-full"
									/>
								</>
							)}
						</div>
						<div className="w-full h-fit flex flex-row gap-2 flex-wrap md:flex-nowrap">
							<Card className="w-full space-y-2">
								<h2>{t("dashboard.dashboard_monthly_goal")}</h2>
								<Progressbar
									current={currentProgress}
									goal={monthlyGoal}
									labelinside
									labelColor="#fff"
									color="#ee22ff"
									duration={0.3}
								/>
								<h3 className="mt-1">
									{currentProgress.toFixed(2)} / {monthlyGoal}{" "}
									€
								</h3>
							</Card>
						</div>
					</div>
				</div>
				<div className="w-full mt-5">
					<Card className="w-full h-[340px] flex flex-col items-start justify-center">
						<h2>{t("dashboard.dashboard_company_revenue")}</h2>
						<div className="w-full h-full -translate-x-5 mt-1">
							{loading ? (
								<div className="w-full h-full flex justify-center items-center">
									<div className="border-[#825494] border-3 animate-spin w-[30px] h-[30px] rounded-full"></div>
									<span className="ml-2">
										{t("dashboard.dashboard_loading_chart")}
										...
									</span>
								</div>
							) : (
								<CAreaChart
									data={monthlyData}
									colorTheme={"#2020ff"}
									areaStroke={"#5050ff"}
									valueName={t("general.money")}
									showYAxis
									endStopOpacity={0.6}
								/>
							)}
						</div>
					</Card>
				</div>
			</div>
		</div>
	);
}

export default Dashboard;
