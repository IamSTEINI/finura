import { useLocale } from "@/context/LocaleContext";
import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";
import { MenuIcon } from "lucide-react";

function Header() {
	const { t } = useLocale();
	const [isMenuOpen, setIsMenuOpen] = React.useState(false);

	const navLinks = [
		{ href: "/features", text: t("general.features") },
		{ href: "/solutions", text: t("general.solutions") },
		{ href: "/pricing", text: t("general.pricing") },
		{ href: "/what-is-finura", text: t("general.what_is_finura") },
	];
	return (
		<motion.div
			className="fixed top-0 h-[60px] overflow-hidden w-full flex flex-row justify-center items-center"
			initial={{ y: -60 }}
			animate={{ y: 0 }}
			transition={{ duration: 0.25, ease: "easeOut" }}>
			<div className="card z-[99999] h-[80%] w-[95%] max-w-[1200px] px-5 py-2 overflow-hidden flex flex-row justify-between items-center">
				<div className="w-fit min-w-[50px]">
					<Image
						src={"/finura/icon.ico"}
						width={35}
						height={35}
						alt="Logo"
					/>
				</div>
				<div className="w-full h-full flex flex-row items-center justify-end gap-x-10">
					{navLinks.map((link, index) => (
						<a
							key={index}
							className="text-nowrap hidden md:block"
							href={link.href}>
							{link.text}
						</a>
					))}
					<>
						<span
							className="block md:hidden cursor-pointer"
							onClick={() => setIsMenuOpen(!isMenuOpen)}>
							<MenuIcon />
						</span>
					</>
					<button className="btn-shiny hidden md:block">
						{t("general.get_started")}
					</button>
				</div>
			</div>
			{isMenuOpen && (
				<>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2, ease: "easeOut" }}
						className="fixed inset-0 bg-black/20 z-[9998] md:hidden block"
						onClick={() => setIsMenuOpen(false)}
					/>
					<div className="fixed inset-0 flex justify-center items-start pointer-events-none z-[9999]">
						<motion.div
							className="card mt-20 w-[95%] max-w-[1200px] h-fit pointer-events-auto block md:hidden"
							initial={{ y: -50, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							exit={{ y: -50, opacity: 0 }}
							transition={{ duration: 0.2, ease: "easeOut" }}>
							<div className="flex flex-col p-2 space-y-4">
								{navLinks.map((link, index) => (
									<a
										key={index}
										className="text-lg py-2"
										href={link.href}>
										{link.text}
									</a>
								))}
								<button className="btn-shiny mt-4">
									{t("general.get_started")}
								</button>
							</div>
						</motion.div>
					</div>
				</>
			)}
		</motion.div>
	);
}

export default Header;
