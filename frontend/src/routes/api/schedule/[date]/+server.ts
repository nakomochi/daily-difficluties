import { proxyToBackend } from "$lib/server/api";
import type { RequestHandler } from "./$types";

export const PUT: RequestHandler = async ({ params, request, fetch }) => {
	return proxyToBackend(`/api/schedule/${params.date}`, fetch, {
		method: "PUT",
		body: await request.text(),
	});
};

export const DELETE: RequestHandler = async ({ params, fetch }) => {
	return proxyToBackend(`/api/schedule/${params.date}`, fetch, { method: "DELETE" });
};
