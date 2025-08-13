"use client";
import React, { useEffect, useState } from "react";
import Header from "../components/ui/Header";
import {
	Check,
	X,
	Star,
	Zap,
	Shield,
	Users,
	Building,
	Crown,
	Sparkles,
} from "lucide-react";
import Seperator from "../components/ui/Seperator";

function Pricing() {
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

	const plans = [
		{
			name: "Starter",
			icon: Zap,
			price: { lifetime: 490 },
			description:
				"Ideal for small businesses and startups beginning their ERP journey",
			features: [
				"Up to 5 users",
				"Basic invoicing & billing",
				"Standard reports",
				"Email support",
				"Self-hosted deployment",
				"Community updates",
			],
			limitations: [
				"Maximum 1,000 invoices per month",
				"Basic customization options",
			],
			recommended: false,
			cta: "Start Free Trial",
		},
		{
			name: "Professional",
			icon: Shield,
			price: { lifetime: 1290 },
			description:
				"Comprehensive features for growing businesses with advanced needs",
			features: [
				"Up to 25 users",
				"Advanced invoicing & automation",
				"Enhanced analytics & reports",
				"Priority email support",
				"Dedicated account manager",
				"24/7 support",
			],
			limitations: [
				"Maximum 10,000 invoices per month",
				"Lower support priority than Enterprise",
			],
			recommended: true,
			cta: "Start Free Trial",
		},
		{
			name: "Enterprise",
			icon: Crown,
			price: { lifetime: 2990 },
			description:
				"Complete solution for large organizations with enterprise-level requirements",
			features: [
				"Unlimited users",
				"Enterprise-grade security",
				"Advanced compliance tools",
				"Custom reporting engine",
				"Dedicated account manager",
				"Advanced user permissions",
				"Data backup & recovery",
			],
			limitations: [],
			recommended: false,
			cta: "Contact",
		},
	];

	const customFeatures = [
		{
			icon: Building,
			title: "Custom Development",
			description:
				"Tailored features and solutions designed specifically for your business requirements",
		},
		{
			icon: Users,
			title: "Dedicated Support",
			description:
				"Direct access to our development team with priority support and consultation",
		},
		{
			icon: Sparkles,
			title: "Industry Specialization",
			description:
				"Specialized modules and compliance features for your specific industry vertical",
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
				PRICING
			</h5>

			<div className="max-w-7xl mx-auto space-y-16 px-6 py-20">
				<div className="text-center space-y-6">
					<h2 className="text-5xl font-bold bg-gradient-to-r from-pink-400 to-purple-600 bg-clip-text text-transparent">
						Simple, Transparent Pricing
					</h2>
					<p className="text-xl opacity-75 leading-relaxed max-w-3xl mx-auto">
						Choose the plan that fits your business. All plans
						include self-hosted deployment, complete data ownership,
						and no hidden fees.
					</p>
				</div>

				<div className="grid lg:grid-cols-3 gap-8">
					{plans.map((plan, index) => (
						<div
							key={index}
							className={`card p-8 space-y-6 hover:scale-105 transition-transform duration-300 relative ${
								plan.recommended ? "ring-2 ring-purple-400" : ""
							}`}>
							{plan.recommended && (
								<div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
									<div className="bg-gradient-to-r from-purple-400 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-1">
										<Star className="w-4 h-4" />
										<span>We recommend</span>
									</div>
								</div>
							)}

							<div className="text-center space-y-4 mt-5">
								<div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
									<plan.icon className="w-8 h-8 text-white" />
								</div>
								<h3 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-600 bg-clip-text text-transparent">
									{plan.name}
								</h3>
								<p className="text-sm">
									{plan.description}
								</p>
								<div className="space-y-2">
									<div className="text-4xl font-bold">
										${plan.price.lifetime}
									</div>
									<div className="text-sm opacity-75">
										Lifetime license
									</div>
								</div>
							</div>

							<div className="space-y-4">
								<Seperator text="What's included" />
								<ul className="space-y-2">
									{plan.features.map((feature, idx) => (
										<li
											key={idx}
											className="flex items-center space-x-3">
											<Check className="w-5 h-5 text-green-500 flex-shrink-0" />
											<span className="text-sm">
												{feature}
											</span>
										</li>
									))}
								</ul>
								<Seperator text="Limitations" />
								{plan.limitations.length > 0 && (
									<div className="space-y-2">
										<ul className="space-y-1">
											{plan.limitations.map(
												(limitation, idx) => (
													<li
														key={idx}
														className="flex items-center space-x-3">
														<X className="w-4 h-4 text-red-400 flex-shrink-0" />
														<span className="text-xs opacity-75">
															{limitation}
														</span>
													</li>
												)
											)}
										</ul>
									</div>
								)}
							</div>

							<button
								className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
									plan.recommended
										? "btn-glow"
										: "btn-text-only"
								}`}
								onClick={() => {
									if (plan.cta === "Contact") {
										window.location.href = "mailto:stein@dxby.dev";
									} else {
										window.location.href = "/get-started";
									}
								}}>
								{plan.cta}
							</button>
						</div>
					))}
				</div>

				<div className="space-y-12">
					<div className="text-center">
						<h3 className="text-3xl font-bold mb-4">
							Need Something Custom?
						</h3>
						<p className="text-lg opacity-75 max-w-2xl mx-auto">
							Every business is unique. We offer custom
							development and specialized solutions tailored to
							your specific industry and requirements.
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-6">
						{customFeatures.map((feature, index) => (
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

				<div className="space-y-8">
					<div className="text-center">
						<h3 className="text-3xl font-bold mb-4">
							Frequently Asked Questions
						</h3>
					</div>

					<div className="grid md:grid-cols-2 gap-6">
						<div className="card p-6 space-y-3">
							<h4 className="font-semibold">
								How does the free trial work?
							</h4>
							<p className="text-sm opacity-75">
								You get full access to all features for 14 days.
								No payment details required. Try it on your own
								infrastructure or use our demo environment.
							</p>
						</div>
						<div className="card p-6 space-y-3">
							<h4 className="font-semibold">
								Can I change my plan later?
							</h4>
							<p className="text-sm opacity-75">
								Yes, you can upgrade or downgrade your plan at
								any time. Changes are applied immediately or at
								your next billing cycle.
							</p>
						</div>
						<div className="card p-6 space-y-3">
							<h4 className="font-semibold">
								Is my data really private?
							</h4>
							<p className="text-sm opacity-75">
								Absolutely. Self-hosted deployment means your
								data never leaves your servers. We have zero
								access to your business information.
							</p>
						</div>
						<div className="card p-6 space-y-3">
							<h4 className="font-semibold">
								Do you offer custom solutions?
							</h4>
							<p className="text-sm opacity-75">
								Yes, we provide custom development and
								integrations to fit your business needs. Contact
								us to discuss your requirements.
							</p>
						</div>
					</div>
				</div>

				<div className="bg-gradient-to-br from-purple-90 p-8 rounded-2xl border border-color">
					<div className="text-center space-y-6">
						<h3 className="text-3xl font-bold">
							Ready to Transform Your Business?
						</h3>
						<p className="opacity-75 max-w-2xl mx-auto text-lg">
							Join thousands of businesses that have taken control
							of their operations with Finura&apos;s powerful,
							privacy-first ERP solution.
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
									(window.location.href =
										"mailto:stein@dxby.dev")
								}>
								Contact us
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

export default Pricing;
