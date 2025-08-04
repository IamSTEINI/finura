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
		taxNumber: string;
		vatId: string;
		managingDirector?: string;
		commercialRegister?: string;
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
export interface LineItem {
	name: string;
	description: string;
	unitPrice: number;
	quantity: number;
	taxRate: number;
}

/*
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    customer_number VARCHAR(50),
    company_name TEXT NOT NULL,
    address TEXT NOT NULL,
    postal_code_city TEXT NOT NULL,
    contact_person TEXT,
    vat_id VARCHAR(50)
);
CREATE TABLE invoice (
    invoice_id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL,
    customer_id INT REFERENCES customers(customer_id),
    invoice_date DATE NOT NULL,
    date_of_service DATE NOT NULL,
    notes TEXT,
    payment_terms TEXT NOT NULL,
    no_tax BOOLEAN NOT NULL,
    small_business_term TEXT,
    retention_of_title TEXT,
    seller_company_name TEXT NOT NULL,
    seller_address TEXT NOT NULL,
    seller_postal_code_city TEXT NOT NULL,
    tax_number VARCHAR(50) NOT NULL,
    vat_id VARCHAR(50) NOT NULL,
    managing_director TEXT,
    commercial_register TEXT,
    email TEXT,
    phone TEXT,
    website TEXT,
    bank_name TEXT NOT NULL,
    iban VARCHAR(100) NOT NULL,
    bic VARCHAR(50) NOT NULL
);
CREATE TABLE invoiceitems (
    item_id SERIAL PRIMARY KEY,
    invoice_id INT REFERENCES invoice(invoice_id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    unit_price NUMERIC(10,2) NOT NULL,
    quantity INTEGER NOT NULL,
    tax_rate NUMERIC(5,2) NOT NULL
);
*/
