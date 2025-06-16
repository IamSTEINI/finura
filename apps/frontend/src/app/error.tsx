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
	return <div>
        <button onClick={reset}>Refresh</button>
    </div>;
}
