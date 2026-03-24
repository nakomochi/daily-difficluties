// Screen dimensions (iwanna standard: 25x19 tiles of 32px)
export const TILE_SIZE = 32;
export const GRID_COLS = 25;
export const GRID_ROWS = 19;
export const SCREEN_WIDTH = TILE_SIZE * GRID_COLS; // 800
export const SCREEN_HEIGHT = TILE_SIZE * GRID_ROWS; // 608

// Physics constants (iwanna standard, per frame at 50fps)
export const GRAVITY = 0.4;
export const JUMP_SPEED = -8.5;
export const DJUMP_SPEED = -7.0;
export const JUMP_RELEASE_DAMPEN = 0.45;
export const MOVE_SPEED = 3;
export const MAX_FALL_SPEED = 9;

// Timing
export const TARGET_FPS = 50;
export const FRAME_TIME = 1000 / TARGET_FPS; // 20ms

// Player hitbox (iwanna standard: 11x21, centered in 32x32 tile)
export const PLAYER_WIDTH = 11;
export const PLAYER_HEIGHT = 21;

export enum Tile {
	Empty = 0,
	Block = 1,
	SpikeUp = 2,
	SpikeDown = 3,
	SpikeLeft = 4,
	SpikeRight = 5,
	PlayerStart = 6,
	Save = 7,
	Goal = 8,
}

export interface PlayerState {
	x: number;
	y: number;
	vx: number;
	vy: number;
	jumpsLeft: number;
	onGround: boolean;
	dead: boolean;
	facingRight: boolean;
}

export interface SavePoint {
	x: number;
	y: number;
}

export interface GameState {
	player: PlayerState;
	savePoint: SavePoint;
	deaths: number;
	startTime: number;
	cleared: boolean;
	clearTime: number;
	activeSaves: Set<string>;
}

export type StageData = number[][];

export interface StageDef {
	id: string;
	name: string;
	data: StageData;
}
