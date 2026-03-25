export interface Toast {
	id: number;
	message: string;
	type: "success" | "error" | "info";
}

let nextId = 0;
export const toasts: Toast[] = $state([]);

export function toast(message: string, type: Toast["type"] = "info", duration = 2500) {
	const id = nextId++;
	toasts.push({ id, message, type });
	setTimeout(() => {
		const idx = toasts.findIndex((t) => t.id === id);
		if (idx >= 0) toasts.splice(idx, 1);
	}, duration);
}
