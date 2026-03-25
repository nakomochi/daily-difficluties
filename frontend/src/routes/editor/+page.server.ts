import { loadSchedule, loadStageList } from "$lib/server/api";

export async function load({ fetch }) {
	const [dbStages, schedule] = await Promise.all([loadStageList(fetch), loadSchedule(fetch)]);
	return { dbStages, schedule };
}
