import React, { useState } from "react";
import ChildrenInput from "./ChildrenInput";
import {
	ChevronDown,
	ChevronRight,
	Copy,
	X,
	Euro,
	Percent,
} from "lucide-react";
import { useLocale } from "@/context/LocaleContext";

export interface LineItem {
	name: string;
	description: string;
	unitPrice: number;
	quantity: number;
	taxRate: number;
}

interface InvoiceLineItemProps {
	item: LineItem;
	index: number;
	onUpdate: (
		index: number,
		field: keyof LineItem,
		value: string | number
	) => void;
	onRemove: (index: number) => void;
	onDuplicate: (index: number) => void;
	canRemove: boolean;
}

const InvoiceLineItem: React.FC<InvoiceLineItemProps> = ({
	item,
	index,
	onUpdate,
	onRemove,
	onDuplicate,
	canRemove,
}) => {
	const { t } = useLocale();
	const [isExpanded, setIsExpanded] = useState(true);
	const [localAmount, setLocalAmount] = useState(item.unitPrice.toString());
	const [localTaxRate, setLocalTaxRate] = useState(item.taxRate.toString());

	React.useEffect(() => {
		setLocalAmount(item.unitPrice.toString());
	}, [item.unitPrice]);

	React.useEffect(() => {
		setLocalTaxRate(item.taxRate.toString());
	}, [item.taxRate]);

	const handleAmountChange = (value: string) => {
		setLocalAmount(value);

		if (value === "") {
			onUpdate(index, "unitPrice", 0);
			return;
		}

		const cleanValue = value.replace(/,/g, ".");

		if (/^\d*\.?\d*$/.test(cleanValue)) {
			if (cleanValue !== "." && cleanValue !== "") {
				const numValue = parseFloat(cleanValue);
				if (!isNaN(numValue)) {
					if (numValue < 0) {
						setLocalAmount("0");
						onUpdate(index, "unitPrice", 0);
					} else if (numValue > 999999) {
						setLocalAmount("999999");
						onUpdate(index, "unitPrice", 999999);
					} else {
						onUpdate(index, "unitPrice", numValue);
					}
				}
			}
		}
	};

	const handleTaxRateChange = (value: string) => {
		setLocalTaxRate(value);

		if (value === "") {
			onUpdate(index, "taxRate", 0);
			return;
		}

		const cleanValue = value.replace(/,/g, ".");

		if (/^\d*\.?\d*$/.test(cleanValue)) {
			if (cleanValue !== "." && cleanValue !== "") {
				const numValue = parseFloat(cleanValue);
				if (!isNaN(numValue)) {
					if (numValue > 100) {
						setLocalTaxRate("100");
						onUpdate(index, "taxRate", 100);
					} else {
						onUpdate(index, "taxRate", numValue);
					}
				}
			}
		}
	};

	return (
		<div className="p-2 rounded-md mb-2 border border-white/25">
			<div className="flex justify-between items-center">
				<div
					className="flex items-center cursor-pointer w-full"
					onClick={() => setIsExpanded(!isExpanded)}>
					{isExpanded ? (
						<ChevronDown size={18} className="mr-2" />
					) : (
						<ChevronRight size={18} className="mr-2" />
					)}
					<span className="font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[40%]">
						{item.name || `${t("invoices.form.line_item.item_number")} ${index + 1}`}
					</span>
					<span className="ml-2 italic opacity-50">
						{new Intl.NumberFormat("de-DE", {
							style: "currency",
							currency: "EUR",
						}).format(item.unitPrice)}
						{" "}
						({new Intl.NumberFormat("de-DE", {
							style: "currency",
							currency: "EUR",
						}).format(item.unitPrice * item.quantity)})
					</span>
				</div>

				<div className="flex items-center gap-2">
					<div className="flex items-center gap-1">
						<span className="opacity-75 mr-1">{t("invoices.form.line_item.quantity")}</span>
						<input
							type="number"
							min={1}
							step={1}
							value={item.quantity === 0 ? "1" : item.quantity}
							onChange={(e) => {
								const raw = e.target.value;
								const parsed = parseInt(raw, 10);
								if (raw === "") {
									onUpdate(index, "quantity", 0);
								} else {
									const val = Math.max(
										1,
										Math.min(
											1000,
											isNaN(parsed) ? 1 : parsed
										)
									);
									onUpdate(index, "quantity", val);
								}
							}}
							className="input-wrapper w-[80px] text-center rounded-md px-2 h-10"
							title={t("invoices.form.line_item.quantity")}
						/>
					</div>
					<button
						onClick={() => onDuplicate(index)}
						className="btn-text-only-l"
						title={t("invoices.form.line_item.duplicate_item")}>
						<Copy size={18} />
					</button>

					{canRemove && (
						<button
							onClick={() => onRemove(index)}
							className="btn-text-only-l"
							title={t("invoices.form.line_item.remove_item")}>
							<X size={18} />
						</button>
					)}
				</div>
			</div>

			{isExpanded && (
				<div className="flex flex-col gap-2">
					<div>
						<span className="opacity-75">{t("invoices.form.line_item.item_name")}</span>
						<input
							type="text"
							value={item.name}
							maxLength={50}
							onChange={(e) =>
								onUpdate(index, "name", e.target.value)
							}
							placeholder={t("invoices.form.line_item.item_name_placeholder")}
							className="input-wrapper rounded-md w-full"
						/>
					</div>

					<div>
						<span className="opacity-75">{t("invoices.form.line_item.description")}</span>
						<textarea
							value={item.description}
							maxLength={300}
							onChange={(e) =>
								onUpdate(index, "description", e.target.value)
							}
							placeholder={t("invoices.form.line_item.description_placeholder")}
							className="input-wrapper rounded-md w-full max-h-[300px] min-h-[44px]"
							rows={2}
						/>
					</div>

					<div className="flex gap-4">
						<div className="w-1/2">
							<span className="opacity-75">{t("invoices.form.line_item.amount")}</span>
							<ChildrenInput
								type="text"
								placeholder="0.00"
								value={localAmount}
								onChange={(e) =>
									handleAmountChange(e.target.value)
								}>
								<Euro size={18} opacity={0.5} />
							</ChildrenInput>
						</div>
						<div className="w-1/2">
							<span className="opacity-75">{t("invoices.form.line_item.tax_rate")}</span>
							<ChildrenInput
								placeholder="19"
								type="text"
								value={localTaxRate}
								onChange={(e) =>
									handleTaxRateChange(e.target.value)
								}>
								<Percent size={18} opacity={0.5} />
							</ChildrenInput>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default InvoiceLineItem;
