import { expect, test } from "bun:test";
import {
	comboBoxPopupOffset,
	popUpButtonPopupOffset,
} from "../src/selection-popup-position";

test("combo list aligns the current row with the editable text in both control sizes", () => {
	const items = ["Documents", "Downloads", "Desktop"];
	for (const size of ["regular", "small"] as const) {
		const height = size === "small" ? 22 : 26;
		for (const [index, value] of items.entries()) {
			const popupTop = height + comboBoxPopupOffset(items, value, size);
			const selectedRowCenter = popupTop + 5 + index * 18 + 9;
			expect(selectedRowCenter).toBe(height / 2);
		}
	}
});

test("custom and empty combo values anchor the list at its first row", () => {
	expect(comboBoxPopupOffset(["Documents"], "My folder", "regular")).toBe(-27);
	expect(comboBoxPopupOffset([], "", "small")).toBe(-25);
});

test("pop-up positioning accounts for disabled rows and separators before the selected item", () => {
	const items = [
		{ value: "automatic" },
		{ disabled: true, separatorBefore: true, value: "high" },
		{ separatorBefore: true, value: "compact" },
	];
	expect(popUpButtonPopupOffset(items, "high", "regular")).toBe(-63);
	expect(popUpButtonPopupOffset(items, "compact", "regular")).toBe(-97.5);
	expect(popUpButtonPopupOffset(items, "automatic", "small")).toBe(-26.5);
	expect(popUpButtonPopupOffset(items, null, "regular")).toBe(-28.5);
	expect(popUpButtonPopupOffset([], "removed", "small")).toBe(-26.5);
});
