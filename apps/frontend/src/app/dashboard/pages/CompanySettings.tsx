import Card from "@/app/components/ui/Card";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Upload } from "lucide-react";

type Company = {
	id: number;
	company_name: string;
	company_address: string;
	company_postal_code: string;
	company_email: string;
	company_phone: string;
	company_website: string;
	company_tax_number: string;
	company_vat_id: string;
	company_director: string;
	commercial_register: string;
	bank_name: string;
	company_iban: string;
	company_bic: string;
};

function CompanySettings() {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [company, setCompany] = useState<Company | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const redisServiceUrl =
		process.env.REDIS_SERVICE_URL || "http://localhost:8001";
	useEffect(() => {
		const fetchCompany = async () => {
			const token = localStorage.getItem("DO_NOT_SHARE_SESSION_TOKEN");
			if (!token) {
				setError("No session token found.");
				setLoading(false);
				return;
			}
			try {
				const res = await fetch(
					redisServiceUrl+"/api/company/info",
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);
				const data = await res.json();
				if (!data.success) {
					setError("You do not have access to this page.");
				} else {
					setCompany(data.company);
				}
			} catch {
				setError("Failed to fetch company info. Please try again");
			}
			setLoading(false);
		};
		fetchCompany();
	}, []);

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				duration: 0.2,
				when: "beforeChildren",
				staggerChildren: 0.1,
			},
		},
	};

	const cardVariants = {
		hidden: { y: 20, opacity: 0 },
		visible: {
			y: 0,
			opacity: 1,
			transition: { duration: 0.25 },
		},
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError(null);
		setSuccess(null);
		const form = e.currentTarget;
		const formData = new FormData(form);

		const payload = {
			company_name: formData.get("company_name") as string,
			company_address: formData.get("company_address") as string,
			company_postal_code: formData.get("company_postal_code") as string,
			company_email: formData.get("company_email") as string,
			company_phone: formData.get("company_phone") as string,
			company_website: formData.get("company_website") as string,
			company_tax_number: formData.get("company_tax_number") as string,
			company_vat_id: formData.get("company_vat_id") as string,
			company_director: formData.get("company_director") as string,
			commercial_register: formData.get("commercial_register") as string,
			bank_name: formData.get("bank_name") as string,
			company_iban: formData.get("company_iban") as string,
			company_bic: formData.get("company_bic") as string,
		};

		const token = localStorage.getItem("DO_NOT_SHARE_SESSION_TOKEN");
		if (!token) {
			setError("No session token found.");
			return;
		}
		try {
			const res = await fetch(redisServiceUrl+"/api/company/info", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(payload),
			});
			const data = await res.json();
			if (!data.success) {
				setError(data.message || "Failed to save company info.");
			} else {
				setSuccess("Company information updated successfully.");
				setCompany(data.company);
			}
		} catch {
			setError("Failed to save company info. Please try again.");
		}
	};

	if (loading) {
		return (
			<div className="h-screen w-full flex justify-center items-center select-none">
				<div className="flex flex-col justify-center items-center space-y-2">
					<div className="border-[#825494] border-3 animate-spin w-[30px] h-[30px] rounded-full font-bold text-xl text-[#825494]">
						-
					</div>
					<span>Loading</span>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<motion.div className="p-6 max-w-4xl mx-auto text-red-500">
				{error}
			</motion.div>
		);
	}

	return (
		<motion.div
			className="p-6 max-w-4xl mx-auto"
			initial="hidden"
			animate="visible"
			variants={containerVariants}>
			<motion.h1
				className="text-2xl font-bold mb-6"
				variants={cardVariants}
				initial="hidden"
				animate="visible">
				Company Settings
			</motion.h1>

			{success && <div className="mb-4 text-green-600">{success}</div>}

			<form className="space-y-8" onSubmit={handleSubmit}>
				<motion.div
					variants={cardVariants}
					initial="hidden"
					animate="visible">
					<Card className="rounded-lg shadow-sm border border-white/25">
						<h2 className="text-lg font-medium mb-4">Logo</h2>
						<div className="w-full h-fit flex flex-row flex-wrap items-start gap-5">
							<div className="w-full h-full group flex items-center justify-center relative">
								<img
									src={
										"https://shmector.com/_ph/13/188552034.png"
									}
									className="object-cover max-w-[250px] max-h-[250px] rounded"
								/>
								<label className="absolute inset-0 w-full h-full -translate-x-1.5 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity duration-200 rounded">
									<Upload />
									<span className="text-white font-medium">
										Click to update logo
									</span>
									<input type="file" className="hidden" />
								</label>
							</div>
							<p>
								This will be the logo displayed on all your
								official documents, including invoices, etc.
								Having your company logo here ensures consistent
								branding across all customer-facing materials,
								helping to build trust and recognition with your
								clients. Please upload a high-quality image that
								accurately represents your business identity.
							</p>
						</div>
					</Card>
				</motion.div>
				<motion.div
					variants={cardVariants}
					initial="hidden"
					animate="visible">
					<Card className="rounded-lg shadow-sm border border-white/25">
						<h2 className="text-lg font-medium mb-4">
							General Information
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<span className="block text-sm font-medium mb-1">
									Company Name{" "}
									<span className="text-red-500">*</span>
								</span>
								<input
									name="company_name"
									type="text"
									className="w-full p-2 border border-white/25 rounded"
									placeholder="Acme Corporation"
									required
									defaultValue={company?.company_name}
								/>
							</div>
							<div>
								<span className="block text-sm font-medium mb-1">
									Address{" "}
									<span className="text-red-500">*</span>
								</span>
								<input
									name="company_address"
									type="text"
									className="w-full p-2 border border-white/25 rounded"
									placeholder="123 Business Street"
									required
									defaultValue={company?.company_address}
								/>
							</div>
							<div>
								<span className="block text-sm font-medium mb-1">
									Postal Code & City{" "}
									<span className="text-red-500">*</span>
								</span>
								<input
									name="company_postal_code"
									type="text"
									className="w-full p-2 border border-white/25 rounded"
									placeholder="10115 Berlin"
									required
									defaultValue={
										company
											? `${company.company_postal_code}`
											: ""
									}
								/>
							</div>
							<div>
								<span className="block text-sm font-medium mb-1">
									Email
								</span>
								<input
									name="company_email"
									type="email"
									className="w-full p-2 border border-white/25 rounded"
									placeholder="contact@acmecorp.com"
									defaultValue={company?.company_email}
								/>
							</div>
							<div>
								<span className="block text-sm font-medium mb-1">
									Phone
								</span>
								<input
									name="company_phone"
									type="tel"
									className="w-full p-2 border border-white/25 rounded"
									placeholder="+49 123 4567890"
									defaultValue={company?.company_phone}
								/>
							</div>
							<div>
								<span className="block text-sm font-medium mb-1">
									Website
								</span>
								<input
									name="company_website"
									type="url"
									className="w-full p-2 border border-white/25 rounded"
									placeholder="https://www.acmecorp.com"
									defaultValue={company?.company_website}
								/>
							</div>
						</div>
					</Card>
				</motion.div>
				<motion.div
					variants={cardVariants}
					initial="hidden"
					animate="visible">
					<Card className="rounded-lg shadow-sm border border-white/25">
						<h2 className="text-lg font-medium mb-4">
							Legal Information
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<span className="block text-sm font-medium mb-1">
									Tax Number{" "}
									<span className="text-red-500">*</span>
								</span>
								<input
									name="company_tax_number"
									type="text"
									className="w-full p-2 border border-white/25 rounded"
									placeholder="123/456/78910"
									required
									defaultValue={company?.company_tax_number}
								/>
							</div>
							<div>
								<span className="block text-sm font-medium mb-1">
									VAT ID{" "}
									<span className="text-red-500">*</span>
								</span>
								<input
									name="company_vat_id"
									type="text"
									className="w-full p-2 border border-white/25 rounded"
									placeholder="DE123456789"
									required
									defaultValue={company?.company_vat_id}
								/>
							</div>
							<div>
								<span className="block text-sm font-medium mb-1">
									Managing Director{" "}
									<span className="text-red-500">*</span>
								</span>
								<input
									name="company_director"
									type="text"
									className="w-full p-2 border border-white/25 rounded"
									placeholder="Jane Doe"
									required
									defaultValue={company?.company_director}
								/>
							</div>
							<div>
								<span className="block text-sm font-medium mb-1">
									Commercial Register{" "}
									<span className="text-red-500">*</span>
								</span>
								<input
									name="commercial_register"
									type="text"
									className="w-full p-2 border border-white/25 rounded"
									placeholder="HRB 12345 B"
									required
									defaultValue={company?.commercial_register}
								/>
							</div>
						</div>
					</Card>
				</motion.div>
				<motion.div
					variants={cardVariants}
					initial="hidden"
					animate="visible">
					<Card className="rounded-lg shadow-sm border border-white/25">
						<h2 className="text-lg font-medium mb-4">
							Banking Details
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<span className="block text-sm font-medium mb-1">
									Bank Name{" "}
									<span className="text-red-500">*</span>
								</span>
								<input
									name="bank_name"
									type="text"
									className="w-full p-2 border border-white/25 rounded"
									placeholder="Deutsche Bank"
									required
									defaultValue={company?.bank_name}
								/>
							</div>
							<div>
								<span className="block text-sm font-medium mb-1">
									IBAN <span className="text-red-500">*</span>
								</span>
								<input
									name="company_iban"
									type="text"
									className="w-full p-2 border border-white/25 rounded"
									placeholder="DE89 3704 0044 0532 0130 00"
									required
									defaultValue={company?.company_iban}
								/>
							</div>
							<div>
								<span className="block text-sm font-medium mb-1">
									BIC <span className="text-red-500">*</span>
								</span>
								<input
									name="company_bic"
									type="text"
									className="w-full p-2 border border-white/25 rounded"
									placeholder="DEUTDEDBXXX"
									required
									defaultValue={company?.company_bic}
								/>
							</div>
						</div>
					</Card>
				</motion.div>
				<motion.div
					className="flex justify-end"
					variants={cardVariants}
					initial="hidden"
					animate="visible">
					<motion.button
						type="submit"
						className="px-4 py-2 bg-blue-600 text-white rounded w-full md:w-fit">
						Save Changes
					</motion.button>
				</motion.div>
			</form>
		</motion.div>
	);
}

export default CompanySettings;
