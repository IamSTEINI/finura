import { Router, RequestHandler } from "express";
import express from "express";
import { checkUserInDB } from "../../utils/auth/checkUserInDB";
import { fetchSession } from "../../utils/auth/fetchSession";
import { getUserFromDB } from "../../utils/auth/getUserFromDB";
import { setUserActive } from "../../utils/utils/setUserActive";
import { updateUserActivity } from "../../utils/utils/monitorUserStatus";

const authmeRouter = Router();
authmeRouter.use(express.json());

const meHandler: RequestHandler = async (req, res) => {
	try {
		if (
			!req.headers.authorization ||
			!req.headers.authorization.startsWith("Bearer ")
		) {
			throw new Error("AUTH_MISSING_HEADER");
		}

		//DEBUG
		const token = req.headers.authorization.split(" ")[1];
		console.log("RECEIVED TOKEN: ", token);

		// const mockUserSession = {
		// 	id: "user123",
		// 	name: "John Doe",
		// 	email: "john@example.com",
		// 	roles: ["user"],
		// 	permissions: ["read:data"],
		// 	lastLogin: new Date().toISOString(),
		// };

		// res.status(200).json({
		// 	success: true,
		// 	data: mockUserSession,
		// });

		// http://localhost:8001/api/auth/me
		const fetched_session = await fetchSession(token);
		console.log(fetched_session);
		const userObj = await getUserFromDB(fetched_session.user_id);
		console.log(userObj);
		if (userObj?.id) {
			setUserActive(String(userObj.id), true);

			// Only track activity if it's not a WebSocket heartbeat
			const isHeartbeat = req.query.heartbeat === "true";
			if (!isHeartbeat) {
				updateUserActivity(String(userObj.id));
				console.log(
					`[AUTH] Real user activity tracked for user ${userObj.id}`
				);
			} else {
				console.log(
					`[AUTH] WebSocket heartbeat ignored for user ${userObj.id}`
				);
			}
		} else {
			console.warn(
				"User ID is undefined or null, skipping setUserActive."
			);
		}
		res.status(200).json({
			success: true,
			session: fetched_session,
			user: userObj,
		});
	} catch (error) {
		res.status(401).json({
			success: false,
			error:
				error instanceof Error
					? error.message
					: "Authentication failed",
		});
	}
};

authmeRouter.post("/", meHandler);

export default authmeRouter;
