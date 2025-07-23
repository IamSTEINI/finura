"use client";
import {
	createContext,
	useContext,
	useReducer,
	useEffect,
	ReactNode,
	useRef,
	useState,
	MouseEvent,
	useCallback,
} from "react";
import { useNotification } from "./NotificationContext";
import { useMailbox } from "./MailboxContext";

interface WebSocketMessage {
	id: string;
	timestamp: number;
	type: "sent" | "received";
	data: string;
}

interface WebSocketConnection {
	id: string;
	url: string;
	socket: WebSocket;
	isConnected: boolean;
	messages: WebSocketMessage[];
}

interface WebsocketContextType {
	connections: Record<string, WebSocketConnection>;
	createConnection: (id: string, url: string, jwt: string) => void;
	closeConnection: (id: string) => void;
	sendMessage: (connectionId: string, data: unknown) => boolean;
	getConnection: (id: string) => WebSocketConnection | undefined;
}

const websocketContext = createContext<WebsocketContextType>({
	connections: {},
	createConnection: () => {},
	closeConnection: () => {},
	sendMessage: () => false,
	getConnection: () => undefined,
});

type Action =
	| {
			type: "CREATE_CONNECTION";
			payload: { id: string; url: string; socket: WebSocket };
	  }
	| { type: "SET_CONNECTED"; payload: { id: string; isConnected: boolean } }
	| { type: "CLOSE_CONNECTION"; payload: { id: string } }
	| {
			type: "ADD_MESSAGE";
			payload: { id: string; message: WebSocketMessage };
	  };

const websocketReducer = (
	state: Record<string, WebSocketConnection>,
	action: Action
) => {
	switch (action.type) {
		case "CREATE_CONNECTION":
			return {
				...state,
				[action.payload.id]: {
					id: action.payload.id,
					url: action.payload.url,
					socket: action.payload.socket,
					isConnected: false,
					messages: [],
				},
			};
		case "SET_CONNECTED":
			return {
				...state,
				[action.payload.id]: {
					...state[action.payload.id],
					isConnected: action.payload.isConnected,
				},
			};
		case "ADD_MESSAGE":
			return {
				...state,
				[action.payload.id]: {
					...state[action.payload.id],
					messages: [
						...state[action.payload.id].messages,
						action.payload.message,
					],
				},
			};
		case "CLOSE_CONNECTION":
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { [action.payload.id]: _, ...rest } = state;
			return rest;
		default:
			return state;
	}
};

