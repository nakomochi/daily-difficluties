import { loadSchedule, loadStageList } from "$lib/server/api";

export async function load() {
	const [dbStages, schedule] = await Promise.all([loadStageList(), loadSchedule()]);
	return { dbStages, schedule };
}
