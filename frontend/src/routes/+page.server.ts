import { apiUrl } from "$lib/server/api";

export async function load({ fetch }) {
	try {
		const res = await fetch(`${apiUrl()}/api/stages/today`);
		if (!res.ok) return { stage: null };
		const stage: { id: number; name: string; data: number[][] } = await res.json();
		return { stage };
	} catch {
		return { stage: null };
	}
}
