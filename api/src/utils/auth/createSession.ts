export async function createSession(user_id: string, username: string, roles: string[]) {
	try {
		const response = await fetch("http://localhost:8001/noauth/login", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				user_id,
				username,
				roles
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
