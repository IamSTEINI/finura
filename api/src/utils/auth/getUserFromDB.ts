import { verifyPassword } from "../crypto/hash";
import { query } from "../db/db";
import { User } from "../db/schemas/USER";

export async function getUserFromDB(
    user_id: String
): Promise<User | null> {
    try {
        const result = await query(
            "SELECT * FROM users WHERE id = $1",
            [parseInt(user_id as string)]
        );

        if (result.rows.length === 0) {
            return null;
        }

        const user = result.rows[0];
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    } catch (error) {
        console.error("Error checking user credentials:", error);
        return null;
    }
}
