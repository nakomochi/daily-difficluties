import { apiUrl } from "$lib/server/api";

export async function load({ fetch }) {
	const date = new Date().toISOString().slice(0, 10);
	try {
		const res = await fetch(`${apiUrl()}/api/stages/today`);
		if (!res.ok) return { stage: null, date };
		const stage: { id: number; name: string; data: number[][] } = await res.json();
		return { stage, date };
	} catch {
		return { stage: null, date };
	}
}
