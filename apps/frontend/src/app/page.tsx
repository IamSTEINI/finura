"use client";
import Image from "next/image";
import Header from "./components/ui/Header";

export default function App() {
	return (
		<div className="w-full h-screen flex flex-col space-y-2 justify-start items-center px-5 overflow-y-scroll">
			<Header />
			<Image
				src="/finura/FINURA_BANNER.png"
				alt="Logo"
				width={200}
				height={200}
				className="mt-42"></Image>
			<h1 style={{ fontFamily: "Consolas, monospace" }}>
				{"<"}FINURA{"/>"}
			</h1>
			<div className="md:w-1/2 w-full space-y-5 overflow-hidden">
				<p
					className="border-color border p-2 rounded-md"
					style={{ fontFamily: "Consolas, monospace" }}>
					Welcome! Thanks for checking out Finura. This is just a
					preview—many features from DEVLOG 1 are coming soon. To try
					the demo, click below and log in with username “admin” and
					password “admin”.
					<br />
					<strong>Note:</strong> The demo is as titled JUST A DEMO.
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
