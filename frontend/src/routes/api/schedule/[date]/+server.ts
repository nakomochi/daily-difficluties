import { proxyToBackend } from "$lib/server/api";
import type { RequestHandler } from "./$types";

export const PUT: RequestHandler = async ({ params, request }) => {
	return proxyToBackend(`/api/schedule/${params.date}`, {
		method: "PUT",
		body: await request.text(),
	});
};

export const DELETE: RequestHandler = async ({ params }) => {
	return proxyToBackend(`/api/schedule/${params.date}`, { method: "DELETE" });
};
