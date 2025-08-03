import { RequestHandler, Router } from "express";
import express from "express";
import { getCompanyFromDB } from "../../utils/company/getCompanyfromDB";
import { updateCompanyInDB } from "../../utils/company/updateCompanyInDB";

const companyInfoRouter = Router();
companyInfoRouter.use(express.json());

const updateCompany: RequestHandler = async (req, res) => {
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

		const sessionResponse = await import("../../utils/auth/fetchSession");
		let sessionData;
		try {
			sessionData = await sessionResponse.fetchSession(token);
		} catch (err) {
			res.status(401).json({
				error: "API_INVALID_SESSION",
				message: "Could not fetch user session.",
			});
			return;
		}

		const getUserFromDB = await import("../../utils/auth/getUserFromDB");
		let userObj;
		try {
			userObj = await getUserFromDB.getUserFromDB(sessionData.user_id);
		} catch (err) {
			res.status(404).json({
				error: "API_USER_NOT_FOUND",
				message: "User not found in database.",
			});
			return;
		}
		if (
			!userObj ||
			!userObj.roles ||
			!Array.isArray(userObj.roles) ||
			!userObj.roles.includes("administrator")
		) {
			res.status(403).json({
				error: "API_FORBIDDEN",
				message: "User does not have ADMINISTRATOR role.",
			});
			return;
		}

		const company = await getCompanyFromDB();

		res.status(200).json({
			success: true,
			company: company,
		});
	} catch (error) {
		res.status(500).json({
			error: "API_INTERNAL_ERROR",
			message: "Internal server error during session refresh",
		});
	}
};

const postUpdateCompany: RequestHandler = async (req, res) => {
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

		const sessionResponse = await import("../../utils/auth/fetchSession");
		let sessionData;
		try {
			sessionData = await sessionResponse.fetchSession(token);
		} catch (err) {
			res.status(401).json({
				error: "API_INVALID_SESSION",
				message: "Could not fetch user session.",
			});
			return;
		}

		const getUserFromDB = await import("../../utils/auth/getUserFromDB");
		let userObj;
		try {
			userObj = await getUserFromDB.getUserFromDB(sessionData.user_id);
		} catch (err) {
			res.status(404).json({
				error: "API_USER_NOT_FOUND",
				message: "User not found in database.",
			});
			return;
		}
		if (
			!userObj ||
			!userObj.roles ||
			!Array.isArray(userObj.roles) ||
			!userObj.roles.includes("administrator")
		) {
			res.status(403).json({
				error: "API_FORBIDDEN",
				message: "User does not have ADMINISTRATOR role.",
			});
			return;
		}

		const requiredFields = [
			"company_name",
			"company_address",
			"company_postal_code",
			"company_tax_number",
			"company_vat_id",
			"company_director",
			"commercial_register",
			"bank_name",
			"company_iban",
			"company_bic",
		];
		const missingFields = requiredFields.filter(
			(field) =>
				!(field in req.body) ||
				req.body[field] === undefined ||
				req.body[field] === ""
		);

		if (missingFields.length > 0) {
			res.status(400).json({
				error: "API_MISSING_FIELDS",
				message: `Please fill out all the data: missing ${missingFields.join(
					", "
				)}`,
			});
			return;
		}
		const companyData = {
			companyName: req.body.company_name,
			companyAddress: req.body.company_address,
			companyPostalCode: req.body.company_postal_code,
			companyEmail: req.body.company_email,
			companyPhone: req.body.company_phone,
			companyWebsite: req.body.company_website,
			companyTaxNumber: req.body.company_tax_number,
			companyVatId: req.body.company_vat_id,
			companyDirector: req.body.company_director,
			commercialRegister: req.body.commercial_register,
			bankName: req.body.bank_name,
			companyIban: req.body.company_iban,
			companyBic: req.body.company_bic,
		};
		try {
			const updatedCompany = await updateCompanyInDB(companyData);
			if (!updatedCompany) {
				res.status(500).json({
					error: "API_UPDATE_FAILED",
					message: "Failed to update company info.",
				});
				return;
			}
			res.status(200).json({
				success: true,
				company: updatedCompany,
			});
		} catch (err) {
			res.status(500).json({
				error: "API_UPDATE_FAILED",
				message: "Failed to update company info.",
			});
		}
	} catch (error) {
		res.status(500).json({
			error: "API_INTERNAL_ERROR",
			message: "Internal server error during company update",
		});
	}
};

companyInfoRouter.get("/", updateCompany);
companyInfoRouter.post("/", postUpdateCompany);

export default companyInfoRouter;
