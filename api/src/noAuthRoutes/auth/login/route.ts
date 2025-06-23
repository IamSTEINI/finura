import { Router, Request, Response } from "express";
import { createSession } from "../../../utils/auth/createSession";

const loginRouter = Router();

loginRouter.get("/", async (req: Request, res: Response) => {
	const session = await createSession("test", "000");
	res.status(200).json({ session });
});

export default loginRouter;
