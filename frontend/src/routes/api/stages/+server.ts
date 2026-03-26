import { proxyToBackend } from "$lib/server/api";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async () => {
	return proxyToBackend("/api/stages");
};

export const POST: RequestHandler = async ({ request }) => {
	return proxyToBackend("/api/stages", {
		method: "POST",
		body: await request.text(),
	});
};
