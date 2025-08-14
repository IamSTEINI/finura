"use client";
import React, { useEffect, useState } from "react";
import Header from "../components/ui/Header";
import { Lock, PersonStanding, Zap } from "lucide-react";
import Image from "next/image";

function WhatsFinura() {
	const [scrollY, setScrollY] = useState(0);

	useEffect(() => {
		const handleScroll = () => {
			setScrollY(window.scrollY);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const scale = Math.max(1 - scrollY / 600, 0.6);
	const opacity = Math.max(1 - scrollY / 400, 0.5);

	return (
		<div className="w-full min-h-screen flex flex-col space-y-2 justify-start items-center px-5 overflow-y-scroll">
			<Header />
			<h5
				className="w-full mt-[500px] font-bold transition-transform duration-300 flex justify-center items-center"
				style={{
					fontSize: `clamp(2rem, ${scale * 20}vw, 20rem)`,
					transform: `scale(${scale})`,
					opacity,
					transition: "transform 0.3s, opacity 0.3s, font-size 0.3s",
					willChange: "transform, opacity, font-size",
					textAlign: "center",
					lineHeight: 1,
				}}>
				FINURA
			</h5>
			<div className="flex flex-row gap-x-4 items-center sm:flex-nowrap flex-wrap justify-center">
				<Image src={"/finura/FINURA_FAST.png"} alt="Finura fast logo" width={120} height={100}/>
				<Image src={"/finura/FINURA_EFFICIENT.png"} alt="Finura fast logo" width={200} height={100}/>
				<Image src={"/finura/FINURA_EASY.png"} alt="Finura fast logo" width={120} height={140} className="mt-1.5"/>
			</div>

			<div className="max-w-4xl mx-auto space-y-12 px-6 py-20">
				<div className="text-center space-y-6">
					<h2 className="text-5xl font-bold bg-gradient-to-r from-pink-400 to-purple-600 bg-clip-text text-transparent">
						Structure. Elegance. Efficiency.
					</h2>
					<p className="text-xl opacity-75 leading-relaxed">
						Designed to empower individuals and small businesses to
						take control of their operations.
					</p>
				</div>

				<div className="grid md:grid-cols-2 gap-12 items-center">
					<div className="space-y-6">
						<h3 className="text-3xl font-bold">
							Your Business, Your Rules
						</h3>
						<p className="text-lg opacity-75 leading-relaxed">
							Finura is a modern ERP you can deploy on your own
							server in minutes + no complex setup required (WE DO
							IT). You keep full control of your data, with zero
							tracking or analytics. From invoicing to reporting,
							Finura delivers all essential tools in one
							efficient, scalable platform.
						</p>
						<div className="card">
							<p className="font-medium">
								We do not track, analyze, or collect any user
								data and we never will. Your business stays your
								business.
							</p>
						</div>
					</div>

					<div className="space-y-4">
						<div className="card">
							<h4 className="font-bold p-4 pb-0 bg-gradient-to-r from-pink-400 to-purple-600 bg-clip-text text-transparent text-3xl">
								Everything You Need
							</h4>
							<ul className="mt-2 opacity-75 pt-0 p-4">
								<li>• Invoicing & Billing</li>
								<li>• Inventory Management</li>
								<li>• Tax Settings & Compliance</li>
								<li>• Comprehensive Reporting</li>
							</ul>
						</div>
					</div>
				</div>
				<div className="grid md:grid-cols-3 gap-8 mt-16">
					<div className="text-center space-y-4">
						<div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
							<Zap />
						</div>
						<h4 className="text-xl font-semibold">
							Lightning Fast
						</h4>
						<p className="">
							Redis + Websockets for real-time performance and
							instant feedback.
						</p>
					</div>
					<div className="text-center space-y-4">
						<div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-600 to-purple-400 rounded-full flex items-center justify-center">
							<Lock />
						</div>
						<h4 className="text-xl font-semibold">Privacy First</h4>
						<p className="">
							Self-hosted. No data collection. Your info never
							leaves your server.
						</p>
					</div>
					<div className="text-center space-y-4">
						<div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
							<PersonStanding />
						</div>
						<h4 className="text-xl font-semibold">
							Scales With You
						</h4>
						<p className="">
							Microservices architecture. Easy to add services.
						</p>
					</div>
				</div>

				<div className="bg-gradient-to-br from-purple-90 p-8 rounded-2xl border border-color">
					<div className="text-center space-y-4">
						<h3 className="text-2xl font-bold">
							Ready to Transform Your Business?
						</h3>
						<p className="opacity-75 max-w-2xl mx-auto">
							Join the revolution of businesses taking control of
							their data and operations. Deploy Finura today and
							experience the freedom of truly independent business
							management.
						</p>
						<button
							className="btn-glow px-8 py-3 mt-6 w-full"
							onClick={() => (window.location.href = "/get-started")}>
							Get started
						</button>
					</div>
				</div>

				<div className="text-center py-12">
					<p
						className="text-sm"
						style={{ fontFamily: "Consolas, monospace" }}>
						{"<"}Built with love and code by Stein @{" "}
						<a href="https://dxby.dev/">DXBY</a>
						{" />"}
					</p>
				</div>
			</div>
		</div>
	);
}

export default WhatsFinura;
