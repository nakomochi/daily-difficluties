export interface ClearRecord {
	time: number;
	deaths: number;
}

export interface DayRecord {
	first: ClearRecord | null;
	best: { time: number } | null;
}

export function formatTime(ms: number): string {
	return (ms / 1000).toFixed(1) + "s";
}

function key(date: string): string {
	return `dd-record-${date}`;
}

export function getRecord(date: string): DayRecord | null {
	try {
		const raw = localStorage.getItem(key(date));
		if (!raw) return null;
		return JSON.parse(raw) as DayRecord;
	} catch {
		return null;
	}
}

export function saveRecord(
	date: string,
	time: number,
	deaths: number,
): { isNewBest: boolean } {
	const existing = getRecord(date) ?? { first: null, best: null };

	if (!existing.first) {
		existing.first = { time, deaths };
	}

	const isNewBest = !existing.best || time < existing.best.time;
	if (isNewBest) {
		existing.best = { time };
	}

	localStorage.setItem(key(date), JSON.stringify(existing));
	return { isNewBest };
}
