import React, { useState, useEffect } from "react";
import Card from "./Card";
import Seperator from "./Seperator";
import ChildrenInput from "./ChildrenInput";
import InvoiceLineItem, { LineItem } from "./InvoiceLineItem";
import { motion } from "framer-motion";
import {
	X,
	User2,
	Hash,
	Calendar,
	Map,
	MapPin,
	IdCard,
	Book,
	User,
} from "lucide-react";
import ToolTip from "./Tooltip";
import { Invoice } from "@/app/dashboard/pages/Invoices";
import { useLocale } from "@/context/LocaleContext";

export interface InvoiceContact {
	companyName: string;
	address: string;
	postalCodeCity: string;
	vatId: string;
}

export interface InvoiceDetails {
	customerNumber?: string;
	invoiceDate: string;
	dateOfService: string;
	customer: {
		companyName: string;
		address: string;
		postalCodeCity: string;
		contactPerson?: string;
		vatId?: string;
	};
	seller: {
		companyName: string;
		address: string;
		postalCodeCity: string;
		taxNumber: string; // Steuernummer (mandatory for German invoices)
		vatId: string; // Umsatzsteuer-Identifikationsnummer (mandatory for businesses, especially cross-border EU)
		managingDirector?: string; // Geschäftsführer (mandatory for GmbH)
		commercialRegister?: string; // Handelsregisternummer (mandatory for GmbH)
		email?: string;
		phone?: string;
		website?: string;
		bankName: string;
		iban: string;
		bic: string;
	};
	lineItems: LineItem[];
	notes?: string;
	paymentTerms: string;
	noTax: boolean;
	smallBusinessTerm?: string;
	retentionOfTitle?: string;
}

