// WE WANT A WEBSOCKET SERVER
// Connecting to REDIS service
// When authing, fetch user from redis service
// Handle user and their mailbox etc

import * as http from "http";
import * as WebSocket from "ws";

const server = http.createServer((req, res) => {
	res.writeHead(200, { "Content-Type": "application/json" });
	res.end("Hello World\n");
});

const activeSockets = new Map<string, WebSocket.WebSocket>();

type UserSession = {
	id: number;
	user_id: string;
	username: string;
	profile_picture: string;
	email: string;
	password_hash: string;
	created_at: string;
	updated_at: string;
	is_active: boolean;
	roles: string[];
	firstname: string;
	lastname: string;
};

const fetchSession = async (token: string): Promise<UserSession> => {
	try {
		const response = await fetch("http://localhost:8001/api/auth/me", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			throw new Error(
				`Fetch error: ${response.status} ${response.statusText}`
			);
		}

		const data = await response.json();
		if (data.success && data.user) {
			return data.user;
		} else {
			throw new Error("Invalid session response");
		}
	} catch (error) {
		console.error("Error fetching session:", error);
		throw error;
	}
};

const wss = new WebSocket.Server({ server });

const handleSocket = (ws: WebSocket.WebSocket, user: UserSession) => {
	console.log(`Handling socket for user ${user.username} (${user.user_id})`);

	ws.send(
		JSON.stringify({
			type: "NOTIFICATION",
			message: `Welcome back, ${user.username}`,
			sender: "FINURA",
		})
	);

  ws.send(
		JSON.stringify({
			type: "MAIL",
			message: `Logged in on new client`,
			sender: "FINURA",
      sender_id: "0",
		})
	);

	ws.on("error", (err) => {
		console.error(`Error for ${user.username}:`, err);
	});
};

let connectionCounter = 0;

wss.on("connection", (ws) => {
	const connectionId = ++connectionCounter;
	console.log(
		`[${connectionId}] Client connected, total connections:`,
		wss.clients.size
	);

	let isAuthorized = false;
	let currentUser: UserSession | null = null;
	let hasReceivedMessage = false;

	const authTimeout = setTimeout(() => {
		if (!isAuthorized) {
			console.log(
				`[${connectionId}] Authentication timeout - closing connection`
			);
			ws.close(4008, "Authentication timeout");
		}
	}, 10000);

	ws.on("message", async (message) => {
		hasReceivedMessage = true;
		console.log(`[${connectionId}] Received message:`, message.toString());

		try {
			const data = JSON.parse(message.toString());
			console.log(`[${connectionId}] Parsed message data:`, data);

			if (data.type === "AUTHORIZATION" && data.token && !isAuthorized) {
				console.log(
					`[${connectionId}] Authorization attempt with token:`,
					data.token ? "present" : "missing"
				);

				try {
					const session = await fetchSession(data.token);
					console.log(
						`[${connectionId}] Session authenticated for ${session.username} (${session.user_id})`
					);
					isAuthorized = true;
					currentUser = session;

					clearTimeout(authTimeout);

					const existing = activeSockets.get(session.user_id);
					if (existing) {
						console.log(
							`[${connectionId}] Closing existing connection for user ${session.user_id}`
						);
						existing.close(4001, "New connection established");
					}

					activeSockets.set(session.user_id, ws);
					console.log(
						`[${connectionId}] Added user ${session.user_id} to active sockets`
					);

					ws.send(
						JSON.stringify({
							type: "AUTHORIZATION_SUCCESS",
							user: session,
						})
					);

					handleSocket(ws, session);
				} catch (error) {
					console.error(
						`[${connectionId}] Authorization failed:`,
						error
					);
					ws.send(
						JSON.stringify({
							type: "ERROR",
							message: "Authorization failed",
						})
					);
					ws.close(4003, "Invalid token");
				}
				return;
			}

			if (!isAuthorized) {
				console.log(`[${connectionId}] Unauthorized message rejected`);
				ws.send(
					JSON.stringify({ type: "ERROR", message: "Not authorized" })
				);
				ws.close(4003, "Unauthorized");
				return;
			}
		} catch (err) {
			console.error(`[${connectionId}] Invalid message format:`, message);
			ws.send(
				JSON.stringify({ type: "ERROR", message: "Invalid format" })
			);
		}
	});

	ws.on("close", (code, reason) => {
		clearTimeout(authTimeout);
		console.log(
			`[${connectionId}] Connection closing with code: ${code}, reason: ${reason}`
		);
		console.log(
			`[${connectionId}] Had received message: ${hasReceivedMessage}, was authorized: ${isAuthorized}`
		);
		if (currentUser) {
			activeSockets.delete(currentUser.user_id);
			console.log(
				`[${connectionId}] Client ${currentUser.username} disconnected`
			);
		} else {
			console.log(
				`[${connectionId}] Unauthenticated client disconnected`
			);
		}
	});

	ws.on("error", (error) => {
		console.error(`[${connectionId}] WebSocket error:`, error);
	});
});

server.listen(8500, () => {
	console.log("Websocket listening on port 8500");
});
