"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

type Translations = Record<string, unknown>;

interface LocaleContextType {
	locale: string;
	t: (key: string) => string;
	changeLocale: (lng: string) => void;
}

const LocaleContext = createContext<LocaleContextType>({
	locale: "en_EN",
	t: (key) => key,
	changeLocale: () => {},
});

export const LocaleProvider = ({ children }: { children: React.ReactNode }) => {
	const [locale, setLocale] = useState("en_EN");
	const [translations, setTranslations] = useState<Translations>({});

	useEffect(() => {
		const savedLocale = localStorage.getItem("locale") || "en_EN";
		loadLocale(savedLocale);
	}, []);

	const loadLocale = async (lng: string) => {
		const res = await fetch(`/locales/${lng}.json`);
		const data = await res.json();
		setTranslations(data);
		setLocale(lng);
		localStorage.setItem("locale", lng);
	};

	const t = (key: string): string => {
		const result = key
			.split(".")
			.reduce((obj, k) => obj?.[k], translations);
		return typeof result === "string" ? result : key;
	};

	return (
		<LocaleContext.Provider value={{ locale, t, changeLocale: loadLocale }}>
			{children}
		</LocaleContext.Provider>
	);
};
export const getAllLocales = () => {
	return [
		{ label: "Englisch", value: "en_EN" },
		{ label: "Deutsch", value: "de_DE" },
	];
};

export const useLocale = () => useContext(LocaleContext);
