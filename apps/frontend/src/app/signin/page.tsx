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
	const [email, setEmail] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	const handleContinue = () => {
		setStep("password");
	};

	return (
		<div className="w-full h-screen flex flex-col space-y-2 justify-center items-center px-5 overflow-hidden">
			<Header/>
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
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder={t(
										"general.sign_in_page_placeholder"
									)}></input>
							</div>
							<button
								className="btn-forward w-full h-[40px]"
								onClick={handleContinue}>
								{t("general.continue")}
							</button>
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
								{t("general.sign_in_page_title_continued").replace(
									"%workspace",
									"your workspace"
								)}
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
                                    placeholder={t("general.sign_in_password_placeholder")}>
                                    <div 
                                        className="cursor-pointer opacity-50 hover:opacity-100 transition-all"
                                        onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? (
                                            <Eye size={18}/>
                                        ): (
                                            <EyeClosed size={18}/>
                                        )}
                                    </div>
                                </ChildrenInput>
							</div>
							<button className="btn-forward w-full h-[40px]">
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

           <Footer/>
		</div>
	);
}

export default SignIn;
