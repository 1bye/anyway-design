export const TEXT_SMEAR_LIFETIME_MS = 900;
const MAX_SMEARS = 8;
const SAMPLE_INTERVAL_MS = 24;
const MAX_PULL = 14;

export interface TextSmear {
	born: number;
	dx: number;
	dy: number;
	x: number;
	y: number;
}

export function addTextSmear(
	smears: TextSmear[],
	x: number,
	y: number,
	dx: number,
	dy: number,
	now: number
): void {
	const distance = Math.hypot(dx, dy);
	const last = smears.at(-1);
	if (distance < 0.5 || (last && now - last.born < SAMPLE_INTERVAL_MS)) {
		return;
	}
	const pull = Math.min(1, MAX_PULL / distance);
	smears.push({ born: now, dx: dx * pull, dy: dy * pull, x, y });
	if (smears.length > MAX_SMEARS) {
		smears.shift();
	}
}

export function pruneTextSmears(smears: TextSmear[], now: number): void {
	for (let index = smears.length - 1; index >= 0; index -= 1) {
		if (now - smears[index].born >= TEXT_SMEAR_LIFETIME_MS) {
			smears.splice(index, 1);
		}
	}
}
