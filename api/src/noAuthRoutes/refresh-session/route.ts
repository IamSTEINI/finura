import { RequestHandler, Router } from "express";
import express from "express";

const sessionRefreshRouter = Router();
sessionRefreshRouter.use(express.json());

const refreshSession: RequestHandler = async (req, res) => {
	try {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			res.status(401).json({
				error: "REFRESH_SESSION_MISSING_TOKEN",
				message:
					"Missing or invalid Authorization header. Please provide a valid Bearer token.",
			});
			return;
		}

		const refreshToken = authHeader.substring(7).trim();
		if (!refreshToken) {
			res.status(401).json({
				error: "REFRESH_SESSION_INVALID_TOKEN",
				message: "Refresh token is required for session refresh",
			});
			return;
		}

		const redisServiceUrl =
			process.env.REDIS_SERVICE_URL || "http://localhost:8001";

		const refreshResponse = await fetch(
			`${redisServiceUrl}/noauth/refresh`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${refreshToken}`,
					"Content-Type": "application/json",
				},
			}
		);

		if (!refreshResponse.ok) {
			if (refreshResponse.status === 401) {
				res.status(401).json({
					error: "REFRESH_SESSION_EXPIRED",
					message:
						"Refresh token is expired or invalid. Please log in again.",
				});
				return;
			}

			const errorText = await refreshResponse.text();
			throw new Error(
				`Backend refresh failed: ${refreshResponse.statusText} - ${errorText}`
			);
		}

		const newSession = await refreshResponse.json();

		res.status(200).json({
			success: true,
			message: "Session refreshed successfully",
			data: {
				token: newSession.token,
				session_id: newSession.session_id,
				expires_in: newSession.expires_in,
				user_id: newSession.user_id,
				username: newSession.username,
			},
		});

		console.log(
			`[SESSION REFRESH] User ${newSession.user_id} (${newSession.username}) refreshed session successfully`
		);
	} catch (error) {
		console.error("Session refresh error:", error);

		res.status(500).json({
			error: "REFRESH_SESSION_INTERNAL_ERROR",
			message: "Internal server error during session refresh",
		});
	}
};

sessionRefreshRouter.post("/", refreshSession);
export default sessionRefreshRouter;
