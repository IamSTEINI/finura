"use client";
import React, { useEffect, useState } from "react";
import Header from "../components/ui/Header";
import Seperator from "../components/ui/Seperator";
import { Pin } from "lucide-react";

function GetStarted() {
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
		<div className="w-full min-h-screen flex flex-col space-y-2 justify-start items-center px-3 sm:px-5 overflow-y-scroll">
			<Header />
			<div className="sm:w-[70%] w-[90%] h-fit">
				<h5
					className="w-full mt-[500px] font-bold transition-transform duration-300 flex justify-center items-center"
					style={{
						fontSize: `clamp(2rem, ${scale * 20}vw, 10rem)`,
						transform: `scale(${scale})`,
						opacity,
						transition:
							"transform 0.3s, opacity 0.3s, font-size 0.3s",
						willChange: "transform, opacity, font-size",
						textAlign: "center",
						lineHeight: 1,
					}}>
					GETTING STARTED
				</h5>
				<Seperator />
				<div className="card mt-5">
					<div className="flex flex-row">
						<div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mt-2">
							<Pin className="w-4 h-4 text-white -rotate-45" />
						</div>
						<h1 className="w-full ml-5">NOTE</h1>
					</div>
					<p style={{ fontFamily: "Consolas, monospace" }}>
						Since Finura is firstly a Summer of Making project, the
						pricing and buying this software is not available right
						now.
					</p>
				</div>
			</div>
		</div>
	);
}

export default GetStarted;
