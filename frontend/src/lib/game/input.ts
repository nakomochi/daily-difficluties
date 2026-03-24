export interface InputState {
	left: boolean;
	right: boolean;
	jump: boolean;
	jumpPressed: boolean;
	shoot: boolean;
	shootPressed: boolean;
	restart: boolean;
	fullscreen: boolean;
}

const KEY_MAP: Record<string, keyof InputState> = {
	ArrowLeft: "left",
	ArrowRight: "right",
	ArrowUp: "jump",
	KeyA: "left",
	KeyD: "right",
	KeyW: "jump",
	KeyZ: "jump",
	Space: "jump",
	ShiftLeft: "shoot",
	ShiftRight: "shoot",
	KeyR: "restart",
	F11: "fullscreen",
};

const JUMP_CODES = ["KeyZ", "Space", "KeyW", "ArrowUp"];

export class Input {
	private keys = new Set<string>();
	private justPressed = new Set<string>();
	private virtualKeys = new Map<keyof InputState, boolean>();
	private onKeyDown: (e: KeyboardEvent) => void;
	private onKeyUp: (e: KeyboardEvent) => void;
	private onBlur: () => void;

	constructor() {
		this.onKeyDown = (e: KeyboardEvent) => {
			if (KEY_MAP[e.code] !== undefined) {
				e.preventDefault();
			}
			if (!this.keys.has(e.code)) {
				this.justPressed.add(e.code);
			}
			this.keys.add(e.code);
		};

		this.onKeyUp = (e: KeyboardEvent) => {
			this.keys.delete(e.code);
		};

		this.onBlur = () => {
			this.keys.clear();
			this.justPressed.clear();
		};

		window.addEventListener("keydown", this.onKeyDown);
		window.addEventListener("keyup", this.onKeyUp);
		window.addEventListener("blur", this.onBlur);
	}

	getState(): InputState {
		const state: InputState = {
			left: false,
			right: false,
			jump: false,
			jumpPressed: false,
			shoot: false,
			shootPressed: false,
			restart: false,
			fullscreen: false,
		};

		for (const [code, action] of Object.entries(KEY_MAP)) {
			if (this.keys.has(code) || this.virtualKeys.get(action)) {
				state[action] = true;
			}
		}

		state.jumpPressed =
			JUMP_CODES.some((c) => this.justPressed.has(c)) ||
			(this.virtualKeys.get("jumpPressed") ?? false);
		state.shootPressed =
			this.justPressed.has("ShiftLeft") ||
			this.justPressed.has("ShiftRight") ||
			(this.virtualKeys.get("shootPressed") ?? false);

		return state;
	}

	consumeFrame(): void {
		this.justPressed.clear();
		this.virtualKeys.delete("jumpPressed");
		this.virtualKeys.delete("shootPressed");
	}

	setVirtualKey(key: keyof InputState, pressed: boolean): void {
		this.virtualKeys.set(key, pressed);
	}

	destroy(): void {
		window.removeEventListener("keydown", this.onKeyDown);
		window.removeEventListener("keyup", this.onKeyUp);
		window.removeEventListener("blur", this.onBlur);
	}
}
