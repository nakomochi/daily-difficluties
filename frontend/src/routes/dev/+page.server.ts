import { loadStageList } from "$lib/server/api";

export async function load({ fetch }) {
	return { dbStages: await loadStageList(fetch) };
}
