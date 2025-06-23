import { Request, Response, NextFunction } from "express";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
	const status = err.status || 500;
	const message = err.message || "Internal Server Error";

	const method = req?.method ?? "UNKNOWN";
	const url = req?.url ?? "UNKNOWN";
	console.error(`[Error] ${method} ${url} →`, err);

	res.status(status).json({
		success: false,
		error: {
			message,
			code: err.code || undefined,
			details: err.details || undefined,
		},
	});
};
