import { verifyPassword } from "../crypto/hash";
import { query } from "../db/db";

export async function setUserActive(
	id: string,
	isActive: boolean
): Promise<boolean> {
	try {
		const result = await query(
			"UPDATE users SET is_active = $1 WHERE id = $2 RETURNING id",
			[isActive, id]
		);

		return result.rowCount !== null && result.rowCount > 0;
	} catch (error) {
		console.error("Error updating user active status:", error);
		return false;
	}
}
