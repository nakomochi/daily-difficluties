import type { InputState } from "./input";
import type { Level } from "./level";
import {
	type GameState,
	GRAVITY,
	JUMP_SPEED,
	MAX_FALL_SPEED,
	MOVE_SPEED,
	PLAYER_HEIGHT,
	PLAYER_WIDTH,
	type PlayerState,
	TILE_SIZE,
} from "./types";

export function createPlayer(x: number, y: number): PlayerState {
	return {
		x,
		y,
		vx: 0,
		vy: 0,
		jumpsLeft: 2,
		onGround: false,
		dead: false,
		facingRight: true,
	};
}

export function updatePlayer(state: GameState, input: InputState, level: Level): void {
	const p = state.player;
	if (p.dead || state.cleared) return;

	// Horizontal movement (no inertia)
	p.vx = 0;
	if (input.left) p.vx = -MOVE_SPEED;
	if (input.right) p.vx = MOVE_SPEED;
	if (input.left && input.right) p.vx = 0;

	if (p.vx > 0) p.facingRight = true;
	if (p.vx < 0) p.facingRight = false;

	// Apply horizontal movement + collision
	p.x += p.vx;
	resolveHorizontalCollision(p, level);

	// Walked off a ledge: consume the ground jump
	const wasOnGround = p.onGround;

	// Jump (on justPressed only)
	if (input.jumpPressed && p.jumpsLeft > 0) {
		p.vy = JUMP_SPEED;
		p.jumpsLeft--;
		p.onGround = false;
	}

	// Gravity
	p.vy += GRAVITY;
	if (p.vy > MAX_FALL_SPEED) p.vy = MAX_FALL_SPEED;

	// Apply vertical movement + collision
	p.y += p.vy;
	resolveVerticalCollision(p, level);

	// Walked off ledge without jumping: only 1 airborne jump remains
	if (wasOnGround && !p.onGround && p.jumpsLeft === 2) {
		p.jumpsLeft = 1;
	}

	// Spike check
	if (checkSpikeCollision(p, level)) {
		killPlayer(state);
		return;
	}

	// Save point activation
	if (input.shootPressed) {
		checkSaveActivation(state, level);
	}

	// Goal check
	checkGoal(state, level);
}

function getPlayerBounds(p: PlayerState) {
	const halfW = PLAYER_WIDTH / 2;
	return {
		left: p.x - halfW,
		right: p.x + halfW,
		top: p.y - PLAYER_HEIGHT,
		bottom: p.y,
	};
}

function resolveHorizontalCollision(p: PlayerState, level: Level): void {
	const bounds = getPlayerBounds(p);
	const startCol = Math.floor(bounds.left / TILE_SIZE);
	const endCol = Math.floor((bounds.right - 0.001) / TILE_SIZE);
	const startRow = Math.floor(bounds.top / TILE_SIZE);
	const endRow = Math.floor((bounds.bottom - 0.001) / TILE_SIZE);

	for (let row = startRow; row <= endRow; row++) {
		for (let col = startCol; col <= endCol; col++) {
			if (!level.isSolid(col, row)) continue;

			const tileLeft = col * TILE_SIZE;
			const tileRight = tileLeft + TILE_SIZE;

			if (p.vx > 0) {
				p.x = tileLeft - PLAYER_WIDTH / 2;
			} else if (p.vx < 0) {
				p.x = tileRight + PLAYER_WIDTH / 2;
			}
			p.vx = 0;
			return;
		}
	}
}

function resolveVerticalCollision(p: PlayerState, level: Level): void {
	const bounds = getPlayerBounds(p);
	const startCol = Math.floor(bounds.left / TILE_SIZE);
	const endCol = Math.floor((bounds.right - 0.001) / TILE_SIZE);
	const startRow = Math.floor(bounds.top / TILE_SIZE);
	const endRow = Math.floor((bounds.bottom - 0.001) / TILE_SIZE);

	p.onGround = false;

	for (let row = startRow; row <= endRow; row++) {
		for (let col = startCol; col <= endCol; col++) {
			if (!level.isSolid(col, row)) continue;

			const tileTop = row * TILE_SIZE;
			const tileBottom = tileTop + TILE_SIZE;

			if (p.vy > 0) {
				// Landing
				p.y = tileTop;
				p.vy = 0;
				p.onGround = true;
				p.jumpsLeft = 2;
			} else if (p.vy < 0) {
				// Hit ceiling
				p.y = tileBottom + PLAYER_HEIGHT;
				p.vy = 0;
			}
			return;
		}
	}
}

