import { proxyToBackend } from "$lib/server/api";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params }) => {
	return proxyToBackend(`/api/stages/${params.id}`);
};

export const PUT: RequestHandler = async ({ params, request }) => {
	return proxyToBackend(`/api/stages/${params.id}`, {
		method: "PUT",
		body: await request.text(),
	});
};

export const DELETE: RequestHandler = async ({ params }) => {
	return proxyToBackend(`/api/stages/${params.id}`, { method: "DELETE" });
};
