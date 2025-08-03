import PDFDocument from "pdfkit";
import * as fs from "fs";

export interface LineItem {
	name: string;
	description: string;
	unitPrice: number;
	quantity: number;
	taxRate: number;
}
function drawTable(
	doc: PDFKit.PDFDocument,
	items: LineItem[],
	startY: number,
	noTax: boolean
) {
	const tableTop = startY;
	const itemSpacing = 23;
	const columnWidths = {
		name: 120,
		description: 200,
		unitPrice: 90,
		quantity: 70,
		taxRate: 70,
	};
	const maxCharsPerLine = 60;
	const pageBottomMargin = 40;

	const drawHeaders = (headerY: number) => {
		doc.font("Helvetica-Bold")
			.fontSize(10)
			.text("Name", 50, headerY)
			.text("Description", 50 + columnWidths.name, headerY)
			.text(
				"Quantity",
				19 + columnWidths.name + columnWidths.description,
				headerY,
				{
					width: columnWidths.unitPrice,
					align: "right",
				}
			)
			.text(
				"Unit Price (€)",
				28 +
					columnWidths.name +
					columnWidths.description +
					columnWidths.quantity,
				headerY,
				{
					width: columnWidths.unitPrice,
					align: "right",
				}
			)
			.text(
				"Tax Rate (%)",
				30 +
					columnWidths.name +
					columnWidths.description +
					columnWidths.quantity +
					columnWidths.unitPrice,
				headerY,
				{
					width: columnWidths.taxRate,
					align: "right",
				}
			);
	};

	drawHeaders(tableTop);
	let y = tableTop + 25;
	doc.font("Helvetica").fontSize(10);

	items.forEach((item) => {
		const formattedName = formatTextWithLineBreaks(
			item.name,
			maxCharsPerLine
		);
		const formattedDescription = formatTextWithLineBreaks(
			item.description,
			maxCharsPerLine
		);

		const nameLines = formattedName.split("\n").length;
		const descLines = formattedDescription.split("\n").length;
		const maxLines = Math.max(nameLines, descLines);
		const rowHeight = itemSpacing * maxLines;

		if (y + rowHeight > doc.page.height - pageBottomMargin) {
			doc.addPage();
			y = 50;
			drawHeaders(y);
			y += 25;
			doc.font("Helvetica").fontSize(10);
		}

		doc.text(formattedName, 50, y, {
			width: columnWidths.name,
		});

		doc.text(formattedDescription, 50 + columnWidths.name, y, {
			width: columnWidths.description,
		});

		doc.text(
			item.quantity.toString(),
			70 + columnWidths.name + columnWidths.description,
			y,
			{
				width: columnWidths.quantity,
			}
		);

		doc.text(
			item.unitPrice.toFixed(2),
			60 +
				columnWidths.name +
				columnWidths.description +
				columnWidths.quantity,
			y,
			{
				width: columnWidths.unitPrice,
				align: "left",
			}
		);

		doc.text(
			noTax ? "0" : item.taxRate.toFixed(2),
			10 +
				columnWidths.name +
				columnWidths.description +
				columnWidths.quantity +
				columnWidths.unitPrice,
			y,
			{
				width: columnWidths.taxRate,
				align: "right",
			}
		);
		doc.moveTo(50, y - 10)
			.lineTo(565, y - 10)
			.stroke();
		y += rowHeight + 10;
	});

	doc.moveTo(50, y - 5)
		.lineTo(565, y - 5)
		.stroke()
		.moveDown();

	let totalNet = 0;
	let totalTax = 0;

	items.forEach((item) => {
		const itemTotal = item.unitPrice;
		const taxAmount = itemTotal * (item.taxRate / 100);
		totalNet += itemTotal;
		if (!noTax) {
			totalTax += taxAmount;
		}
	});

	const totalGross = totalNet + totalTax;

	y += 10;

	doc.font("Helvetica-Bold")
		.fontSize(10)
		.text(
			"Total Net:",
			50 + columnWidths.name + columnWidths.description,
			y,
			{
				width: columnWidths.unitPrice,
				align: "right",
			}
		)
		.text(
			totalNet.toFixed(2) + " €",
			50 +
				columnWidths.name +
				columnWidths.description +
				columnWidths.unitPrice,
			y,
			{
				width: columnWidths.taxRate,
				align: "right",
			}
		);

	y += 15;

	doc.text(
		"Total Tax:",
		50 + columnWidths.name + columnWidths.description,
		y,
		{
			width: columnWidths.unitPrice,
			align: "right",
		}
	).text(
		totalTax.toFixed(2) + " €",
		50 +
			columnWidths.name +
			columnWidths.description +
			columnWidths.unitPrice,
		y,
		{
			width: columnWidths.taxRate,
			align: "right",
		}
	);

	y += 20;

	doc.moveTo(50 + columnWidths.name + columnWidths.description, y - 5)
		.lineTo(565, y - 5)
		.stroke();

	y += 5;

	doc.fontSize(12)
		.text(
			"Total Gross:",
			50 + columnWidths.name + columnWidths.description,
			y,
			{
				width: columnWidths.unitPrice,
				align: "right",
			}
		)
		.text(
			totalGross.toFixed(2) + " €",
			50 +
				columnWidths.name +
				columnWidths.description +
				columnWidths.unitPrice,
			y,
			{
				width: columnWidths.taxRate,
				align: "right",
			}
		);

	doc.font("Helvetica").fontSize(10).moveDown().moveDown();
}

