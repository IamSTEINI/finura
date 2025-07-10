import { Request, Response, NextFunction } from "express";

const redisProxyMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const requestIP = req.ip || req.socket?.remoteAddress || "";

	if (
		requestIP === "127.0.0.1" ||
		requestIP === "::1" ||
		requestIP.includes("localhost")
	) {
		next();
	} else {
        console.log(`Blocked request from: ${requestIP} accessing: ${req.path}`);
		res.status(403).json({ error: "Access denied." });
	}
};

export default redisProxyMiddleware;
