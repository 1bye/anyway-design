export const INK_LIFETIME_MS = 5200;
const MAX_BLOOMS = 48;
const MAX_VOLUME = 16;
export const INK_DEPOSIT_INTERVAL_MS = 50;

export interface InkBloom {
	born: number;
	seed: number;
	volume: number;
	x: number;
	y: number;
}

export function getInkRadius(bloom: InkBloom): number {
	return 7 * Math.sqrt(bloom.volume);
}

function mergeInk(target: InkBloom, source: InkBloom, now: number): void {
	const volume = target.volume + source.volume;
	target.x = (target.x * target.volume + source.x * source.volume) / volume;
	target.y = (target.y * target.volume + source.y * source.volume) / volume;
	target.volume = Math.min(volume, MAX_VOLUME);
	target.born = now;
}

export function addInkBloom(
	blooms: InkBloom[],
	x: number,
	y: number,
	now: number
): boolean {
	if (blooms.some((bloom) => now - bloom.born < INK_DEPOSIT_INTERVAL_MS)) {
		return false;
	}
	const drop: InkBloom = {
		born: now,
		seed: Math.random() * Math.PI * 2,
		volume: 1,
		x,
		y,
	};
	const pool = blooms.find(
		(bloom) => Math.hypot(x - bloom.x, y - bloom.y) < getInkRadius(bloom) + 10
	);
	if (pool) {
		mergeInk(pool, drop, now);
		for (let index = blooms.length - 1; index >= 0; index -= 1) {
			const neighbor = blooms[index];
			if (
				neighbor !== pool &&
				Math.hypot(pool.x - neighbor.x, pool.y - neighbor.y) <
					getInkRadius(pool) + getInkRadius(neighbor)
			) {
				mergeInk(pool, neighbor, now);
				blooms.splice(index, 1);
			}
		}
	} else {
		blooms.push(drop);
	}
	if (blooms.length > MAX_BLOOMS) {
		blooms.shift();
	}
	return true;
}

export function pruneInkBlooms(blooms: InkBloom[], now: number): void {
	for (let index = blooms.length - 1; index >= 0; index -= 1) {
		if (now - blooms[index].born >= INK_LIFETIME_MS) {
			blooms.splice(index, 1);
		}
	}
}
