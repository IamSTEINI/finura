import { Router } from "express";
import express from "express";
import { createInvoice } from "../utils/invoices/createInvoice";
import { fetchInvoices } from "../utils/invoices/fetchInvoices";
import { fetchSession } from "../utils/auth/fetchSession";
import { InvoiceDetails } from "../utils/db/schemas/INVOICE";
import { invoiceNumberRouter } from "./number/route";

const invoicesRouter = Router();
invoicesRouter.use(express.json());


invoicesRouter.use("/number", invoiceNumberRouter);

invoicesRouter.get("/", async (req, res, next) => {
	try {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			res.status(401).json({ error: "Unauthorized: No token provided" });
			return;
		}

		const token = authHeader.substring(7);

		const sessionData = await fetchSession(token);
		if (!sessionData || !sessionData.user_id) {
			res.status(401).json({ error: "Unauthorized: Invalid token" });
			return;
		}

		const limit = req.query.limit
			? parseInt(req.query.limit as string)
			: undefined;
		const offset = req.query.offset
			? parseInt(req.query.offset as string)
			: undefined;
		const invoices = await fetchInvoices(
			sessionData.user_id,
			limit,
			offset
		);

		if (invoices === null) {
			res.status(500).json({ error: "Failed to fetch invoices" });
			return;
		}

		res.status(200).json(invoices);
	} catch (error) {
		console.error("Error fetching invoices:", error);
		next(error);
	}
});

invoicesRouter.post("/", async (req, res, next) => {
	try {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			res.status(401).json({ error: "Unauthorized: No token provided" });
			return;
		}

		const token = authHeader.substring(7);

		const sessionData = await fetchSession(token);
		if (!sessionData || !sessionData.user_id) {
			res.status(401).json({ error: "Unauthorized: Invalid token" });
			return;
		}

		const invoiceData: InvoiceDetails = req.body;

		if (!invoiceData || !validateInvoiceData(invoiceData)) {
			res.status(400).json({ error: "Invalid invoice data provided" });
			return;
		}

		const result = await createInvoice(invoiceData, sessionData.user_id);

		if (!result) {
			res.status(500).json({ error: "Failed to create invoice" });
			return;
		}

		res.status(201).json({
			message: "Invoice created successfully",
			invoiceId: result.invoiceId,
			invoiceNumber: result.invoiceNumber,
		});
	} catch (error) {
		console.error("Error creating invoice:", error);
		next(error);
	}
});

invoicesRouter.delete("/:invoiceId", async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ error: "Unauthorized: No token provided" });
            return;
        }

        const token = authHeader.substring(7);
        const sessionData = await fetchSession(token);
        if (!sessionData || !sessionData.user_id) {
            res.status(401).json({ error: "Unauthorized: Invalid token" });
            return;
        }

		const { invoiceId } = req.params;
		if (!invoiceId) {
			res.status(400).json({ error: "Invoice ID is required" });
			return;
		}
		const invoiceIdNum = Number(invoiceId);
		if (isNaN(invoiceIdNum)) {
			res.status(400).json({ error: "Invoice ID must be a number" });
			return;
		}

		const { deleteInvoice } = await import("../utils/invoices/deleteInvoice");
		const deleted = await deleteInvoice(invoiceIdNum, sessionData.user_id);

        if (!deleted) {
            res.status(404).json({ error: "Invoice not found or not deleted" });
            return;
        }

        res.status(200).json({ message: "Invoice deleted successfully" });
    } catch (error) {
        console.error("Error deleting invoice:", error);
        next(error);
    }
});

function validateInvoiceData(data: InvoiceDetails): boolean {
	const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

	if (
		!data.invoiceDate ||
		!data.dateOfService ||
		!data.customer ||
		!data.seller ||
		!data.lineItems ||
		!data.paymentTerms
	) {
		console.log("Missing required invoice fields");
		return false;
	}

	if (!dateRegex.test(data.invoiceDate)) {
		console.log(
			"Invalid invoiceDate format, expected YYYY-MM-DD:",
			data.invoiceDate
		);
		return false;
	}
	if (!dateRegex.test(data.dateOfService)) {
		console.log(
			"Invalid dateOfService format, expected YYYY-MM-DD:",
			data.dateOfService
		);
		return false;
	}

	if (
		!data.customer.companyName ||
		!data.customer.address ||
		!data.customer.postalCodeCity
	) {
		console.log("Missing required customer fields");
		return false;
	}

	if (
		!data.seller.companyName ||
		!data.seller.address ||
		!data.seller.postalCodeCity ||
		!data.seller.taxNumber ||
		!data.seller.vatId ||
		!data.seller.bankName ||
		!data.seller.iban ||
		!data.seller.bic
	) {
		console.log("Missing required seller fields");
		return false;
	}

	if (!data.lineItems.length) {
		console.log("No line items provided");
		return false;
	}

	for (const item of data.lineItems) {
		if (
			!item.name ||
			item.unitPrice === undefined ||
			item.quantity === undefined ||
			item.taxRate === undefined
		) {
			console.log("Missing required line item fields", item);
			return false;
		}
	}

	return true;
}

export default invoicesRouter;
