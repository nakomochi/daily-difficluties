import { loadStageList } from "$lib/server/api";

export async function load() {
	return { dbStages: await loadStageList() };
}
