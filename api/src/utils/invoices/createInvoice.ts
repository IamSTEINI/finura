import { query } from "../db/db";
import { InvoiceDetails } from "../db/schemas/INVOICE";
import { generateInvoiceNumber } from "./generateInvoiceNumber";
import { getCompanyFromDB } from "../company/getCompanyfromDB";

export async function createInvoice(
	invoiceData: InvoiceDetails,
	userId: string
): Promise<{ invoiceId: number; invoiceNumber: string } | null> {
	try {
		await query("BEGIN");

		const invoiceNumber = await generateInvoiceNumber();

		const companyData = await getCompanyFromDB();
		if (!companyData) {
			throw new Error(
				"Company data not found. Please set up company information first."
			);
		}

		let customerId: number;
		const customerResult = await query(
			`SELECT customer_id FROM customers 
       WHERE company_name = $1 AND address = $2 AND postal_code_city = $3`,
			[
				invoiceData.customer.companyName,
				invoiceData.customer.address,
				invoiceData.customer.postalCodeCity,
			]
		);

		if (customerResult.rows.length > 0) {
			customerId = customerResult.rows[0].customer_id;
		} else {
			const newCustomerResult = await query(
				`INSERT INTO customers 
         (customer_number, company_name, address, postal_code_city, contact_person, vat_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING customer_id`,
				[
					invoiceData.customerNumber || null,
					invoiceData.customer.companyName,
					invoiceData.customer.address,
					invoiceData.customer.postalCodeCity,
					invoiceData.customer.contactPerson || null,
					invoiceData.customer.vatId || null,
				]
			);
			customerId = newCustomerResult.rows[0].customer_id;
		}

		const invoiceResult = await query(
			`INSERT INTO invoice 
	   (invoice_number, customer_id, invoice_date, date_of_service, 
		notes, payment_terms, no_tax, small_business_term, retention_of_title,
		seller_company_name, seller_address, seller_postal_code_city, 
		tax_number, vat_id, managing_director, commercial_register,
		email, phone, website, bank_name, iban, bic)
	   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
	   RETURNING invoice_id, invoice_number`,
			[
				invoiceNumber,
				customerId,
				invoiceData.invoiceDate,
				invoiceData.dateOfService,
				invoiceData.notes || null,
				invoiceData.paymentTerms,
				invoiceData.noTax,
				invoiceData.smallBusinessTerm || null,
				invoiceData.retentionOfTitle || null,
				companyData.company_name,
				companyData.company_address,
				companyData.company_postal_code,
				companyData.company_tax_number,
				companyData.company_vat_id,
				companyData.company_director || null,
				companyData.commercial_register || null,
				companyData.company_email || null,
				companyData.company_phone || null,
				companyData.company_website || null,
				companyData.bank_name,
				companyData.company_iban,
				companyData.company_bic,
			]
		);

		const invoiceId = invoiceResult.rows[0].invoice_id;

		for (const item of invoiceData.lineItems) {
			await query(
				`INSERT INTO invoiceitems 
         (invoice_id, name, description, unit_price, quantity, tax_rate)
         VALUES ($1, $2, $3, $4, $5, $6)`,
				[
					invoiceId,
					item.name,
					item.description,
					item.unitPrice,
					item.quantity,
					item.taxRate,
				]
			);
		}

		await query("COMMIT");

		return {
			invoiceId: invoiceId,
			invoiceNumber: invoiceNumber,
		};
	} catch (error) {
		await query("ROLLBACK");
		console.error("Error creating invoice:", error);
		return null;
	}
}
