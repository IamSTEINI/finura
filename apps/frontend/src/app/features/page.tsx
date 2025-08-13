"use client";
import React, { useEffect, useState } from "react";
import Header from "../components/ui/Header";
import {
	FileText,
	Calculator,
	BarChart3,
	Shield,
	Globe,
	Zap,
	Users,
	Database,
	CheckCircle,
	Cloud,
} from "lucide-react";

function Features() {
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

	const coreFeatures = [
		{
			icon: FileText,
			title: "Smart Invoicing",
			description:
				"Create professional invoices in seconds with automatic numbering, custom templates, and multi-currency support.",
			highlights: [
				"Auto-numbering",
				"Custom templates",
				"Multi-currency",
				"PDF export",
			],
		},
		{
			icon: Calculator,
			title: "Tax Compliance",
			description:
				"Automated tax calculations, compliance reports, and region-specific tax settings that keep you compliant.",
			highlights: [
				"Auto calculations",
				"Multiple tax rates",
				"Compliance reports",
				"Region settings",
			],
		},
		{
			icon: BarChart3,
			title: "Advanced Analytics",
			description:
				"Comprehensive dashboards, financial reports, and business insights to drive informed decisions.",
			highlights: [
				"Real-time dashboards",
				"Financial reports",
				"Export capabilities",
				"Custom metrics",
			],
		},
	];

	const technicalFeatures = [
		{
			icon: Zap,
			title: "Lightning Performance",
			description:
				"Redis-powered caching and WebSocket connections ensure instant responses and real-time updates.",
		},
		{
			icon: Shield,
			title: "Enterprise Security",
			description:
				"Bank-grade encryption, secure authentication, and role-based access control protect your data.",
		},
		{
			icon: Database,
			title: "Scalable Architecture",
			description:
				"Microservices design that grows with your business, from startup to enterprise scale.",
		},
		{
			icon: Globe,
			title: "Multi-Language Support",
			description:
				"Built-in internationalization with support for multiple languages and regional formats.",
		},
		{
			icon: Users,
			title: "Team Collaboration",
			description:
				"Role-based permissions, team workspaces, and collaborative features for growing teams.",
		},
		{
			icon: Cloud,
			title: "Self-Hosted Freedom",
			description:
				"Deploy on your own infrastructure with complete control over your data and customizations.",
		},
	];

	return (
		<div className="w-full min-h-screen flex flex-col space-y-2 justify-start items-center px-5 overflow-y-scroll">
			<Header />
			<h5
				className="w-full mt-[500px] font-bold transition-transform duration-300 flex justify-center items-center"
				style={{
					fontSize: `clamp(2rem, ${scale * 20}vw, 10rem)`,
					transform: `scale(${scale})`,
					opacity,
					transition: "transform 0.3s, opacity 0.3s, font-size 0.3s",
					willChange: "transform, opacity, font-size",
					textAlign: "center",
					lineHeight: 1,
				}}>
				FEATURES
			</h5>

			<div className="max-w-6xl mx-auto space-y-16 px-6 py-20">
				<div className="text-center space-y-6">
					<h2 className="text-5xl font-bold bg-gradient-to-r from-pink-400 to-purple-600 bg-clip-text text-transparent">
						Everything Your Business Needs
					</h2>
					<p className="text-xl opacity-75 leading-relaxed max-w-3xl mx-auto">
						Finura combines powerful business tools with elegant
						design, delivering a complete ERP solution that scales
						with your ambitions.
					</p>
				</div>

				<div className="space-y-12">
					<div className="text-center">
						<h3 className="text-3xl font-bold mb-4">
							Core Business Features
						</h3>
						<p className="text-lg opacity-75">
							The essential tools to run your business efficiently
						</p>
					</div>

					<div className="grid lg:grid-cols-2 gap-5">
						{coreFeatures.map((feature, index) => (
							<div
								key={index}
								className="card p-8 space-y-6 hover:scale-105 transition-transform duration-300">
								<div className="flex items-start space-x-4">
									<div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
										<feature.icon className="w-6 h-6 text-white" />
									</div>
									<div className="flex-1">
										<h4 className="text-2xl font-bold mb-3 bg-gradient-to-r from-pink-400 to-purple-600 bg-clip-text text-transparent">
											{feature.title}
										</h4>
										<p className="leading-relaxed mb-4">
											{feature.description}
										</p>
										<div className="grid grid-cols-2 gap-2">
											{feature.highlights.map(
												(highlight, idx) => (
													<div
														key={idx}
														className="flex items-center space-x-2 text-sm">
														<CheckCircle className="w-4 h-4 text-green-500" />
														<span className="opacity-75">
															{highlight}
														</span>
													</div>
												)
											)}
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="space-y-12">
					<div className="text-center">
						<h3 className="text-3xl font-bold mb-4">
							Technical Excellence
						</h3>
						<p className="text-lg opacity-75">
							Built on modern architecture for reliability and
							performance
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
						{technicalFeatures.map((feature, index) => (
							<div
								key={index}
								className="card p-6 text-center space-y-4 hover:scale-105 transition-transform duration-300">
								<div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
									<feature.icon className="w-8 h-8 text-white" />
								</div>
								<h4 className="text-xl font-semibold">
									{feature.title}
								</h4>
								<p className="text-sm leading-relaxed">
									{feature.description}
								</p>
							</div>
						))}
					</div>
				</div>

				<div className="bg-gradient-to-br from-purple-90 p-8 rounded-2xl border border-color">
					<div className="text-center space-y-6">
						<h3 className="text-3xl font-bold">
							Ready to Experience These Features?
						</h3>
						<p className="opacity-75 max-w-2xl mx-auto text-lg">
							See how Finura&apos;s powerful features can
							transform your business operations. Let us deploy
							your own instance and take control of your data
							today.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<button
								className="btn-glow px-8 py-3"
								onClick={() =>
									(window.location.href = "/get-started")
								}>
								Start Free Trial
							</button>
							<button
								className="btn-text-only px-8 py-3"
								onClick={() =>
									(window.location.href = "/what-is-finura")
								}>
								Learn More
							</button>
						</div>
					</div>
				</div>

				<div className="text-center py-12">
					<p
						className="text-sm"
						style={{ fontFamily: "Consolas, monospace" }}>
						{"<"}Built with love and code by Stein @{" "}
						<a
							href="https://dxby.dev/"
							className="text-purple-400 hover:text-purple-300">
							DXBY
						</a>
						{" />"}
					</p>
				</div>
			</div>
		</div>
	);
}

export default Features;
