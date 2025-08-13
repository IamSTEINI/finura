"use client";

import { useEffect } from "react";

interface ErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
	useEffect(() => {
		console.error("Global Error:", error);
	}, [error]);
	return (
		<div className="flex flex-col w-full h-full items-center justify-center absolute">
			<h5 className="text-[150px] font-bold translate-y-10">OOPS</h5>
			<h1>Something is wrong right now.</h1>
			<div className="flex flex-row items-center">
				{"Click here >>>"}
				<button className="btn-text-only" onClick={reset}>
					Refresh
				</button>
				{"<<< Click here"}
			</div>
		</div>
	);
}
