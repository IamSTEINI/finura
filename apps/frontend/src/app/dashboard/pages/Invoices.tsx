"use client";
import DropDown from "@/app/components/ui/DropDown";
import SimpleStat from "@/app/components/ui/SimpleStatComponent";
import ToolTip from "@/app/components/ui/Tooltip";
import InvoiceForm, { InvoiceDetails } from "@/app/components/ui/InvoiceForm";
import TimestampToTime from "@/app/components/utils/timestampToTime";
import {
	Euro,
	FileInput,
	FilePen,
	FileText,
	FileWarning,
	FilterX,
	RefreshCcwIcon,
	Trash,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useLocale } from "@/context/LocaleContext";
import { useNotification } from "@/context/NotificationContext";

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

function Invoices() {
	const [selectedTemplate, setSelectedTemplate] = useState("");
	const [selectedFilter, setSelectedFilter] = useState("");
	const [invoices, setInvoices] = useState<Invoice[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [newInvoiceWindow, setNewInvoiceWindow] = useState(false);
	const [selectedCustomer, setSelectedCustomer] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const INVOICES_PER_PAGE = 10;
	const { t } = useLocale();
	const { addNotification } = useNotification();
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

	React.useEffect(() => {
		fetchInvoices();
	}, []);

	const filteredInvoices = useMemo(() => {
		let filtered = [...invoices];
		const now = Math.floor(Date.now() / 1000);
		const currentDate = new Date();
		const currentMonth = currentDate.getMonth();
		const currentYear = currentDate.getFullYear();
		const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
		const lastMonthYear =
			currentMonth === 0 ? currentYear - 1 : currentYear;
		const startOfWeek = new Date(currentDate);
		startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
		const endOfWeek = new Date(startOfWeek);
		endOfWeek.setDate(startOfWeek.getDate() + 6);
		const startOfWeekTimestamp = Math.floor(startOfWeek.getTime() / 1000);
		const endOfWeekTimestamp = Math.floor(endOfWeek.getTime() / 1000);

		switch (selectedFilter) {
			case "byc":
				if (selectedCustomer) {
					filtered = filtered.filter(
						(inv) => inv.customerId === selectedCustomer
					);
				}
				break;
			case "paid":
				filtered = filtered.filter((inv) => inv.paid);
				break;
			case "unpaid":
				filtered = filtered.filter((inv) => !inv.paid);
				break;
			case "overdue":
				filtered = filtered.filter(
					(inv) => !inv.paid && now > inv.dueDate
				);
				break;
			case "due_week":
				filtered = filtered.filter(
					(inv) =>
						inv.dueDate >= startOfWeekTimestamp &&
						inv.dueDate <= endOfWeekTimestamp
				);
				break;
			case "this_month":
				filtered = filtered.filter((inv) => {
					const date = new Date(inv.dateIssued * 1000);
					return (
						date.getMonth() === currentMonth &&
						date.getFullYear() === currentYear
					);
				});
				break;
			case "last_month":
				filtered = filtered.filter((inv) => {
					const date = new Date(inv.dateIssued * 1000);
					return (
						date.getMonth() === lastMonth &&
						date.getFullYear() === lastMonthYear
					);
				});
				break;
			case "high_value":
				filtered = filtered.filter((inv) => inv.amountGross > 1000);
				break;
			case "low_value":
				filtered = filtered.filter((inv) => inv.amountGross < 500);
				break;
		}
		return filtered.sort((a, b) => b.dateIssued - a.dateIssued);
	}, [invoices, selectedFilter, selectedCustomer]);

	const customers = useMemo(() => {
		const uniqueCustomers = [
			...new Set(invoices.map((inv) => inv.customerId)),
		];
		return uniqueCustomers.map((customer) => ({
			label: customer,
			value: customer,
		}));
	}, [invoices]);

	const totalPages = Math.ceil(filteredInvoices.length / INVOICES_PER_PAGE);
	const paginatedInvoices = useMemo(() => {
		const startIndex = (currentPage - 1) * INVOICES_PER_PAGE;
		return filteredInvoices.slice(
			startIndex,
			startIndex + INVOICES_PER_PAGE
		);
	}, [filteredInvoices, currentPage]);

	const totalInvoices = invoices.length;
	const totalGrossAmount = Number(
		invoices
			.filter((inv) => inv.paid)
			.reduce((sum, inv) => sum + inv.amountGross, 0)
			.toFixed(3)
	);

	const pendingAmount = invoices
		.filter((inv) => !inv.paid)
		.reduce((sum, inv) => sum + inv.amountGross, 0);

	const handleFilterChange = (value: string) => {
		setSelectedFilter(value);
		setCurrentPage(1);
		setSelectedCustomer("");
	};

	const handleInvoiceSubmit = async (invoiceData: InvoiceDetails) => {
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
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(invoiceData),
			});

			if (!response.ok) {
				throw new Error(
					`Error: ${response.status} ${response.statusText}`
				);
			}

			const result = await response.json();
			console.log("Invoice created:", result);

			fetchInvoices();
			setNewInvoiceWindow(false);
		} catch (err) {
			console.error("Failed to create invoice:", err);
			setError(t("errors.CREATION_FAILED"));
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteInvoice = async (invoiceId: number) => {
		if (!confirm(t("invoices.confirmation"))) {
			return;
		}

		setLoading(true);
		setError(null);
		const token = localStorage.getItem("DO_NOT_SHARE_SESSION_TOKEN");

		if (!token) {
			setError(t("errors.NO_TOKEN"));
			setLoading(false);
			return;
		}

		try {
			const response = await fetch(
				redisServiceUrl+`/api/invoices/${invoiceId}`,
				{
					method: "DELETE",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				}
			);

			if (!response.ok) {
				throw new Error(
					`Error: ${response.status} ${response.statusText}`
				);
			}

			const result = await response.json();
			console.log("Invoice deleted:", result);
			addNotification(t("invoices.deleted_invoice"), "FINURA")
			fetchInvoices();
		} catch (err) {
			console.error("Failed to delete invoice:", err);
			setError(t("errors.FETCH_FAILED"));
		} finally {
			setLoading(false);
		}
	};

	//! TAX NUMBER, THE OWN ADDRESS WILL BE ADDED IN CREATION OF IT, GETTING IT FROM THE API DIRECTLY
	//! ALSO "PREPARE" THAT NEW INVOICE BY ADDING AN ID DIRECTLY, BUT CHECK THE EXISTING ONES

	return (
		<div className="w-full h-full flex flex-col">
			{error && (
				<motion.div
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					className="card p-3 rounded-md mb-4">
					{error}
					<button
						className="ml-2"
						onClick={() => {
							setError(null);
							fetchInvoices();
						}}>
						{t("general.try_again")}
					</button>
				</motion.div>
			)}

			<motion.div
				initial={{ opacity: 0, y: -10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.25 }}
				className="w-full pb-5 flex flex-row lg:flex-nowrap flex-wrap items-center gap-2">
				<SimpleStat
					icon={<FileText />}
					title={t("invoices.title")}
					data={totalInvoices}
					colorTheme="#be80d6ff"
					useCountUpAnimation={true}
					countUpDuration={1000}
					className="md:w-[160px] lg:w-1/3 w-full"
				/>
				<SimpleStat
					icon={<Euro />}
					title={t("invoices.gross_amount")}
					data={totalGrossAmount}
					colorTheme="#56a356ff"
					formatCurrency
					useCountUpAnimation={true}
					countUpDuration={1200}
					className="md:w-[160px] lg:w-1/3 w-full"
				/>
				<SimpleStat
					icon={<Euro />}
					title={t("invoices.pending_amount")}
					data={pendingAmount}
					colorTheme="#808080ff"
					formatCurrency
					useCountUpAnimation={true}
					countUpDuration={1400}
					className="md:w-[160px] lg:w-1/3 w-full"
				/>
			</motion.div>
			<motion.div
				initial={{ opacity: 0, y: -10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.25, delay: 0.25 }}
				className="border-b border-color mb-2 pb-2 flex flex-row flex-wrap items-center justify-between">
				<h2>{t("invoices.title")} ({filteredInvoices.length})</h2>
				<div className="flex flex-row items-center justify-center space-x-2 z-[0]">
					{selectedFilter !== "" && (
						<FilterX
							onClick={() => {
								setSelectedFilter("");
								setSelectedCustomer("");
							}}
							className="cursor-pointer hover:opacity-100"
							size={22}
							opacity={0.5}
						/>
					)}
					<DropDown
						data={[
							{ label: t("invoices.by_customer"), value: "byc" },
							{ label: t("invoices.paid_invoices"), value: "paid" },
							{ label: t("invoices.unpaid_invoices"), value: "unpaid" },
							{ label: t("invoices.overdue"), value: "overdue" },
							{ label: t("invoices.due_this_week"), value: "due_week" },
							{ label: t("invoices.this_month"), value: "this_month" },
							{ label: t("invoices.last_month"), value: "last_month" },
							{
								label: t("invoices.high_value"),
								value: "high_value",
							},
							{ label: t("invoices.low_value"), value: "low_value" },
						]}
						selected={selectedFilter}
						onChange={handleFilterChange}
						searchable={true}
						placeholder={t("general.filter")}
					/>
					{selectedFilter === "byc" && (
						<DropDown
							data={customers}
							selected={selectedCustomer}
							onChange={setSelectedCustomer}
							searchable={true}
							placeholder={t("invoices.select_customer")}
						/>
					)}
					{selectedTemplate != "" && (
						<RefreshCcwIcon
							onClick={() => setSelectedTemplate("")}
							className="cursor-pointer hover:opacity-100"
							size={22}
							opacity={0.5}
						/>
					)}
					<DropDown
						data={[{ label: "Template 1", value: "templateID" }]}
						selected={selectedTemplate}
						onChange={setSelectedTemplate}
						searchable={true}
						placeholder={t("invoices.choose_template")}
					/>
					<button
						onClick={() => setNewInvoiceWindow(true)}
						className="px-4 py-2 rounded hover:opacity-90">
						{selectedTemplate ? t("invoices.create_invoice") : t("invoices.new_invoice")}
					</button>
				</div>
			</motion.div>
			<motion.table
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.25, delay: 0.25 }}>
				<thead>
					<tr>
						<th className="text-nowrap">{t("invoices.invoice_id")}</th>
						<th className="text-nowrap">{t("invoices.customer")}</th>
						<th className="text-nowrap">{t("invoices.date_issued")}</th>
						<th className="text-nowrap">{t("invoices.due_date")}</th>
						<th className="text-nowrap">{t("invoices.amount_gross")}</th>
						<th className="text-nowrap">{t("invoices.paid")}</th>
						<th className="text-nowrap">{t("invoices.actions")}</th>
					</tr>
				</thead>
				<tbody>
					{loading ? (
						<tr>
							<td colSpan={7} className="text-center py-4">
								<div className="flex justify-center items-center">
									<div className="border-[#825494] border-3 animate-spin w-[30px] h-[30px] rounded-full"></div>
									<span className="ml-2">
										{t("invoices.loading_invoices")}
									</span>
								</div>
							</td>
						</tr>
					) : paginatedInvoices.length === 0 ? (
						<tr>
							<td colSpan={7} className="text-center py-4">
								{t("invoices.no_invoices_found")}
								{selectedFilter &&
									t("invoices.try_changing_filter")}
								<button
								className="btn-text-only"
									onClick={() => setNewInvoiceWindow(true)}>
									{t("invoices.create_new_invoice")}
								</button>
							</td>
						</tr>
					) : (
						paginatedInvoices.map((invoice, index) => (
							<tr key={index}>
								<td className="bg-blue-500/10">
									{invoice.invoiceNumber}
								</td>
								<td className="text-nowrap">
									{invoice.customerId}
								</td>
								<td
									className="text-nowrap"
									title={new Date(
										invoice.dateIssued * 1000
									).toLocaleString()}>
									{
										<TimestampToTime
											timestamp={
												invoice.dateIssued * 1000
											}
										/>
									}
								</td>
								<td
									className="text-nowrap"
									title={new Date(
										invoice.dueDate * 1000
									).toLocaleString()}>
									{
										<TimestampToTime
											timestamp={invoice.dueDate * 1000}
										/>
									}
								</td>
								<td className="text-nowrap">
									{invoice.amountGross.toFixed(2)}
								</td>
								<td
									title={
										invoice.paymentDate
											? new Date(
													invoice.paymentDate * 1000
											  ).toLocaleString()
											: t("invoices.not_paid_yet")
									}
									className={
										invoice.paid
											? "bg-green-500/30"
											: "bg-red-500/30"
									}>
									{invoice.paid ? t("general.yes") : t("general.no")}
								</td>
								<td className="w-fit flex flex-row items-center justify-center">
									{!invoice.paid &&
									Math.floor(Date.now() / 1000) >
										invoice.dueDate ? (
										<ToolTip
											tooltip={t("invoices.overdue")}
											direction="top">
											<button className="btn-text-only-l btn-sp flex flex-row items-center justify-start gap-x-5 opacity-75 hover:opacity-100 transition-all ease-in">
												<FileWarning
													size={18}
													color="#dd3333ff"
												/>
											</button>
										</ToolTip>
									) : (
										<ToolTip
											tooltip={
												invoice.paid
													? t("invoices.paid")
													: t("invoices.not_due_yet")
											}
											direction="top">
											<button
												disabled
												className="btn-text-only-l btn-sp flex flex-row items-center justify-start gap-x-5 opacity-75 hover:opacity-100 transition-all ease-in">
												<FileWarning
													size={18}
													opacity={0.5}
												/>
											</button>
										</ToolTip>
									)}
									<ToolTip tooltip={t("general.delete")} direction="top">
										<button
											onClick={() =>
												handleDeleteInvoice(invoice.id)
											}
											disabled={loading}
											className="btn-text-only-l btn-sp flex flex-row items-center justify-start gap-x-5 opacity-75 hover:opacity-100 transition-all ease-in hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed">
											<Trash size={18} />
										</button>
									</ToolTip>

									<ToolTip tooltip={t("general.notes")} direction="top">
										<button className="btn-text-only-l btn-sp flex flex-row items-center justify-start gap-x-5 opacity-75 hover:opacity-100 transition-all ease-in">
											<FilePen size={18} />
										</button>
									</ToolTip>

									<ToolTip tooltip={t("general.open")} direction="top">
										<button className="btn-text-only-l btn-sp flex flex-row items-center justify-start gap-x-5 opacity-75 hover:opacity-100 transition-all ease-in">
											<FileInput size={18} />
										</button>
									</ToolTip>
								</td>
							</tr>
						))
					)}
				</tbody>
			</motion.table>

			{totalPages > 1 && (
				<div className="mt-4 flex justify-center items-center gap-2">
					<button
						onClick={() =>
							setCurrentPage((prev) => Math.max(1, prev - 1))
						}
						disabled={currentPage === 1}
						className={`p-2 btn-text-only-l rounded ${
							currentPage === 1
								? "opacity-50"
								: "hover:bg-gray-200"
						}`}>
						<ChevronLeft size={18} />
					</button>
					<span>
						{t("general.page")} {currentPage} {t("general.of")} {totalPages}
					</span>
					<button
						onClick={() =>
							setCurrentPage((prev) =>
								Math.min(totalPages, prev + 1)
							)
						}
						disabled={currentPage === totalPages}
						className={`p-2 btn-text-only-l rounded ${
							currentPage === totalPages
								? "opacity-50"
								: "hover:bg-gray-200"
						}`}>
						<ChevronRight size={18} />
					</button>
				</div>
			)}

			<InvoiceForm
				isOpen={newInvoiceWindow}
				onClose={() => setNewInvoiceWindow(false)}
				onSubmit={handleInvoiceSubmit}
				invoices={invoices}
			/>
		</div>
	);
}

export default Invoices;
