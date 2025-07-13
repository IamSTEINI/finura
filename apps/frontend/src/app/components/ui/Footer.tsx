import { useLocale } from "@/context/LocaleContext";
import React from "react";

function Footer() {
    const {t} = useLocale();
	return (
		<div className="absolute bottom-5 w-full flex flex-row items-center">
            <div className="w-full items-center flex flex-row justify-center gap-x-5">
                <a>{t("general.privacy_terms")}</a>
                <a>{t("general.contact_us")}</a>
                <a>{t("general.select_language")}</a>
            </div>
        </div>
	);
}

export default Footer;
