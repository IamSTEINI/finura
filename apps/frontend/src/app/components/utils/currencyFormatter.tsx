import React from "react";

export const formatCurrency = (
	value: string | number,
	decimals: number = 2
): string => {
	const numericValue = typeof value === "string" ? parseFloat(value) : value;

	if (isNaN(numericValue)) {
		return "0,00";
	}

	const parts = numericValue.toFixed(decimals).split(".");
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");

	return parts.join(",");
};

interface CurrencyFormatterProps {
	value: string | number;
	decimals?: number;
}

const CurrencyFormatter: React.FC<CurrencyFormatterProps> = ({
	value,
	decimals = 2,
}) => {
	return <>{formatCurrency(value, decimals)}</>;
};

export default CurrencyFormatter;
