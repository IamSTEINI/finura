import { query } from "../db/db";
import { Company } from "../db/schemas/COMPANY";

export async function getCompanyFromDB(): Promise<Company | null> {
	try {
		const result = await query("SELECT * FROM company");

		if (result.rows.length === 0) {
			return null;
		}

		const company = result.rows[0];
		return company;
	} catch (error) {
		console.error("Error fetching company data:", error);
		return null;
	}
}
