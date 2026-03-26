import { toast } from "$lib/toast.svelte";
import { formatTime } from "./records";

const SITE_URL = "https://example.com";

function buildShareText(date: string, time: number, deaths: number): string {
	return [
		`Daily Difficulties - ${date}`,
		`🕐 Time: ${formatTime(time)}`,
		`💀 Deaths: ${deaths}`,
		SITE_URL,
	].join("\n");
}

export async function shareResult(date: string, time: number, deaths: number): Promise<void> {
	const text = buildShareText(date, time, deaths);
	try {
		if (navigator.share) {
			await navigator.share({ text });
			return;
		}
	} catch (e) {
		if (e instanceof DOMException && e.name === "AbortError") return;
	}
	try {
		await navigator.clipboard.writeText(text);
		toast("Copied to clipboard!", "success");
	} catch {
		toast("Failed to copy", "error");
	}
}
