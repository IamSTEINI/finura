"use client";
import DropDown from "@/app/components/ui/DropDown";
import { getAllLocales, useLocale } from "@/context/LocaleContext";
import React from "react";

const TranslationPlayground: React.FC = () => {
	const { t, changeLocale, locale } = useLocale();
	return (
		<div className="p-6 max-w-md mx-auto">
			<h1 className="text-xl font-bold mb-4">Translation Playground</h1>
			<div className="mb-4">
				<p className="block text-sm font-medium ml-px mb-1">
					{t("language.select_language")}
				</p>
				<DropDown
					data={getAllLocales()}
					onChange={(value) => changeLocale(value)}
					searchable={true}
					placeholder="Select a language"
					className="w-full"
					defaultValue={getAllLocales()[0]?.value}
					selected={locale}
				/>
			</div>
			<div className="mt-6">
				<p>{t("language.message_welcome")}</p>
			</div>
		</div>
	);
};

export default TranslationPlayground;