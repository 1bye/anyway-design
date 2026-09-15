import { expect, test } from "bun:test";
import { editorPosition } from "../src/lib/editor-position";

const panel = { height: 240, width: 300 };
const canvas = { height: 900, width: 1600 };

test("editors stay beside the selection on wide screens and flip inward at the right edge", () => {
	expect(
		editorPosition({ height: 64, width: 64, x: 400, y: 200 }, panel, canvas)
	).toEqual({ x: 484, y: 200 });
	expect(
		editorPosition({ height: 64, width: 64, x: 1500, y: 200 }, panel, canvas)
	).toEqual({ x: 1180, y: 200 });
});
test("notes expand at their own position without leaving the visible canvas", () => {
	expect(
		editorPosition(
			{ height: 64, width: 64, x: 400, y: 200 },
			panel,
			canvas,
			true
		)
	).toEqual({ x: 384, y: 184 });
	expect(
		editorPosition(
			{ height: 64, width: 64, x: 1550, y: 850 },
			panel,
			canvas,
			true
		)
	).toEqual({ x: 1288, y: 648 });
});
test("narrow and short canvases keep the entire card in reach", () => {
	for (const width of [320, 390, 768]) {
		for (const height of [220, 600]) {
			for (const x of [-500, 0, width / 2, width + 500]) {
				for (const y of [-500, 0, height / 2, height + 500]) {
					for (const inPlace of [true, false]) {
						const result = editorPosition(
							{ height: 64, width: 64, x, y },
							panel,
							{ height, width },
							inPlace
						);
						expect(result.x).toBeGreaterThanOrEqual(12);
						expect(result.y).toBeGreaterThanOrEqual(12);
						expect(
							result.x + Math.min(panel.width, width - 24)
						).toBeLessThanOrEqual(width - 12);
						expect(
							result.y + Math.min(panel.height, height - 24)
						).toBeLessThanOrEqual(height - 12);
					}
				}
			}
		}
	}
});
