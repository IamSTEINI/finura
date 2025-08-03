import { query } from "../db/db";

export async function generateInvoiceNumber(): Promise<string> {
	try {
		const date = new Date();
		const year = date.getFullYear();
		const month = (date.getMonth() + 1).toString().padStart(2, "0");
		const prefix = `${year}${month}`;

		const result = await query(
			"SELECT invoice_number FROM invoice WHERE invoice_number LIKE $1 ORDER BY invoice_number DESC LIMIT 1",
			[`${prefix}%`]
		);

		let nextNumber = 1;

		if (result.rows.length > 0) {
			const currentHighest = result.rows[0].invoice_number;
			const matches = currentHighest.match(/^(\d{6})(\d{4})$/);
			if (matches && matches[2]) {
				nextNumber = parseInt(matches[2], 10) + 1;
			}
		}

		const formattedNumber = nextNumber.toString().padStart(4, "0");
		return `${prefix}${formattedNumber}`;
	} catch (error) {
		console.error("Error generating invoice number:", error);
		return "0000000000";
	}
}
