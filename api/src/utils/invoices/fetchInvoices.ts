import { query } from "../db/db";

export async function fetchInvoices(
	userId: string,
	limit?: number,
	offset?: number
) {
	try {
		let sql = `
  SELECT i.*, c.company_name, c.address, c.postal_code_city, c.contact_person, c.vat_id
  FROM invoice i
  JOIN customers c ON i.customer_id = c.customer_id
`;

		const params: any[] = [];

		if (limit !== undefined) {
			sql += ` LIMIT $${params.length + 1}`;
			params.push(limit);
		}

		if (offset !== undefined) {
			sql += ` OFFSET $${params.length + 1}`;
			params.push(offset);
		}

		const invoiceResult = await query(sql, params);
		const invoices = invoiceResult.rows;

		if (invoices.length === 0) {
			return [];
		}

		const invoiceIds = invoices.map((invoice) => invoice.invoice_id);
		const itemsResult = await query(
			`SELECT * FROM invoiceitems WHERE invoice_id = ANY($1)`,
			[invoiceIds]
		);

		const lineItemsByInvoiceId = itemsResult.rows.reduce((acc, item) => {
			if (!acc[item.invoice_id]) {
				acc[item.invoice_id] = [];
			}
			acc[item.invoice_id].push({
				name: item.name,
				description: item.description,
				unitPrice: parseFloat(item.unit_price),
				quantity: item.quantity,
				taxRate: parseFloat(item.tax_rate),
			});
			return acc;
		}, {});

		const result = invoices.map((invoice) => {
			return {
				id: invoice.invoice_id,
				invoiceNumber: invoice.invoice_number,
				invoiceDate: invoice.invoice_date,
				dateOfService: invoice.date_of_service,
				paymentTerms: invoice.payment_terms,
				notes: invoice.notes,
				noTax: invoice.no_tax,
				smallBusinessTerm: invoice.small_business_term,
				retentionOfTitle: invoice.retention_of_title,
				paid: invoice.paid,
				customer: {
					companyName: invoice.company_name,
					address: invoice.address,
					postalCodeCity: invoice.postal_code_city,
					contactPerson: invoice.contact_person,
					vatId: invoice.vat_id,
				},
				seller: {
					companyName: invoice.seller_company_name,
					address: invoice.seller_address,
					postalCodeCity: invoice.seller_postal_code_city,
					taxNumber: invoice.tax_number,
					vatId: invoice.vat_id,
					managingDirector: invoice.managing_director,
					commercialRegister: invoice.commercial_register,
					email: invoice.email,
					phone: invoice.phone,
					website: invoice.website,
					bankName: invoice.bank_name,
					iban: invoice.iban,
					bic: invoice.bic,
				},
				lineItems: lineItemsByInvoiceId[invoice.invoice_id] || [],
			};
		});

		return result;
	} catch (error) {
		console.error("Error fetching invoices:", error);
		return null;
	}
}
