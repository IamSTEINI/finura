"use client";
import { useLocale } from "@/context/LocaleContext";
import Image from "next/image";
import React, { useState } from "react";
import Seperator from "../components/ui/Seperator";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Eye, EyeClosed } from "lucide-react";
import ChildrenInput from "../components/ui/ChildrenInput";
import Footer from "../components/ui/Footer";
import Header from "../components/ui/Header";

function SignIn() {
	const { t } = useLocale();
	const [step, setStep] = useState("email");
	const [emailOrUsername, setEmailOrUsername] = useState("");
	const [error, setError] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	const handleContinue = () => {
		if (!emailOrUsername.trim()) {
			setError(t("errors.signin.MISSING_DATA"));
			return;
		}

		setStep("password");
		setError("");
	};

	React.useEffect(() => {
		if (error) {
			const timer = setTimeout(() => {
				setError("");
			}, 2000);

			return () => clearTimeout(timer);
		}
	}, [error]);

	const login = async () => {
		try {
			if (!password.trim()) {
				setError(t("errors.signin.MISSING_PASSWORD"));
				return;
			}

			console.log("Attempting login req to:", "http://localhost:10000/noauth/auth/login/");

			const response = await fetch(
				"https://finura-api-production.up.railway.app/noauth/auth/login/",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						unameoremail: emailOrUsername,
						password: password,
					}),
					credentials: 'include',
				}
			);

			const data = await response.json();
			console.log("Response data:", data);

			if (!response.ok) {
				setError(data.message || t("errors.signin.LOGIN_FAILED"));
				return;
			} else {
				if (data.session) {
					localStorage.setItem(
						"DO_NOT_SHARE_SESSION_TOKEN",
						data.session.token
					);
					localStorage.setItem(
						"DO_NOT_SHARE_SESSION_REFRESH_TOKEN",
						data.session.refresh_token
					);
					window.location.href = "/dashboard";
					
				} else {
					setError(t("errors.signin.LOGIN_FAILED"))
				}
			}
		} catch (err) {
			console.error("Login error:", err);
			if (err instanceof Error) {
				console.error("Error details:", {
					name: err.name,
					message: err.message,
					stack: err.stack
				});
			}
			setError(t("errors.signin.LOGIN_FAILED"));
		}
	};

	return (
		<div className="w-full h-screen flex flex-col space-y-2 justify-center items-center px-5 overflow-hidden">
			<Header />
			<Image
				src="/finura/FINURA_BANNER.png"
				alt="Logo"
				width={200}
				height={200}
				className="-translate-y-10"></Image>

			<div className="w-full h-[250px] flex justify-center items-center">
				<AnimatePresence mode="wait">
					{step === "email" ? (
						<motion.div
							key="email-card"
							initial={{ x: "-100%", opacity: 0 }}
							animate={{ x: 0, opacity: 1 }}
							exit={{ x: "-100%", opacity: 0 }}
							transition={{ duration: 0.3 }}
							className="md:w-[50%] md:max-w-[700px] min-w-[400px] w-full card flex flex-col space-y-2 items-center"
							style={{ padding: "24px" }}>
							<h1 className="truncate w-full">
								{t("general.sign_in_page_title").replace(
									"%workspace",
									"your workspace"
								)}
							</h1>
							<Seperator />
							<div className="w-full h-fit mt-5">
								<span className="opacity-50 ml-0.5 w-full text-start">
									{t("general.sign_in_page_label")}
								</span>
								<input
									className="w-full"
									type="text"
									value={emailOrUsername}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											handleContinue();
										}
									}}
									onChange={(e) =>
										setEmailOrUsername(e.target.value)
									}
									placeholder={t(
										"general.sign_in_page_placeholder"
									)}></input>
							</div>
							<button
								className="btn-forward w-full h-[40px]"
								onClick={handleContinue}>
								{t("general.continue")}
							</button>
							{error && (
								<span className="text-red-500 translate-y-2">
									{error}
								</span>
							)}
						</motion.div>
					) : (
						<motion.div
							key="password-card"
							initial={{ x: "100%", opacity: 0 }}
							animate={{ x: 0, opacity: 1 }}
							exit={{ x: "100%", opacity: 0 }}
							transition={{ duration: 0.3 }}
							className="md:w-[50%] md:max-w-[700px] min-w-[400px] w-full card flex flex-col space-y-2 items-center"
							style={{ padding: "24px" }}>
							<h1 className="truncate w-full">
								{t(
									"general.sign_in_page_title_continued"
								).replace("%workspace", "your workspace")}
							</h1>
							<Seperator />
							<div className="w-full h-fit mt-5">
								<span className="opacity-50 ml-0.5 w-full text-start">
									{t("general.sign_in_password_label")}
								</span>
								<ChildrenInput
									className="w-full border-color border"
									childPosition="right"
									type={showPassword ? "text" : "password"}
									value={password}
									focus={true}
									onChange={(e) =>
										setPassword(e.target.value)
									}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											login();
										}
									}}
									placeholder={t(
										"general.sign_in_password_placeholder"
									)}>
									<div
										className="cursor-pointer opacity-50 hover:opacity-100 transition-all"
										onClick={() =>
											setShowPassword(!showPassword)
										}>
										{showPassword ? (
											<Eye size={18} />
										) : (
											<EyeClosed size={18} />
										)}
									</div>
								</ChildrenInput>
							</div>
							<button
								onClick={() => login()}
								className="btn-forward w-full h-[40px]">
								{t("general.sign_in")}
							</button>
							<div className="flex w-full">
								<span
									className="w-fit text-start px-2 cursor-pointer flex flex-row items-center gap-x-2 opacity-50 hover:opacity-100 transition-all"
									onClick={() => setStep("email")}>
									<ArrowLeft size={18} />
									{t("general.go_back")}
								</span>
							</div>
							{error && (
								<span className="text-red-500 translate-y-2">
									{error}
								</span>
							)}
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			<div className="translate-y-10 flex flex-col space-y-2 items-center">
				<span className="opacity-50">
					{t("general.dont_have_finura")}
				</span>
				<a href="/setup">{t("general.get_finura")}</a>
			</div>

			<Footer />
		</div>
	);
}

export default SignIn;
