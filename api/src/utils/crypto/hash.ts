import * as crypto from "crypto";

export function hashPassword(password: string): string {
	const pepper = process.env.HASH_PEPPER || "very-secret-spicy-hash-pepper";

	const iterations = 10000;
	const keyLength = 64;
	const digest = "sha512";

	const hash = crypto.pbkdf2Sync(
		password,
		pepper,
		iterations,
		keyLength,
		digest
	);

	return hash.toString("hex");
}

export function verifyPassword(password: string, storedHash: string): boolean {
	const hashedPassword = hashPassword(password);

	try {
		const hashedBuffer = Buffer.from(hashedPassword, "hex");
		const storedBuffer = Buffer.from(storedHash, "hex");

		if (hashedBuffer.length !== storedBuffer.length) {
			return false;
		}

		return crypto.timingSafeEqual(hashedBuffer, storedBuffer);
	} catch (error) {
		return false;
	}
}
