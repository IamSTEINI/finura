"use client";
import Image from "next/image";
import Header from "./components/ui/Header";

export default function App() {
	return (
		<div className="w-full h-screen flex flex-col space-y-2 justify-center items-center px-5 overflow-hidden">
			<Header />
			<Image
				src="/finura/FINURA_BANNER.png"
				alt="Logo"
				width={200}
				height={200}
				className="-translate-y-10"></Image>
			<h1 style={{ fontFamily: "Consolas, monospace" }}>
				{"<"}FINURA{"/>"}
			</h1>
			<div className="md:w-1/2 w-full space-y-5 overflow-hidden">
				<p
					className="border-color border p-2 rounded-md"
					style={{ fontFamily: "Consolas, monospace" }}>
					Welcome, Thank you for your interest in this project. Please
					note that what you see here is only a small part of
					Finura&apos;s full potential. Development is ongoing, and
					many features outlined in DEVLOG 1 are planned for future
					releases. If you would like to explore a demo, click here
					and log in using the admin credentials: username “admin” and
					password “admin”.
					<br />
					<strong>Note:</strong> The demo version does not fully
					represent the capabilities of a real installation. Due to
					hosting limitations, the provider (railway) can only host the
					databases, API, and frontend, but not the microservices.
					Some features may be unavailable or behave differently
					compared to a complete deployment.
				</p>
				<button
					className="btn-border-only w-full"
					onClick={() => (window.location.href = "/signin")}>
					Experience FINURA
				</button>
			</div>
		</div>
	);
}
