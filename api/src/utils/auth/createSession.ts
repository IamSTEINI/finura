export async function createSession(username: string, user_id: string) {
	try {
		const response = await fetch("http://localhost:8001/noauth/login", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username,
				user_id,
			}),
		});

		if (!response.ok) {
			throw new Error(`Failed to create session: ${response.statusText}`);
		}

		return await response.json();
	} catch (error) {
		console.error("Error creating session:", error);
		throw error;
	}
}
