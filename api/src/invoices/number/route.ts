import { RequestHandler, Router } from "express";
import express from "express";
import { fetchSession } from "../../utils/auth/fetchSession";
import { generateInvoiceNumber } from "../../utils/invoices/generateInvoiceNumber";

const invoiceNumberRouter = Router();
invoiceNumberRouter.use(express.json());

const getNextInvoiceNumber: RequestHandler = async (req, res) => {
	try {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			res.status(401).json({
				error: "API_MISSING_TOKEN",
				message:
					"Missing or invalid Authorization header. Please provide a valid Bearer token.",
			});
			return;
		}

		const token = authHeader.split(" ")[1];

		let sessionData;
		try {
			sessionData = await fetchSession(token);
		} catch (err) {
			res.status(401).json({
				error: "API_INVALID_SESSION",
				message: "Could not fetch user session.",
			});
			return;
		}

		const invoiceNumber = await generateInvoiceNumber();

		res.status(200).json({ invoiceNumber });
	} catch (error) {
		console.error("Error generating invoice number:", error);
		res.status(500).json({
			error: "API_SERVER_ERROR",
			message:
				"An internal server error occurred while generating invoice number.",
		});
	}
};

invoiceNumberRouter.get("/", getNextInvoiceNumber);

export { invoiceNumberRouter };
