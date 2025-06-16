"use client";

import { useEffect } from "react";

interface GlobalErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
	useEffect(() => {
		console.error("Global Error:", error);
	}, [error]);
	return <div>
        <button onClick={reset}>Refresh</button>
    </div>;
}