// Spike hitboxes: triangular regions within a tile
function pointInSpikeHitbox(
	px: number,
	py: number,
	col: number,
	row: number,
	spikeType: number,
): boolean {
	const tx = col * TILE_SIZE;
	const ty = row * TILE_SIZE;
	const lx = px - tx;
	const ly = py - ty;

	switch (spikeType) {
		case 2: // SpikeUp: triangle pointing up from bottom
			return (
				ly >= 0 &&
				ly <= TILE_SIZE &&
				lx >= 0 &&
				lx <= TILE_SIZE &&
				ly >= TILE_SIZE - (TILE_SIZE * Math.min(lx, TILE_SIZE - lx) * 2) / TILE_SIZE
			);
		case 3: // SpikeDown: triangle pointing down from top
			return (
				ly >= 0 &&
				ly <= TILE_SIZE &&
				lx >= 0 &&
				lx <= TILE_SIZE &&
				ly <= (TILE_SIZE * Math.min(lx, TILE_SIZE - lx) * 2) / TILE_SIZE
			);
		case 4: // SpikeLeft: triangle pointing left from right
			return (
				ly >= 0 &&
				ly <= TILE_SIZE &&
				lx >= 0 &&
				lx <= TILE_SIZE &&
				lx >= TILE_SIZE - (TILE_SIZE * Math.min(ly, TILE_SIZE - ly) * 2) / TILE_SIZE
			);
		case 5: // SpikeRight: triangle pointing right from left
			return (
				ly >= 0 &&
				ly <= TILE_SIZE &&
				lx >= 0 &&
				lx <= TILE_SIZE &&
				lx <= (TILE_SIZE * Math.min(ly, TILE_SIZE - ly) * 2) / TILE_SIZE
			);
		default:
			return false;
	}
}

function checkSpikeCollision(p: PlayerState, level: Level): boolean {
	const bounds = getPlayerBounds(p);
	const startCol = Math.floor(bounds.left / TILE_SIZE);
	const endCol = Math.floor((bounds.right - 0.001) / TILE_SIZE);
	const startRow = Math.floor(bounds.top / TILE_SIZE);
	const endRow = Math.floor((bounds.bottom - 0.001) / TILE_SIZE);

	for (let row = startRow; row <= endRow; row++) {
		for (let col = startCol; col <= endCol; col++) {
			const tile = level.getTile(col, row);
			if (tile < 2 || tile > 5) continue;

			// Check corners of player hitbox against spike triangle
			const corners = [
				[bounds.left, bounds.top],
				[bounds.right, bounds.top],
				[bounds.left, bounds.bottom],
				[bounds.right, bounds.bottom],
				[(bounds.left + bounds.right) / 2, bounds.top],
				[(bounds.left + bounds.right) / 2, bounds.bottom],
				[bounds.left, (bounds.top + bounds.bottom) / 2],
				[bounds.right, (bounds.top + bounds.bottom) / 2],
			];

			for (const [cx, cy] of corners) {
				if (pointInSpikeHitbox(cx, cy, col, row, tile)) {
					return true;
				}
			}
		}
	}
	return false;
}

function killPlayer(state: GameState): void {
	state.player.dead = true;
	state.deaths++;
}

export function respawnPlayer(state: GameState): void {
	const save = state.savePoint;
	state.player = createPlayer(save.x, save.y);
}

function checkSaveActivation(state: GameState, level: Level): void {
	const bounds = getPlayerBounds(state.player);
	const startCol = Math.floor(bounds.left / TILE_SIZE);
	const endCol = Math.floor((bounds.right - 0.001) / TILE_SIZE);
	const startRow = Math.floor(bounds.top / TILE_SIZE);
	const endRow = Math.floor((bounds.bottom - 0.001) / TILE_SIZE);

	for (let row = startRow; row <= endRow; row++) {
		for (let col = startCol; col <= endCol; col++) {
			if (level.isSave(col, row)) {
				const key = `${col},${row}`;
				state.activeSaves.add(key);
				state.savePoint = {
					x: col * TILE_SIZE + TILE_SIZE / 2,
					y: (row + 1) * TILE_SIZE,
				};
			}
		}
	}
}

function checkGoal(state: GameState, level: Level): void {
	const bounds = getPlayerBounds(state.player);
	const startCol = Math.floor(bounds.left / TILE_SIZE);
	const endCol = Math.floor((bounds.right - 0.001) / TILE_SIZE);
	const startRow = Math.floor(bounds.top / TILE_SIZE);
	const endRow = Math.floor((bounds.bottom - 0.001) / TILE_SIZE);

	for (let row = startRow; row <= endRow; row++) {
		for (let col = startCol; col <= endCol; col++) {
			if (level.isGoal(col, row)) {
				state.cleared = true;
				state.clearTime = Date.now() - state.startTime;
			}
		}
	}
}
