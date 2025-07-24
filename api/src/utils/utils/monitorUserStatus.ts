import { query } from "../db/db";

const userLastActivity = new Map<string, Date>();
const userWebSocketStatus = new Map<string, boolean>();

export async function monitorUserStatus(
	intervalMinutes: number = 5
): Promise<void> {
	const intervalMs = intervalMinutes * 60 * 1000;

	console.log(
		`[USER MONITOR] Starting user status monitoring (checking every ${intervalMinutes} minutes)`
	);

	setInterval(async () => {
		try {
			await checkAndUpdateInactiveUsers(intervalMinutes);
		} catch (error) {
			console.error(
				"[USER MONITOR] Error during user status check:",
				error
			);
		}
	}, intervalMs);

	try {
		await checkAndUpdateInactiveUsers(intervalMinutes);
	} catch (error) {
		console.error(
			"[USER MONITOR] Error during initial user status check:",
			error
		);
	}
}

export function updateUserActivity(userId: string): void {
	userLastActivity.set(userId, new Date());
	console.log(`[USER MONITOR] Updated activity for user ${userId}`);
}

export function setUserWebSocketStatus(userId: string, isConnected: boolean): void {
	userWebSocketStatus.set(userId, isConnected);
	console.log(`[USER MONITOR] User ${userId} WebSocket status: ${isConnected ? 'connected' : 'disconnected'}`);
	
	if (!isConnected) {
		userLastActivity.delete(userId);
		console.log(`[USER MONITOR] Removed activity tracking for disconnected user ${userId}`);
	}
}

export function isUserWebSocketConnected(userId: string): boolean {
	return userWebSocketStatus.get(userId) || false;
}
async function checkAndUpdateInactiveUsers(
	intervalMinutes: number
): Promise<void> {
	const now = new Date();
	const inactivityThreshold = intervalMinutes * 60 * 1000;

	try {
		const activeUsersResult = await query(
			"SELECT id FROM users WHERE is_active = true"
		);

		if (activeUsersResult.rows.length === 0) {
			console.log("[USER MONITOR] No active users found");
			return;
		}

		const usersToDeactivate: string[] = [];

		for (const user of activeUsersResult.rows) {
			const userId = user.id.toString();
			const lastActivity = userLastActivity.get(userId);
			const hasWebSocket = userWebSocketStatus.get(userId) || false;

			if (!hasWebSocket) {
				usersToDeactivate.push(userId);
				console.log(
					`[USER MONITOR] User ${userId} has no WebSocket connection - marking as inactive`
				);
				userLastActivity.delete(userId);
				continue;
			}

			if (!lastActivity) {
				usersToDeactivate.push(userId);
				console.log(
					`[USER MONITOR] User ${userId} has no recorded activity - marking as inactive`
				);
			} else {
				const timeSinceLastActivity =
					now.getTime() - lastActivity.getTime();

				if (timeSinceLastActivity > inactivityThreshold) {
					usersToDeactivate.push(userId);
					console.log(
						`[USER MONITOR] User ${userId} inactive for ${Math.round(
							timeSinceLastActivity / 60000
						)} minutes - marking as inactive`
					);

					userLastActivity.delete(userId);
				}
			}
		}

		if (usersToDeactivate.length > 0) {
			const placeholders = usersToDeactivate
				.map((_, index) => `$${index + 1}`)
				.join(",");
			const updateResult = await query(
				`UPDATE users SET is_active = false WHERE id::text IN (${placeholders})`,
				usersToDeactivate
			);

			console.log(
				`[USER MONITOR] Marked ${updateResult.rowCount} users as inactive`
			);
		} else {
			console.log("[USER MONITOR] All active users are still active");
		}
	} catch (error) {
		console.error("[USER MONITOR] Error checking inactive users:", error);
		throw error;
	}
}

export async function getUserActivityStatus(): Promise<
	Array<{ userId: string; lastActivity: Date | null; isTracked: boolean }>
> {
	try {
		const allUsersResult = await query("SELECT id FROM users");

		return allUsersResult.rows.map((user) => {
			const userId = user.id.toString();
			const lastActivity = userLastActivity.get(userId);

			return {
				userId,
				lastActivity: lastActivity || null,
				isTracked: userLastActivity.has(userId),
			};
		});
	} catch (error) {
		console.error(
			"[USER MONITOR] Error getting user activity status:",
			error
		);
		return [];
	}
}

export function stopUserStatusMonitoring(): void {
	userLastActivity.clear();
	console.log(
		"[USER MONITOR] User status monitoring stopped and activity data cleared"
	);
}
