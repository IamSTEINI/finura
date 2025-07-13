export async function fetchSession(token: string) {
	try {
		const response = await fetch("http://localhost:8001/api/session/get", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch session: ${response.statusText}`);
		}

		return await response.json();
	} catch (error) {
		console.error("Error fetching session:", error);
		throw error;
	}
}