function formatTextWithLineBreaks(
	text: string,
	maxCharsPerLine: number
): string {
	if (text.length <= maxCharsPerLine) {
		return text;
	}

	const words = text.split(" ");
	let currentLine = "";
	let result = "";

	for (const word of words) {
		if (
			currentLine.length +
				word.length +
				(currentLine.length > 0 ? 1 : 0) >
			maxCharsPerLine
		) {
			result += (result.length > 0 ? "\n" : "") + currentLine;
			currentLine = word;
		} else {
			currentLine += (currentLine.length > 0 ? " " : "") + word;
		}
	}

	if (currentLine.length > 0) {
		result += (result.length > 0 ? "\n" : "") + currentLine;
	}

	return result;
}

export function generateInvoicePDF(
	filePath: string,
	invoiceData: InvoiceDetails
) {
	const doc = new PDFDocument({ margin: 50 });

	doc.pipe(fs.createWriteStream(filePath));

	doc.image("logo.png", doc.page.width - 150, 50, {
		fit: [100, 100],
	});
	doc.fontSize(10)
		.font("Helvetica-Bold")
		.text(invoiceData.seller.companyName, 50, 60)
		.font("Helvetica")
		.text(invoiceData.seller.address, 50, 70)
		.text(invoiceData.seller.postalCodeCity, 50, 80)
		.text(invoiceData.seller.website || "", 50, 90)
		.moveDown();
	doc.fontSize(10)
		.font("Helvetica-Bold")
		.text(invoiceData.customer.companyName, 50, 130)
		.font("Helvetica")
		.text(invoiceData.customer.address, 50, 140)
		.text(invoiceData.customer.postalCodeCity, 50, 150)
		.text(invoiceData.customer.contactPerson || "", 50, 160)
		.text(invoiceData.customer.vatId || "", 50, 170)
		.moveDown();

	doc.text("CREATION DATE", 320, 140)
		.text(invoiceData.invoiceDate, 450, 140)
		.text("DATE OF SERVICE", 320, 150)
		.text(invoiceData.dateOfService, 450, 150)
		.text("Contact", 320, 170)
		.text(invoiceData.seller.managingDirector || "-", 450, 170)
		.text(invoiceData.seller.email || "-", 450, 180, {
			lineBreak: false,
			width: 150,
			ellipsis: false,
		})
		.text(invoiceData.seller.phone || "-", 450, 192)
		.text("TAX NUMBER", 320, 202)
		.text(invoiceData.seller.taxNumber, 450, 202)
		.text("VAT-ID", 320, 212)
		.text(invoiceData.seller.vatId, 450, 212)
		.moveDown();

	doc.fontSize(15)
		.text(
			"INVOICE #" +
				invoiceData.invoiceNumber +
				"    -    CLIENT #" +
				invoiceData.customerNumber,
			50,
			250
		)
		.moveDown();
	doc.fontSize(10)
		.text(invoiceData.notes || "", 50, 270)
		.moveDown();

	const sortedLineItems = [...invoiceData.lineItems].sort(
		(a, b) => b.quantity - a.quantity
	);

	drawTable(doc, sortedLineItems, 320, invoiceData.noTax);

	doc.fontSize(10)
		.font("Helvetica-Bold")
		.text(invoiceData.smallBusinessTerm || "", 50)
		.font("Helvetica")
		.moveDown();
	doc.fontSize(10).text(invoiceData.retentionOfTitle || "", 50);
	doc.fontSize(10)
		.text(invoiceData.paymentTerms, 50)
		.moveDown(0.5)
		.text("Bank: " + invoiceData.seller.bankName, 50)
		.font("Helvetica-Bold")
		.text("IBAN: " + invoiceData.seller.iban, 50)
		.text("BIC/SWIFT: " + invoiceData.seller.bic, 50)
		.text("Reference: Invoice #" + invoiceData.invoiceNumber, 50)
		.font("Helvetica")
		.moveDown()
		.moveDown();

	doc.end();
}

