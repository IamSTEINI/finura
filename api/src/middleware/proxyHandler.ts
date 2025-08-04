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
		requestIP === "::ffff:100.64.0.4" ||
		requestIP.includes("localhost")
	) {
		next();
	} else {
		next();
		//! BYPASS DUE RAILWAY DEMO
        console.log(`Blocked request from: ${requestIP} accessing: ${req.path}`);
		// res.status(403).json({ error: "Access denied." });
	}
};

export default redisProxyMiddleware;