interface InvoiceFormProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (invoiceData: InvoiceDetails) => void;
	invoices: Invoice[];
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({
	isOpen,
	onClose,
	onSubmit,
}) => {
	const { t } = useLocale();
	const [grossAmount, setGrossAmount] = useState<number>(0);
	const [netAmount, setNetAmount] = useState<number>(0);
	const [customerName, setCustomerName] = useState("");
	const [customerAddress, setCustomerAddress] = useState("");
	const [zipCode, setZipCode] = useState("");
	const [vatId, setVatId] = useState("");
	const [customerContactPerson, setCustomerContactPerson] = useState("");
	const [customerNumber, setCustomerNumber] = useState("");
	const [invoiceDate, setInvoiceDate] = useState("");
	const [dateOfService, setDateOfService] = useState("");
	const [note, setNote] = useState("");
	const [isNoTax, setNoTax] = useState(false);
	const [contactMenu, setContactMenu] = useState(false);

	const [sellerDetails] = useState({
		companyName: "Your Company GmbH",
		address: "Musterstraße 123",
		postalCodeCity: "10115 Berlin",
		taxNumber: "18/123/45678",
		vatId: "DE123456789",
		managingDirector: "Max Mustermann",
		commercialRegister: "HRB 123456 B",
		email: "contact@yourcompany.de",
		phone: "+49 30 123456789",
		website: "www.yourcompany.de",
		bankName: "Deutsche Bank",
		iban: "DE89 3704 0044 0532 0130 00",
		bic: "DEUTDEFFXXX",
	});

	const [paymentTermsObj, setPaymentTermsObj] = useState({
		goodsRemain: false,
		paymentDue: false,
		paymentDays: 30,
		lateInterest: false,
		noPartial: false,
	});
	const [retentionOfTitle, setRetentionOfTitle] = useState("");
	const [additionalTerms, setAdditionalTerms] = useState("");

	const [invoiceContacts, setInvoiceContacts] = useState<InvoiceContact[]>(
		[]
	);
	const [lineItems, setLineItems] = useState<LineItem[]>([
		{ name: "", description: "", unitPrice: 0, taxRate: 0, quantity: 1 },
	]);

	const calculateTotals = (items: LineItem[], noTax: boolean) => {
		const net = items.reduce((sum, item) => sum + item.unitPrice, 0);
		const gross = noTax
			? net
			: items.reduce(
					(sum, item) =>
						sum + item.unitPrice * (1 + item.taxRate / 100),
					0
			  );
		setNetAmount(net);
		setGrossAmount(gross);
		return { net, gross };
	};

	useEffect(() => {
		calculateTotals(lineItems, isNoTax);
	}, [isNoTax, lineItems]);

	useEffect(() => {
		const exampleContact: InvoiceContact = {
			companyName: "Example Corp",
			address: "123 Example St",
			postalCodeCity: "12345 Example City",
			vatId: "EX123456789",
		};
		setInvoiceContacts([exampleContact]);
	}, []);

	const addLineItem = () => {
		setLineItems([
			...lineItems,
			{
				name: "",
				description: "",
				unitPrice: 0,
				taxRate: 0,
				quantity: 0,
			},
		]);
	};

	const removeLineItem = (index: number) => {
		const newItems = [...lineItems];
		newItems.splice(index, 1);
		setLineItems(newItems);
	};

	const duplicateLineItem = (index: number) => {
		const newItems = [...lineItems];
		newItems.splice(index + 1, 0, { ...lineItems[index] });
		setLineItems(newItems);
	};

	const updateLineItem = (
		index: number,
		field: keyof LineItem,
		value: string | number
	) => {
		const newItems = [...lineItems];
		newItems[index] = { ...newItems[index], [field]: value };
		setLineItems(newItems);
	};

	const handleSubmit = () => {
		const paymentTermsString = generatePaymentTermsString();

		const invoiceData: InvoiceDetails = {
			customerNumber: customerNumber || undefined,
			invoiceDate: invoiceDate,
			dateOfService: dateOfService,
			customer: {
				companyName: customerName,
				address: customerAddress,
				postalCodeCity: zipCode,
				contactPerson: customerContactPerson || undefined,
				vatId: vatId || undefined,
			},
			seller: {
				companyName: sellerDetails.companyName,
				address: sellerDetails.address,
				postalCodeCity: sellerDetails.postalCodeCity,
				taxNumber: sellerDetails.taxNumber,
				vatId: sellerDetails.vatId,
				managingDirector: sellerDetails.managingDirector,
				commercialRegister: sellerDetails.commercialRegister,
				email: sellerDetails.email,
				phone: sellerDetails.phone,
				website: sellerDetails.website,
				bankName: sellerDetails.bankName,
				iban: sellerDetails.iban,
				bic: sellerDetails.bic,
			},
			lineItems,
			notes: note || undefined,
			paymentTerms: paymentTermsString,
			noTax: isNoTax,
			smallBusinessTerm: additionalTerms || undefined,
			retentionOfTitle: retentionOfTitle || undefined,
		};
		onSubmit(invoiceData);
		handleClose();
	};

	const handleSaveAsTemplate = () => {
		const paymentTermsString = generatePaymentTermsString();

		const invoiceData: InvoiceDetails = {
			customerNumber: customerNumber || undefined,
			invoiceDate: invoiceDate,
			dateOfService: dateOfService,
			customer: {
				companyName: customerName,
				address: customerAddress,
				postalCodeCity: zipCode,
				contactPerson: customerContactPerson || undefined,
				vatId: vatId || undefined,
			},
			seller: {
				companyName: sellerDetails.companyName,
				address: sellerDetails.address,
				postalCodeCity: sellerDetails.postalCodeCity,
				taxNumber: sellerDetails.taxNumber,
				vatId: sellerDetails.vatId,
				managingDirector: sellerDetails.managingDirector,
				commercialRegister: sellerDetails.commercialRegister,
				email: sellerDetails.email,
				phone: sellerDetails.phone,
				website: sellerDetails.website,
				bankName: sellerDetails.bankName,
				iban: sellerDetails.iban,
				bic: sellerDetails.bic,
			},
			lineItems,
			notes: note || undefined,
			paymentTerms: paymentTermsString,
			noTax: isNoTax,
			smallBusinessTerm: additionalTerms || undefined,
			retentionOfTitle: retentionOfTitle || undefined,
		};
		console.log(
			"Invoice Template Data:",
			JSON.stringify(invoiceData, null, 2)
		);
	};

	const generatePaymentTermsString = () => {
		const terms = [];

		if (paymentTermsObj.goodsRemain) {
			terms.push("Goods remain ours until full payment");
		}

		if (paymentTermsObj.paymentDue) {
			terms.push(
				`Payment due within ${paymentTermsObj.paymentDays} days`
			);
		}

		if (paymentTermsObj.lateInterest) {
			terms.push("Late payment incurs interest");
		}

		if (paymentTermsObj.noPartial) {
			terms.push("Partial payments not accepted");
		}

		return terms.join(". ") || "Payment due on receipt";
	};

	const resetForm = () => {
		setCustomerName("");
		setCustomerAddress("");
		setZipCode("");
		setVatId("");
		setCustomerContactPerson("");
		setCustomerNumber("");

		setInvoiceDate("");
		setDateOfService("");
		setNote("");

		setLineItems([
			{
				name: "",
				description: "",
				unitPrice: 0,
				taxRate: 0,
				quantity: 0,
			},
		]);

		setNetAmount(0);
		setGrossAmount(0);
		setNoTax(false);

		setPaymentTermsObj({
			goodsRemain: false,
			paymentDue: false,
			paymentDays: 30,
			lateInterest: false,
			noPartial: false,
		});
		setRetentionOfTitle("");
		setAdditionalTerms("");

		setContactMenu(false);
	};

	const handleContactClick = (contact: InvoiceContact) => {
		setCustomerName(contact.companyName);
		setCustomerAddress(contact.address);
		setZipCode(contact.postalCodeCity);
		setVatId(contact.vatId);
		setContactMenu(false);
	};

	const handleClose = () => {
		resetForm();
		onClose();
	};

	if (!isOpen) return null;

	return (
		<motion.div
			className="w-full backdrop-brightness-[80%] backdrop-blur-sm rounded-md h-full fixed flex justify-center items-center z-50 overflow-hidden"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.3 }}
			onClick={handleClose}>
			<motion.div
				initial={{ opacity: 0, y: 50 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: 20 }}
				transition={{
					type: "spring",
					damping: 25,
					stiffness: 300,
				}}
				onClick={(e) => e.stopPropagation()}
				className="w-full h-full flex items-center justify-center">
				<Card className="w-[80%] max-w-[900px] md:w-3/4 -translate-x-22 max-h-[1000px] overflow-y-scroll">
					<div className="flex flex-row justify-between items-center pb-1">
						<h2>{t("invoices.form.create_new_invoice")}</h2>
						<X
							onClick={handleClose}
							opacity={0.5}
							className="hover:opacity-100 transition-all ease-in cursor-pointer duration-100"
						/>
					</div>
					<Seperator />
					<div className="w-full h-full flex flex-col my-2 gap-y-2">
						<h3 className="font-medium mb-1">
							{t("invoices.form.customer_information")}
						</h3>
						<div className="flex flex-row items-center gap-x-2.5">
							<div className="w-fit h-full flex items-center justify-center mt-5.5">
								<ToolTip tooltip={t("invoices.form.contacts")} direction="top">
									<button
										onClick={() => setContactMenu(true)}
										className="btn-text-only-l w-fit h-fit">
										<Book size={22} />
									</button>
								</ToolTip>
							</div>
							<div className="w-1/2">
								<span className="opacity-75">
									{t("invoices.form.customer_company_name")}
								</span>
								<ChildrenInput
									placeholder="Kojima Ltd"
									value={customerName}
									onChange={(e) =>
										setCustomerName(e.target.value)
									}>
									<User2 size={18} opacity={0.5} />
								</ChildrenInput>
							</div>
							<div className="w-1/4">
								<span className="opacity-75">
									{t("invoices.form.customer_number")}
								</span>
								<ChildrenInput
									placeholder="C12345"
									value={customerNumber}
									onChange={(e) =>
										setCustomerNumber(e.target.value)
									}>
									<Hash size={18} opacity={0.5} />
								</ChildrenInput>
							</div>
							<div className="w-1/4">
								<span className="opacity-75">
									{t("invoices.form.contact_person")}
								</span>
								<ChildrenInput
									placeholder="John Doe"
									value={customerContactPerson}
									onChange={(e) =>
										setCustomerContactPerson(e.target.value)
									}>
									<User size={18} opacity={0.5} />
								</ChildrenInput>
							</div>
						</div>
						<div className="w-full flex flex-row items-center justify-between gap-x-2.5 mt-2">
							<div className="w-1/2">
								<span className="opacity-75">
									{t("invoices.form.invoice_date")}
								</span>
								<ChildrenInput
									placeholder="2025-08-03"
									value={invoiceDate}
									onChange={(e) =>
										setInvoiceDate(e.target.value)
									}>
									<Calendar size={18} opacity={0.5} />
								</ChildrenInput>
							</div>
							<div className="w-1/2">
								<span className="opacity-75">
									{t("invoices.form.date_of_service")}
								</span>
								<ChildrenInput
									placeholder="2025-08-01"
									value={dateOfService}
									onChange={(e) =>
										setDateOfService(e.target.value)
									}>
									<Calendar size={18} opacity={0.5} />
								</ChildrenInput>
							</div>
						</div>

						<div className="w-full flex flex-row items-center justify-between gap-x-2.5">
							<div className="w-1/2">
								<span className="opacity-75">
									{t("invoices.form.customer_address")}
								</span>
								<ChildrenInput
									placeholder="2-1-9 Sōgō, Shibuya-ku"
									value={customerAddress}
									onChange={(e) =>
										setCustomerAddress(e.target.value)
									}>
									<Map size={18} opacity={0.5} />
								</ChildrenInput>
							</div>
							<div className="w-1/2 flex flex-row items-center justify-between gap-x-2.5">
								<div className="w-1/2">
									<span className="opacity-75">
										{t("invoices.form.zip_code_city")}
									</span>
									<ChildrenInput
										placeholder="XXXXX City"
										value={zipCode}
										onChange={(e) =>
											setZipCode(e.target.value)
										}>
										<MapPin size={18} opacity={0.5} />
									</ChildrenInput>
								</div>
								<div className="w-1/2">
									<span className="opacity-75">{t("invoices.form.vat_id")}</span>
									<ChildrenInput
										placeholder="XXXXX"
										value={vatId}
										onChange={(e) => {
											const value = e.target.value;
											const formatted = value
												.replace(/[^A-Z0-9\-]/gi, "")
												.toUpperCase();
											setVatId(formatted);
										}}
										maxLength={15}>
										<IdCard size={18} opacity={0.5} />
									</ChildrenInput>
								</div>
							</div>
						</div>

						<div className="mt-4">
							<div className="flex justify-between items-center mb-2">
								<h3 className="font-medium">{t("invoices.form.items")}</h3>
							</div>

							<div className="max-h-[400px] overflow-y-auto pr-1">
								{lineItems.map((item, index) => (
									<InvoiceLineItem
										key={index}
										item={item}
										index={index}
										onUpdate={updateLineItem}
										onRemove={removeLineItem}
										onDuplicate={duplicateLineItem}
										canRemove={lineItems.length > 1}
									/>
								))}
							</div>

							<button
								onClick={addLineItem}
								className="mt-2 py-2 px-4 btn-border-only rounded-md flex items-center justify-center w-full">
								<span className="mr-1">+</span> {t("invoices.form.add_item")}
							</button>
						</div>
						<div>
							<span className="opacity-75">{t("invoices.form.notes")}</span>
							<textarea
								value={note}
								maxLength={300}
								onChange={(e) => setNote(e.target.value)}
								placeholder={t("invoices.form.notes_placeholder")}
								className="input-wrapper rounded-md w-full max-h-[300px] min-h-[44px]"
								rows={2}
							/>
						</div>
						<div>
							<span className="opacity-75">{t("invoices.form.payment_terms")}</span>
							<div className="w-full flex flex-col gap-y-2 items-start justify-center">
								<label className="flex items-center">
									<input
										type="checkbox"
										className="mr-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
										checked={paymentTermsObj.goodsRemain}
										onChange={(e) =>
											setPaymentTermsObj((pt) => ({
												...pt,
												goodsRemain: e.target.checked,
											}))
										}
									/>
									<span className="opacity-75 mt-3">
										{t("invoices.form.goods_remain")}
									</span>
								</label>
								<label className="flex items-center">
									<input
										type="checkbox"
										className="mr-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
										checked={paymentTermsObj.paymentDue}
										onChange={(e) =>
											setPaymentTermsObj((pt) => ({
												...pt,
												paymentDue: e.target.checked,
											}))
										}
									/>
									<span className="opacity-75 mt-3 mr-2">
										{t("invoices.form.payment_due_within")}
									</span>
									<input
										type="number"
										min={1}
										max={365}
										value={paymentTermsObj.paymentDays}
										onChange={(e) =>
											setPaymentTermsObj((pt) => ({
												...pt,
												paymentDays: Number(
													e.target.value
												),
											}))
										}
										className="w-16 px-2 py-1 border rounded mr-2 h-8"
										style={{ marginTop: "0.75rem" }}
									/>
									<span className="opacity-75 mt-3">
										{t("invoices.form.days")}
									</span>
								</label>
								<label className="flex items-center">
									<input
										type="checkbox"
										className="mr-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
										checked={paymentTermsObj.lateInterest}
										onChange={(e) =>
											setPaymentTermsObj((pt) => ({
												...pt,
												lateInterest: e.target.checked,
											}))
										}
									/>
									<span className="opacity-75 mt-3">
										{t("invoices.form.late_payment_interest")}
									</span>
								</label>
								<label className="flex items-center">
									<input
										type="checkbox"
										className="mr-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
										checked={paymentTermsObj.noPartial}
										onChange={(e) =>
											setPaymentTermsObj((pt) => ({
												...pt,
												noPartial: e.target.checked,
											}))
										}
									/>
									<span className="opacity-75 mt-3">
										{t("invoices.form.no_partial_payments")}
									</span>
								</label>
							</div>
						</div>
						<div className="mt-2">
							<span className="opacity-75">
								{t("invoices.form.retention_of_title")}
							</span>
							<textarea
								value={retentionOfTitle}
								maxLength={300}
								onChange={(e) =>
									setRetentionOfTitle(e.target.value)
								}
								placeholder={t("invoices.form.retention_placeholder")}
								className="input-wrapper rounded-md w-full max-h-[300px] min-h-[44px]"
								rows={2}
							/>
						</div>
						<div className="mt-2">
							<span className="opacity-75">
								{t("invoices.form.additional_terms")}
							</span>
							<textarea
								value={additionalTerms}
								maxLength={300}
								onChange={(e) =>
									setAdditionalTerms(e.target.value)
								}
								placeholder={t("invoices.form.additional_terms_placeholder")}
								className="input-wrapper rounded-md w-full max-h-[300px] min-h-[44px]"
								rows={2}
							/>
						</div>
						<div className="flex flex-row justify-end gap-x-5 mt-4 overflow-hidden">
							<div className="w-full flex items-center">
								<input
									type="checkbox"
									checked={isNoTax}
									className="mr-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
									onChange={(e) => setNoTax(e.target.checked)}
								/>
								<span className="opacity-75 mt-3">
									{t("invoices.form.without_tax")}
								</span>
							</div>
							<div className="w-1/3">
								<div className="flex justify-between mb-1">
									<span className="opacity-75 text-nowrap">
										{t("invoices.form.net")}
									</span>
									<span className="text-nowrap">
										{netAmount.toFixed(2)} €
									</span>
								</div>
								<div className="flex justify-between mb-1">
									<span className="opacity-75 text-nowrap">
										{t("invoices.form.with_tax")}
									</span>
									<span className="text-nowrap">
										{(grossAmount - netAmount).toFixed(2)} €
									</span>
								</div>
								<div className="flex justify-between font-bold">
									<span className="text-nowrap">{t("invoices.form.gross")}</span>
									<span className="text-nowrap">
										{grossAmount.toFixed(2)} €
									</span>
								</div>
							</div>
						</div>
					</div>
					<Seperator />
					<div className="flex flex-row justify-between items-center mt-2 gap-x-2">
						<button onClick={handleSubmit} className="w-[300px]">
							{t("invoices.form.create")}
						</button>
						<button
							onClick={handleSaveAsTemplate}
							className="w-[300px] btn-text-only-l">
							{t("invoices.form.save_as_template")}
						</button>
					</div>
				</Card>
				{contactMenu && (
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.95 }}
						transition={{ duration: 0.2 }}
						className="absolute w-full h-full flex items-center justify-center backdrop-blur-sm">
						<Card className="flex flex-col justify-center items-center w-[300px] -translate-x-22">
							<div className="flex flex-row w-full justify-between items-center mb-1">
								<h2 className="font-semibold">{t("invoices.form.contacts")}</h2>
								<button
									onClick={() => setContactMenu(false)}
									className="btn-text-only-l">
									<X size={18} />
								</button>
							</div>
							<Seperator />
							<div className="flex flex-col items-center justify-center mt-1 w-full gap-y-2 max-h-[500px] overflow-y-scroll">
								{invoiceContacts.map((contact, index) => (
									<button
										key={index}
										onClick={() =>
											handleContactClick(contact)
										}
										className="flex btn-border-only flex-row items-center justify-between w-full">
										<div>
											<User size={22} />
										</div>
										<span>{contact.companyName}</span>
									</button>
								))}
								{invoiceContacts.length <= 0 && (
									<span className="opacity-50 text-sm">
										{t("invoices.form.no_contacts_found")}
									</span>
								)}
							</div>
						</Card>
					</motion.div>
				)}
			</motion.div>
		</motion.div>
	);
};

export default InvoiceForm;