export interface InvoiceDetails {
	invoiceNumber: string;
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

const exampleInvoiceData: InvoiceDetails = {
	invoiceNumber: "2025-07-001",
	customerNumber: "C-12345",
	invoiceDate: "26.07.2025",
	dateOfService: "01.07.2025 - 25.07.2025",
	customer: {
		companyName: "Beispiel Kunde GmbH",
		address: "Kundenweg 123",
		postalCodeCity: "12345 Kundenstadt",
		contactPerson: "Yasuo Iwakura",
		vatId: "DE987654321",
	},
	seller: {
		companyName: "Mein Tolles Unternehmen GmbH",
		address: "Musterstrasse 10",
		postalCodeCity: "77761 Offenburg",
		taxNumber: "12/345/67890",
		vatId: "DE123456789",
		managingDirector: "Dr. Lain Mustermann",
		commercialRegister: "HRB 123456 (Amtsgericht Freiburg)",
		email: "info@mein-unternehmen.de",
		phone: "+49 781 12345-0",
		website: "www.mein-unternehmen.de",
		bankName: "Meine Bank",
		iban: "DE98765432109876543210",
		bic: "BYLADEM1ABC",
	},
	lineItems: [
		{
			name: "Website Entwicklung Phase 1",
			description:
				"Frontend- und Backend-Entwicklung für die neue E-Commerce-Plattform, inklusive Benutzerauthentifizierung und Produktkatalog-Integration. Umfassende Implementierung nach Ihren Vorgaben.",
			quantity: 1,
			unitPrice: 2500.0,
			taxRate: 19,
		},
		{
			name: "Beratungsleistungen",
			description:
				"20 Stunden Beratung zur Datenbankoptimierung und Einrichtung der Cloud-Infrastruktur. Fokus auf Skalierbarkeit und Performance.",
			quantity: 20,
			unitPrice: 80.5,
			taxRate: 19,
		},
		{
			name: "Hosting Gebühren",
			description:
				"Monatliche Hosting-Abonnementgebühren für Juli 2025 auf unseren Premium-Servern.",
			quantity: 1,
			unitPrice: 50.0,
			taxRate: 19,
		},
		{
			name: "Software Lizenz (Jährlich)",
			description:
				"Jährliche Lizenz für die Projektmanagement-Software 'ProjectFlow Pro'.",
			quantity: 1,
			unitPrice: 150.0,
			taxRate: 19,
		},
		{
			name: "Design Review Workshop",
			description:
				"Halbtägiger interaktiver Workshop zur Überprüfung der UI/UX-Designs und Sammlung von Feedback.",
			quantity: 1,
			unitPrice: 400.0,
			taxRate: 19,
		},
		{
			name: "Kleinere Fehlerbehebungen",
			description:
				"Behebung gemeldeter kleinerer Fehler in der bestehenden Anwendung (5 Stunden Aufwand).",
			quantity: 5,
			unitPrice: 70.0,
			taxRate: 19,
		},
		{
			name: "Testdienstleistungen",
			description:
				"Umfassende Tests neuer Funktionen und Regressionstests zur Sicherstellung der Softwarequalität.",
			quantity: 1,
			unitPrice: 300.0,
			taxRate: 19,
		},
		{
			name: "Datenmigrations-Support",
			description:
				"Unterstützung bei der Migration von Legacy-Daten in das neue System, inklusive Datenbereinigung.",
			quantity: 1,
			unitPrice: 200.0,
			taxRate: 19,
		},
		{
			name: "Dokumentationserstellung",
			description:
				"Erstellung von Benutzerhandbüchern und technischer Dokumentation für das entwickelte System.",
			quantity: 1,
			unitPrice: 180.0,
			taxRate: 19,
		},
	],
	notes: "Vielen Dank für Ihren Auftrag!\nWir schätzen Ihre prompte Zahlung.\nBitte geben Sie bei der Überweisung die Rechnungsnummer als Verwendungszweck an.",
	paymentTerms:
		"Zahlbar innerhalb von 14 Tagen netto ohne Abzug. Nach Ablauf von 30 Tagen tritt Verzug gemäß § 286 Abs. 3 BGB ein.",
	noTax: true,
	smallBusinessTerm:
		"Als Kleinunternehmer im Sinne von § 19 UStG wird keine Umsatzsteuer berechnet.",
	retentionOfTitle:
		"Die gelieferte Ware bleibt bis zur vollständigen Bezahlung unser Eigentum.",
};

generateInvoicePDF("INVOICE.pdf", exampleInvoiceData);
