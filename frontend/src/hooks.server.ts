import { env } from "$env/dynamic/private";
import { error, type Handle } from "@sveltejs/kit";

const DEV_ROUTES = ["/dev", "/editor"];

export const handle: Handle = async ({ event, resolve }) => {
	if (env.DISABLE_DEV_ROUTES === "true" && DEV_ROUTES.some((r) => event.url.pathname.startsWith(r))) {
		error(404, "Not Found");
	}
	return resolve(event);
};
