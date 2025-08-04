import { query } from "../db/db";
import { hashPassword } from "../crypto/hash";

export async function createOrUpdateAdminUser() {
	const username = process.env.ADMIN_USERNAME || "admin";
	const password = process.env.ADMIN_PASSWORD || "admin";
	const email = process.env.ADMIN_EMAIL || "admin@example.com";
	const roles = ["administrator"];
	const defaultProfilePicture =
		process.env.ADMIN_PROFILE_PICTURE || "/admin-profile-picture.webp";
	const passwordHash = hashPassword(password);

	const adminByIdResult = await query(
		"SELECT username FROM users WHERE user_id = '0'"
	);

	const adminByUsernameResult = await query(
		"SELECT user_id FROM users WHERE username = $1",
		[username]
	);

	if (adminByIdResult.rows.length > 0) {
		await query(
			`UPDATE users SET username = $1, password_hash = $2, email = $3, roles = $4, updated_at = NOW(), profile_picture = $5, firstname = $6, lastname = $7 WHERE user_id = '0'`,
			[
				username,
				passwordHash,
				email,
				roles,
				defaultProfilePicture,
				"John",
				"Doe",
			]
		);
		console.log("[+] Admin user updated (ID: 0)");
	} else if (adminByUsernameResult.rows.length > 0) {
		await query(
			`INSERT INTO users (user_id, username, password_hash, email, roles, is_active, created_at, updated_at, profile_picture, firstname, lastname) VALUES ('0', $1, $2, $3, $4, true, NOW(), NOW(), $5, $6, $7)`,
			[
				username,
				passwordHash,
				email,
				roles,
				defaultProfilePicture,
				"John",
				"Doe",
			]
		);
		console.log("[+] Admin user recreated with ID: 0");
	} else {
		await query(
			`INSERT INTO users (user_id, username, password_hash, email, roles, is_active, created_at, updated_at, profile_picture, firstname, lastname) VALUES (0, $1, $2, $3, $4, true, NOW(), NOW(), $5, $6, $7)`,
			[
				username,
				passwordHash,
				email,
				roles,
				defaultProfilePicture,
				"John",
				"Doe",
			]
		);
		console.log("[+] Admin user created with ID: 0");
	}
}
