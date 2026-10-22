import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { MacDesktop } from "../src/desktop";
import {
	desktopBounds,
	desktopWindowOrder,
	fitDesktopFrame,
	type MacDesktopFrame,
	type MacDesktopResizeEdge,
	resizeDesktopFrame,
} from "../src/desktop-model";
import { MacWindow } from "../src/window";

const bounds = { height: 512, width: 976, x: 12, y: 40 };
const initial = { height: 300, width: 400, x: 100, y: 100 };

test("desktop frames fit their workspace and preserve caller data", () => {
	const source = Object.freeze({ height: 900, width: 1400, x: -200, y: 1000 });
	expect(fitDesktopFrame(source, bounds)).toEqual({
		height: 512,
		width: 976,
		x: 12,
		y: 40,
	});
	expect(source.x).toBe(-200);
	expect(
		fitDesktopFrame(
			initial,
			desktopBounds(
				{ height: 80, width: 100 },
				{ bottom: 200, left: 200, right: 200, top: 200 }
			)
		)
	).toEqual({ height: 1, width: 1, x: 99, y: 79 });
	expect(
		desktopBounds(
			{ height: 640, width: 1000 },
			{ bottom: 88, left: 12, right: 12, top: 40 }
		)
	).toEqual(bounds);
});
test("small containers win over minimum sizes while malformed values stay finite", () => {
	expect(
		fitDesktopFrame(initial, { height: 100, width: 180, x: 0, y: 0 })
	).toEqual({ height: 100, width: 180, x: 0, y: 0 });
	const frame = fitDesktopFrame(
		{
			height: -1,
			width: Number.POSITIVE_INFINITY,
			x: Number.NaN,
			y: Number.NEGATIVE_INFINITY,
		},
		bounds,
		{
			maxSize: { height: 100, width: 200 },
			minSize: { height: 180, width: 300 },
		}
	);
	expect(frame).toEqual({ height: 100, width: 200, x: 12, y: 40 });
	expect(fitDesktopFrame(initial, { height: 0, width: 0, x: 0, y: 0 })).toEqual(
		initial
	);
});
test("resizing any edge keeps opposite edges anchored", () => {
	const cases: [MacDesktopResizeEdge, MacDesktopFrame][] = [
		["e", { ...initial, width: 440 }],
		["s", { ...initial, height: 330 }],
		["w", { ...initial, width: 360, x: 140 }],
		["n", { ...initial, height: 270, y: 130 }],
		["se", { ...initial, height: 330, width: 440 }],
		["sw", { height: 330, width: 360, x: 140, y: 100 }],
		["ne", { height: 270, width: 440, x: 100, y: 130 }],
		["nw", { height: 270, width: 360, x: 140, y: 130 }],
	];
	for (const [edge, expected] of cases) {
		expect(resizeDesktopFrame(initial, edge, 40, 30, bounds)).toEqual(expected);
	}
});
test("resize clamps at limits without moving the anchored edges", () => {
	expect(resizeDesktopFrame(initial, "nw", 1000, 1000, bounds)).toEqual({
		height: 160,
		width: 260,
		x: 240,
		y: 240,
	});
	expect(resizeDesktopFrame(initial, "nw", -1000, -1000, bounds)).toEqual({
		height: 360,
		width: 488,
		x: 12,
		y: 40,
	});
	expect(
		resizeDesktopFrame(initial, "se", 1000, 1000, bounds, {
			maxSize: { height: 320, width: 450 },
		})
	).toEqual({ ...initial, height: 320, width: 450 });
	expect(
		resizeDesktopFrame(
			initial,
			"se",
			Number.NaN,
			Number.POSITIVE_INFINITY,
			bounds
		)
	).toEqual(initial);
});
test("stacking removes closed IDs, adds new windows, and raises only the active window", () => {
	const previous = Object.freeze(["a", "closed", "b", "a"]);
	expect(desktopWindowOrder(["a", "b", "new"], previous, "a")).toEqual([
		"b",
		"new",
		"a",
	]);
	expect(desktopWindowOrder(["a", "b"], previous, null)).toEqual(["a", "b"]);
	expect(desktopWindowOrder(["a", "b"], previous, "missing")).toEqual([
		"a",
		"b",
	]);
	expect(previous).toEqual(["a", "closed", "b", "a"]);
});

test("public desktop preserves caller content and uses stable DOM order with explicit active state", () => {
	const windows = ["a", "b"].map((id) => ({
		defaultFrame: initial,
		id,
		render: ({ active }: { active: boolean }) => (
			<MacWindow active={active} title={`Window ${id}`}>
				<input aria-label={`Input ${id}`} defaultValue={`Content ${id}`} />
			</MacWindow>
		),
		title: `Window ${id}`,
	}));
	const html = renderToStaticMarkup(
		<MacDesktop activeWindowId="a" windows={windows} />
	);
	expect(html).toContain("Content a");
	expect(html).toContain('role="dialog"');
	expect(html).toContain('data-mac-drag-region="true"');
	expect(html).toContain('data-active="true" data-window-id="a"');
	expect(html).toContain('data-active="false" data-window-id="b"');
	expect(html.indexOf('data-window-id="a"')).toBeLessThan(
		html.indexOf('data-window-id="b"')
	);
	expect(html).not.toContain("macos-lab");
	const empty = renderToStaticMarkup(<MacDesktop windows={[]} />);
	expect(empty).toContain('aria-label="Desktop"');
});
