import { expect, test } from "bun:test";
import {
	matchesLiquidShortcut,
	positionShortcutHint,
} from "../src/components/liquid/liquid-shortcut";

test("shortcut matching handles platform modifiers and Option-transformed characters", () => {
	const mac = {
		altKey: true,
		code: "KeyN",
		ctrlKey: false,
		key: "˜",
		metaKey: true,
		shiftKey: false,
	};
	expect(matchesLiquidShortcut("mod+alt+n", mac, true)).toBe(true);
	expect(matchesLiquidShortcut("mod+alt+n", mac, false)).toBe(false);
	expect(
		matchesLiquidShortcut(
			"mod+alt+n",
			{ ...mac, ctrlKey: true, metaKey: false },
			false
		)
	).toBe(true);
	expect(
		matchesLiquidShortcut("mod+alt+n", { ...mac, shiftKey: true }, true)
	).toBe(false);
	expect(matchesLiquidShortcut("mod+n", { ...mac, altKey: false }, true)).toBe(
		false
	);
});

test("shortcut hints flip at every viewport edge and retain their spacing", () => {
	const size = { height: 24, width: 60 };
	const viewport = { height: 480, width: 320 };
	const target = {
		height: 40,
		left: 100,
		offset: 8,
		side: "top" as const,
		top: 100,
		width: 80,
	};
	expect(positionShortcutHint(target, size, viewport)).toEqual({
		left: 110,
		top: 68,
	});
	expect(positionShortcutHint({ ...target, top: 4 }, size, viewport).top).toBe(
		52
	);
	expect(
		positionShortcutHint(
			{ ...target, side: "bottom", top: 430 },
			size,
			viewport
		).top
	).toBe(398);
	expect(
		positionShortcutHint({ ...target, left: 4, side: "left" }, size, viewport)
			.left
	).toBe(92);
	expect(
		positionShortcutHint(
			{ ...target, left: 230, side: "right" },
			size,
			viewport
		).left
	).toBe(162);
});
