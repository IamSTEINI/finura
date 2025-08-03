import { query } from "../db/db";
import { Company } from "../db/schemas/COMPANY";

const fieldMap: Record<keyof Company, string> = {
	companyName: "company_name",
	companyAddress: "company_address",
	companyPostalCode: "company_postal_code",
	companyEmail: "company_email",
	companyPhone: "company_phone",
	companyWebsite: "company_website",
	companyTaxNumber: "company_tax_number",
	companyVatId: "company_vat_id",
	companyDirector: "company_director",
	commercialRegister: "commercial_register",
	bankName: "bank_name",
	companyIban: "company_iban",
	companyBic: "company_bic",
};

export async function updateCompanyInDB(
	data: Partial<Company>
): Promise<Company | null> {
	try {
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
		const sql = `UPDATE company SET ${updates.join(
			", "
		)} WHERE id = 1 RETURNING *`;
		console.log(sql, values);
		const result = await query(sql, values);
		if (result.rows.length === 0) {
			return null;
		}
		return result.rows[0] as Company;
	} catch (error) {
		console.error("Error updating company info:", error);
		return null;
	}
}
