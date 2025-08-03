import { query } from "../db/db";

export async function deleteInvoice(
	invoiceId: number,
	userId: string
): Promise<boolean> {
	try {
		await query("BEGIN");
        // Logging that the user with id deleted this invoice
		const invoiceCheck = await query(
			`SELECT invoice_id FROM invoice WHERE invoice_id = $1`,
			[invoiceId]
		);

		if (invoiceCheck.rows.length === 0) {
			await query("ROLLBACK");
			console.error(`Invoice with ID ${invoiceId} not found`);
			return false;
		}

		await query(`DELETE FROM invoiceitems WHERE invoice_id = $1`, [
			invoiceId,
		]);

		const deleteResult = await query(
			`DELETE FROM invoice WHERE invoice_id = $1`,
			[invoiceId]
		);

		if (deleteResult.rowCount === 0) {
			await query("ROLLBACK");
			console.error(`Failed to delete invoice with ID ${invoiceId}`);
			return false;
		}

		await query("COMMIT");
		console.log(`Successfully deleted invoice with ID ${invoiceId}`);
		return true;
	} catch (error) {
		await query("ROLLBACK");
		console.error("Error deleting invoice:", error);
		return false;
	}
}
