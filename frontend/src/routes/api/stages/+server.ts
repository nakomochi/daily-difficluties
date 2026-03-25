import { proxyToBackend } from "$lib/server/api";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ fetch }) => {
	return proxyToBackend("/api/stages", fetch);
};

export const POST: RequestHandler = async ({ request, fetch }) => {
	return proxyToBackend("/api/stages", fetch, {
		method: "POST",
		body: await request.text(),
	});
};
