import { verifyPassword } from "../crypto/hash";
import { query } from "../db/db";

export async function checkUserInDB(
	usernameoremail: string,
	password: string
): Promise<boolean> {
	try {
		const result = await query(
			"SELECT password_hash FROM users WHERE username = $1 OR email = $1",
			[usernameoremail]
		);

		if (result.rows.length === 0) {
			return false;
		}

		const hashFromDB = result.rows[0].password_hash;
		return verifyPassword(password, hashFromDB);
	} catch (error) {
		console.error("Error checking user credentials:", error);
		return false;
	}
}
