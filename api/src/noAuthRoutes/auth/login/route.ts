import { Router, RequestHandler } from "express";
import { createSession } from "../../../utils/auth/createSession";
import express from "express";
import { checkUserInDB } from "../../../utils/auth/checkUserInDB";

const loginRouter = Router();
loginRouter.use(express.json());

const loginHandler: RequestHandler = async (req, res) => {
	try {
		if (!req.body) {
			throw new Error("LOGIN_MISSING_BODY");
		}

		const { unameoremail, password } = req.body;

		if (typeof unameoremail !== "string" || typeof password !== "string") {
			throw new Error("LOGIN_INVALID_INPUT_TYPE");
		}

		const sanitizedUnameOrEmail = unameoremail.trim();
		const sanitizedPassword = password;
		req.body.unameoremail = sanitizedUnameOrEmail;
		req.body.password = sanitizedPassword;

		if (!sanitizedUnameOrEmail || !sanitizedPassword) {
			throw new Error("LOGIN_MISSING_CREDENTIALS");
		}

		const user = await checkUserInDB(sanitizedUnameOrEmail, password);
		if (user) {
			const session = await createSession(
				user.id,
				user.username,
				["member"]
			);

			res.status(200).json({ session });
		} else {
			throw new Error("LOGIN_NOT_FOUND");
		}
	} catch (error) {
		throw error;
	}
};

loginRouter.post("/", loginHandler);

export default loginRouter;