const WebSocketDeveloperWindow = ({
	connections,
}: {
	connections: Record<string, WebSocketConnection>;
}) => {
	const [expandedConnections, setExpandedConnections] = useState<
		Record<string, boolean>
	>({});
	const [expandedMessages, setExpandedMessages] = useState<
		Record<string, boolean>
	>({});
	const [position, setPosition] = useState({ x: 20, y: 20 });
	const [isDragging, setIsDragging] = useState(false);
	const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

	const handleMouseDown = (e: MouseEvent) => {
		setIsDragging(true);
		setDragOffset({
			x: e.clientX - position.x,
			y: e.clientY - position.y,
		});
	};

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (isDragging) {
				setPosition({
					x: e.clientX - dragOffset.x,
					y: e.clientY - dragOffset.y,
				});
			}
		},
		[isDragging, dragOffset]
	);

	const handleMouseUp = () => {
		setIsDragging(false);
	};

	useEffect(() => {
		if (isDragging) {
			document.addEventListener("mousemove", handleMouseMove as never);
			document.addEventListener("mouseup", handleMouseUp);
		}

		return () => {
			document.removeEventListener("mousemove", handleMouseMove as never);
			document.removeEventListener("mouseup", handleMouseUp);
		};
	}, [isDragging, dragOffset, handleMouseMove]);

	const formatTimestamp = (timestamp: number) => {
		return new Date(timestamp).toLocaleTimeString();
	};

	const formatMessageData = (data: string) => {
		try {
			const parsed = JSON.parse(data);
			return JSON.stringify(parsed, null, 2);
		} catch {
			return data;
		}
	};

	return (
		<div
			className="fixed rounded-md bg-black/40 border-color border backdrop-blur-sm p-5 min-w-[500px] max-w-[600px] max-h-[80vh] overflow-y-auto"
			style={{
				top: position.y + "px",
				left: position.x + "px",
				cursor: isDragging ? "grabbing" : "grab",
				zIndex: 9999,
			}}
			onMouseDown={handleMouseDown}>
			<div className="text-white text-sm">
				<h3 className="font-bold mb-4">WebSocket Developer Window</h3>
				{Object.keys(connections).length === 0 ? (
					<div className="text-gray-400">
						No active WebSocket connections
					</div>
				) : (
					<div className="space-y-3">
						{Object.entries(connections).map(
							([key, connection]) => (
								<div
									key={key}
									className="border-b border-gray-600 pb-3">
									<div
										className="cursor-pointer flex items-center justify-between"
										onClick={() =>
											setExpandedConnections((prev) => ({
												...prev,
												[key]: !prev[key],
											}))
										}>
										<span className="flex items-center">
											{expandedConnections[key]
												? "▼"
												: "►"}{" "}
											<span className="font-semibold">
												{key}
											</span>
											<span
												className={`ml-2 px-2 py-1 rounded text-xs ${
													connection.isConnected
														? "bg-green-600"
														: "bg-red-600"
												}`}>
												{connection.isConnected
													? "Connected"
													: "Disconnected"}
											</span>
										</span>
										<span className="text-xs text-gray-400">
											{connection.messages.length}{" "}
											messages
										</span>
									</div>

									{expandedConnections[key] && (
										<div className="mt-2 pl-4">
											<div className="text-xs text-gray-400 mb-2">
												URL: {connection.url}
											</div>

											<div className="space-y-2">
												<h4 className="font-semibold">
													Messages:
												</h4>
												{connection.messages.length ===
												0 ? (
													<div className="text-gray-500 text-xs">
														No messages yet
													</div>
												) : (
													<div className="space-y-1">
														{connection.messages
															.slice(-10)
															.map((message) => (
																<div
																	key={
																		message.id
																	}
																	className="border-l-2 border-gray-600 pl-2">
																	<div
																		className="cursor-pointer flex items-center justify-between"
																		onClick={() =>
																			setExpandedMessages(
																				(
																					prev
																				) => ({
																					...prev,
																					[message.id]:
																						!prev[
																							message
																								.id
																						],
																				})
																			)
																		}>
																		<span className="flex items-center text-xs">
																			{expandedMessages[
																				message
																					.id
																			]
																				? "▼"
																				: "►"}{" "}
																			<span
																				className={`px-1 py-0.5 rounded mr-2 ${
																					message.type ===
																					"sent"
																						? "bg-blue-600"
																						: "bg-green-600"
																				}`}>
																				{message.type.toUpperCase()}
																			</span>
																			<span className="text-gray-400">
																				{formatTimestamp(
																					message.timestamp
																				)}
																			</span>
																		</span>
																	</div>

																	{expandedMessages[
																		message
																			.id
																	] && (
																		<pre className="mt-1 text-xs text-gray-300 break-all whitespace-pre-wrap bg-gray-800 p-2 rounded max-h-32 overflow-y-auto">
																			{formatMessageData(
																				message.data
																			)}
																		</pre>
																	)}
																</div>
															))}
														{connection.messages
															.length > 10 && (
															<div className="text-xs text-gray-500">
																Showing last 10
																messages of{" "}
																{
																	connection
																		.messages
																		.length
																}
															</div>
														)}
													</div>
												)}
											</div>
										</div>
									)}
								</div>
							)
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export const WebsocketProvider = ({ children }: { children: ReactNode }) => {
	const [connections, dispatch] = useReducer(websocketReducer, {});
	const socketRef = useRef<Record<string, WebSocket>>({});
	const { addNotification } = useNotification();
	const { addMail } = useMailbox();

	const addMessage = useCallback(
		(connectionId: string, message: WebSocketMessage) => {
			dispatch({
				type: "ADD_MESSAGE",
				payload: { id: connectionId, message },
			});
		},
		[]
	);

	const createConnection = useCallback(
		(id: string, url: string, jwt: string) => {
			if (socketRef.current[id] && socketRef.current[id].readyState < 2) {
				// 0: CONNECTING, 1 is OPEN
				console.log(`WebSocket ${id} already connecting or open.`);
				return;
			}

			console.log(`Creating WebSocket connection ${id} to ${url}`);

			try {
				const socket = new WebSocket(url);
				socketRef.current[id] = socket;

				dispatch({
					type: "CREATE_CONNECTION",
					payload: { id, url, socket },
				});

				socket.onopen = () => {
					console.log(`WebSocket ${id} connected to ${url}`);
					const authMessage = JSON.stringify({
						type: "AUTHORIZATION",
						token: jwt,
					});
					socket.send(authMessage);
					addMessage(id, {
						id: Date.now().toString() + Math.random(),
						timestamp: Date.now(),
						type: "sent",
						data: authMessage,
					});
				};

				socket.onclose = (event) => {
					console.log(
						`WebSocket ${id} disconnected`,
						event.code,
						event.reason
					);
					dispatch({
						type: "SET_CONNECTED",
						payload: { id, isConnected: false },
					});
					if (socketRef.current[id] === socket) {
						delete socketRef.current[id];
					}
				};

				socket.onerror = (error) => {
					console.error(`WebSocket ${id} error:`, error);
					dispatch({
						type: "SET_CONNECTED",
						payload: { id, isConnected: false },
					});
				};

				socket.onmessage = (event) => {
					console.log(
						`WebSocket ${id} received message:`,
						event.data
					);

					addMessage(id, {
						id: Date.now().toString() + Math.random(),
						timestamp: Date.now(),
						type: "received",
						data: event.data,
					});

					try {
						const data = JSON.parse(event.data);
						if (data.type === "AUTHORIZATION_SUCCESS") {
							console.log(
								`WebSocket ${id} authorization successful`
							);
							dispatch({
								type: "SET_CONNECTED",
								payload: { id, isConnected: true },
							});
						} else if (data.type === "ERROR") {
							console.error(
								`WebSocket ${id} received error:",
								data.message`
							);
						} else if (data.type === "NOTIFICATION") {
							if (data.message && data.sender) {
								addNotification(data.message, data.sender);
							}
						} else if (data.type === "MAIL") {
							if (data.message && data.sender && data.sender_id) {
								addMail({
									author: data.sender,
									message: data.message,
									authorId: data.sender_id,
								});
							}
						}
					} catch (e) {
						console.log(
							`WebSocket ${id} received non-JSON message:`,
							event.data
						);
					}
				};
			} catch (error) {
				console.error(
					`Failed to create WebSocket connection ${id}:`,
					error
				);
			}
		},
		[addMessage]
	);

	const closeConnection = useCallback((id: string) => {
		const socket = socketRef.current[id];
		if (socket) {
			console.log(`Closing WebSocket connection ${id}`);
			socket.close();
			delete socketRef.current[id];
		}
		dispatch({ type: "CLOSE_CONNECTION", payload: { id } });
	}, []);

	const sendMessage = useCallback(
		(connectionId: string, data: unknown): boolean => {
			const socket = socketRef.current[connectionId];
			if (socket && socket.readyState === WebSocket.OPEN) {
				const messageData =
					typeof data === "string" ? data : JSON.stringify(data);
				socket.send(messageData);

				addMessage(connectionId, {
					id: Date.now().toString() + Math.random(),
					timestamp: Date.now(),
					type: "sent",
					data: messageData,
				});

				return true;
			}
			console.warn(
				`Cannot send message, WebSocket ${connectionId} is not connected.`
			);
			return false;
		},
		[addMessage]
	);

	const getConnection = useCallback(
		(id: string) => connections[id],
		[connections]
	);

	useEffect(() => {
		const sockets = Object.values(socketRef.current);
		return () => {
			sockets.forEach((socket) => {
				socket.close();
			});
		};
	}, []);

	const value = {
		connections,
		createConnection,
		closeConnection,
		sendMessage,
		getConnection,
	};

	return (
		<websocketContext.Provider value={value}>
			{children}
			{process.env.NODE_ENV === "development" && (
				<WebSocketDeveloperWindow connections={connections} />
			)}
		</websocketContext.Provider>
	);
};

export const useWebsocket = () => useContext(websocketContext);
