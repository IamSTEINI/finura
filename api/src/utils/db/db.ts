import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
	user: process.env.PG_USER,
	host: process.env.PG_HOST,
	database: process.env.PG_DATABASE,
	password: process.env.PG_PASSWORD ? String(process.env.PG_PASSWORD) : "",
	port: process.env.PG_PORT ? parseInt(process.env.PG_PORT) : 5432,
});

export async function query(text: string, params?: any[]) {
	const start = Date.now();
	const res = await pool.query(text, params);
	const duration = Date.now() - start;
	console.log("[POSTGRES] [QUERY]", { text, duration, rows: res.rowCount });
	return res;
}

export async function testConnection() {
	try {
		const result = await query("SELECT NOW()");
		return {
			success: true,
			timestamp: result.rows[0].now,
			port: process.env.PG_PORT,
		};
	} catch (error) {
		let errorMessage = "Database connection failed";

		if (error instanceof Error) {
			if (error.message.includes("timeout")) {
				errorMessage = "Database connection timed out";
			} else if (error.message.includes("ECONNREFUSED")) {
				errorMessage =
					"Connection refused. Database server may be down";
			} else if (
				error.message.includes("password authentication failed")
			) {
				errorMessage = "Authentication failed. Check credentials";
			} else if (
				error.message.includes("database") &&
				error.message.includes("does not exist")
			) {
				errorMessage = "Database does not exist";
			}
		}

		console.error(`Database connection error: ${errorMessage}`, error);

		return {
			success: false,
			error: error instanceof Error ? error.message : String(error),
			errorDetail: errorMessage,
			connectionInfo: {
				host: process.env.PG_HOST,
				database: process.env.PG_DATABASE,
				port: process.env.PG_PORT,
			},
		};
	}
}
