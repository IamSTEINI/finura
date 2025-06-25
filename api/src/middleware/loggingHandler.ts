import { Request, Response, NextFunction } from "express";

export const loggingHandler = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const timestamp = new Date().toISOString();
	const ip = req.ip || req.socket.remoteAddress || "unknown";

	res.on("finish", () => {
		console.log(
			`[${timestamp}] ${req.method} ${req.url} - ${res.statusCode} - ${ip}`,
			" - B", req.body || "no body"
		);
	});

	next();
};
