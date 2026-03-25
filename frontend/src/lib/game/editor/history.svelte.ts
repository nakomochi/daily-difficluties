import type { StageData } from "../types";

export function cloneGrid(grid: StageData): StageData {
	return grid.map((row) => [...row]);
}

const MAX_HISTORY = 100;

export class History {
	private undoStack: StageData[] = [];
	private redoStack: StageData[] = [];

	undoCount: number = $state(0);
	redoCount: number = $state(0);

	pushSnapshot(grid: StageData): void {
		this.undoStack.push(cloneGrid(grid));
		if (this.undoStack.length > MAX_HISTORY) {
			this.undoStack.shift();
		}
		this.redoStack = [];
		this.undoCount = this.undoStack.length;
		this.redoCount = 0;
	}

	undo(current: StageData): StageData | null {
		const prev = this.undoStack.pop();
		if (!prev) return null;
		this.redoStack.push(cloneGrid(current));
		this.undoCount = this.undoStack.length;
		this.redoCount = this.redoStack.length;
		return prev;
	}

	redo(current: StageData): StageData | null {
		const next = this.redoStack.pop();
		if (!next) return null;
		this.undoStack.push(cloneGrid(current));
		this.undoCount = this.undoStack.length;
		this.redoCount = this.redoStack.length;
		return next;
	}

	get canUndo(): boolean {
		return this.undoCount > 0;
	}

	get canRedo(): boolean {
		return this.redoCount > 0;
	}
}
