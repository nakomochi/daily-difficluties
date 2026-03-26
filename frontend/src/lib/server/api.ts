import { env } from "$env/dynamic/private";

export function apiUrl(): string {
	return env.API_URL ?? "http://localhost:8080";
}

export function apiKey(): string {
	return env.ADMIN_API_KEY ?? "dev-secret-key";
}

export async function proxyToBackend(
	path: string,
	init?: RequestInit,
): Promise<Response> {
	const headers: Record<string, string> = {
		"X-API-Key": apiKey(),
	};
	if (init?.body) {
		headers["Content-Type"] = "application/json";
	}
	const url = `${apiUrl()}${path}`;
	try {
		const res = await globalThis.fetch(url, { ...init, headers });
		return new Response(res.body, {
			status: res.status,
			headers: { "Content-Type": "application/json" },
		});
	} catch (e) {
		console.error(`proxyToBackend failed: ${init?.method ?? "GET"} ${url}`, e);
		return new Response(JSON.stringify({ error: "Backend unreachable" }), {
			status: 502,
			headers: { "Content-Type": "application/json" },
		});
	}
}

export async function loadStageList(): Promise<{ id: number; name: string }[]> {
	try {
		const res = await globalThis.fetch(`${apiUrl()}/api/stages`);
		if (!res.ok) return [];
		return await res.json();
	} catch {
		return [];
	}
}

export interface ScheduleEntry {
	date: string;
	stage_id: number;
	name: string;
}

export async function loadSchedule(): Promise<ScheduleEntry[]> {
	try {
		const res = await globalThis.fetch(`${apiUrl()}/api/schedule`);
		if (!res.ok) return [];
		return await res.json();
	} catch {
		return [];
	}
}
