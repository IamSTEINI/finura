"use client";
import React, { ReactNode, useEffect, useState, useCallback } from "react";
import DeveloperMenu from "../dev/DeveloperMenu";
import { useDevMode } from "@/context/DeveloperContext";
import { useWebsocket } from "@/context/WebsocketContext";

interface AuthProviderProps {
	children: ReactNode;
}

// Here we will check if the user ahs a valid JWT token, by sending it to the API TROUGH THE REDIS session proxy
const AuthProvider = ({ children }: AuthProviderProps) => {
	const [authenticated, setAuthenticated] = useState<boolean>(false);
	const [visible, setVisible] = useState<boolean>(false);
	const [wsInitialized, setWsInitialized] = useState<boolean>(false);
	const { createConnection, closeConnection, getConnection } = useWebsocket();
	// const redisServiceUrl =
		// process.env.REDIS_SERVICE_URL || "http://localhost:8001";
	const isProtectedRoute = useCallback(() => {
		const protectedRoutes = ["/dashboard"];
		if (typeof window !== "undefined") {
			const path = window.location.pathname;
			return protectedRoutes.some((route) => path.startsWith(route));
		}
		return false;
	}, []);

	useEffect(() => {
		if (isProtectedRoute()) {
			console.log("Authenticating for route " + window.location.pathname);
			const token = localStorage.getItem("DO_NOT_SHARE_SESSION_TOKEN");

			fetch("https://finura-redis-service-production.up.railway.app"+"/api/auth/me", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({}),
			})
				.then((response) => response.json())
				.then((data) => {
					console.log(data);
					if (data.success && data.user) {
						console.log(
							"[AUTH] User authenticated successfully:",
							data.user
						);
						setAuthenticated(true);

						if (!wsInitialized) {
							setTimeout(() => {
								const existingConnection =
									getConnection("notification-pipe");
								if (
									existingConnection &&
									existingConnection.isConnected
								) {
									console.log(
										"[NOTIFICATION] WebSocket already connected, skipping"
									);
									setWsInitialized(true);
									return;
								}

								closeConnection("notification-pipe");

								const wsUrl = "ws://127.0.0.1:8500/";
								const token = localStorage.getItem(
									"DO_NOT_SHARE_SESSION_TOKEN"
								);
								if (token) {
									console.log(
										"[NOTIFICATION] Connecting to websocket:",
										wsUrl
									);
									try {
										createConnection(
											"notification-pipe",
											wsUrl,
											token
										);
										setWsInitialized(true);
										console.log(
											"[NOTIFICATION] WebSocket connection initiated"
										);
									} catch (error) {
										console.error(
											"[NOTIFICATION] Failed to create WebSocket connection:",
											error
										);
									}
								} else {
									console.warn(
										"[NOTIFICATION] No token found for WebSocket connection"
									);
								}
							}, 100);
						}

						window.localStorage.setItem(
							"USER_INFO",
							JSON.stringify(data.user)
						);
					} else {
						console.log("[AUTH] Authentication failed:", data);
						window.location.href = "/signin";
					}
				})
				.catch((error) => {
					console.error("Authentication error:", error);
					window.location.href = "/signin";
				});
		} else {
			setAuthenticated(true);
		}
	}, [
		isProtectedRoute,
		createConnection,
		closeConnection,
		getConnection,
		wsInitialized,
	]);

	useEffect(() => {
		if (authenticated) {
			const timer = setTimeout(() => setVisible(true), 10);
			return () => clearTimeout(timer);
		}
	}, [authenticated]);

	const { devMode } = useDevMode();

	if (!authenticated && isProtectedRoute())
		return (
			<div className="h-screen w-full flex justify-center items-center select-none">
				<div className="flex flex-col justify-center items-center space-y-2">
					<div className="border-[#825494] border-3 animate-spin w-[30px] h-[30px] rounded-full font-bold text-xl text-[#825494]">
						-
					</div>
					<span>Loading</span>
				</div>
			</div>
		);
	return (
		<div
			className={`transition-opacity duration-300 ease-in ${
				visible ? "opacity-100" : "opacity-0"
			}`}>
			{devMode ? <DeveloperMenu>{children}</DeveloperMenu> : children}
		</div>
	);
};

export default AuthProvider;
