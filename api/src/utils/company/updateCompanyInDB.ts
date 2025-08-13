import { query } from "../db/db";
import { Company } from "../db/schemas/COMPANY";

const fieldMap: Record<keyof Company, string> = {
	company_name: "company_name",
	company_address: "company_address",
	company_postal_code: "company_postal_code",
	company_email: "company_email",
	company_phone: "company_phone",
	company_website: "company_website",
	company_tax_number: "company_tax_number",
	company_vat_id: "company_vat_id",
	company_director: "company_director",
	commercial_register: "commercial_register",
	bank_name: "bank_name",
	company_iban: "company_iban",
	company_bic: "company_bic",
	id: "",
};

export async function updateCompanyInDB(
	data: Partial<Company>
): Promise<Company | null> {
	try {
		const existingCompany = await query(
			"SELECT id FROM company WHERE id = 1"
		);

		if (existingCompany.rows.length === 0) {
			const insertFields: string[] = [];
			const insertPlaceholders: string[] = [];
			const insertValues: any[] = [];
			let idx = 1;

			for (const key in data) {
				if (key === "id") continue;
				if (
					data[key as keyof Company] !== undefined &&
					fieldMap[key as keyof Company]
				) {
					insertFields.push(fieldMap[key as keyof Company]);
					insertPlaceholders.push(`$${idx}`);
					insertValues.push(data[key as keyof Company]);
					idx++;
				}
			}

			if (insertFields.length === 0) {
				throw new Error("No valid fields to insert");
			}

			const insertSql = `INSERT INTO company (id, ${insertFields.join(
				", "
			)}) VALUES (1, ${insertPlaceholders.join(", ")}) RETURNING *`;
			console.log(insertSql, insertValues);
			const insertResult = await query(insertSql, insertValues);
			return insertResult.rows[0] as Company;
		} else {
			const updates: string[] = [];
			const values: any[] = [];
			let idx = 1;

			for (const key in data) {
				if (key === "id") continue;
				if (
					data[key as keyof Company] !== undefined &&
					fieldMap[key as keyof Company]
				) {
					updates.push(`${fieldMap[key as keyof Company]} = $${idx}`);
					values.push(data[key as keyof Company]);
					idx++;
				}
			}

			if (updates.length === 0) {
				throw new Error("No valid fields to update");
			}

			const updateSql = `UPDATE company SET ${updates.join(
				", "
			)} WHERE id = 1 RETURNING *`;
			console.log(updateSql, values);
			const updateResult = await query(updateSql, values);

			if (updateResult.rows.length === 0) {
				return null;
			}
			return updateResult.rows[0] as Company;
		}
	} catch (error) {
		console.error("Error updating/inserting company info:", error);
		return null;
	}
}
