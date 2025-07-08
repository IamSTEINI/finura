import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.scss";
import AppThemeProvider from "./provider/themes/AppThemeProvider";
import { LocaleProvider } from "@/context/LocaleContext";
import { NotificationProvider } from "@/context/NotificationContext";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

// Geist FONT is great so I'll leave it here

export const metadata: Metadata = {
	title: {
		template: "%s | FINURA",
		default: "FINURA",
	},
	description:
		"Finura is a modern ERP solution (Enterprise Resource Planning) designed to empower individuals and small businesses to take control of their operations.",
	keywords: [
		"ERP",
		"Enterprise Resource Planning",
		"Small Business",
		"Business Management",
		"Operations",
		"Productivity",
		"Resource Planning",
		"Business Software",
	],
	authors: [{ name: "Stein" }],
	creator: "Stein",
	openGraph: {
		type: "website",
		locale: "de_DE",
		title: "FINURA",
		description:
			"Finura is a modern ERP solution designed to empower individuals and small businesses.",
		siteName: "FINURA",
		images: [
			{
				url: "https://i.imgur.com/FA3FAst.png",
				width: 761,
				height: 231,
				alt: "FINURA - Modern ERP solution",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "FINURA",
		description:
			"Finura is a modern ERP solution designed to empower individuals and small businesses.",
		creator: "Stein",
		images: ["https://i.imgur.com/FA3FAst.png"],
	},
	robots: {
		index: true,
		follow: true,
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<AppThemeProvider>
					<LocaleProvider>
						<NotificationProvider>{children}</NotificationProvider>
					</LocaleProvider>
				</AppThemeProvider>
			</body>
		</html>
	);
}
