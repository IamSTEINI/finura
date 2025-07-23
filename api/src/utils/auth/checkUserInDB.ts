import { verifyPassword } from "../crypto/hash";
import { query } from "../db/db";

export async function checkUserInDB(
	usernameoremail: string,
	password: string
): Promise<{ id: string; username: string; email: string } | null> {
	try {
		const result = await query(
			"SELECT id, username, email, password_hash FROM users WHERE username = $1 OR email = $1",
			[usernameoremail]
		);

		if (result.rows.length === 0) {
			return null;
		}

		const user = result.rows[0];
		const isValidPassword = await verifyPassword(password, user.password_hash);
		
		if (!isValidPassword) {
			return null;
		}

		return {
			id: user.id.toString(),
			username: user.username,
			email: user.email
		};
	} catch (error) {
		console.error("Error checking user credentials:", error);
		return null;
	}
}
