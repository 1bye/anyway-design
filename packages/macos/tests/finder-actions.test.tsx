import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import type { MacFinderFile } from "../src/finder";
import {
	finderActionContext,
	finderActionEnabled,
	finderConfiguredActions,
	finderContextSelection,
	finderFileShortcut,
	finderQuickLookItem,
	finderSelectedFiles,
} from "../src/finder-actions";
import { MacQuickLookPanel } from "../src/quick-look";

const closePreview = () => undefined;

const files: readonly MacFinderFile[] = [
	{ id: "root", kind: "folder", name: "Studio" },
	{
		id: "a",
		kind: "text",
		name: "A.txt",
		parentId: "root",
		preview: { text: "<script>consumer text</script>" },
	},
	{
		id: "b",
		kind: "image",
		name: "B.webp",
		parentId: "root",
		thumbnail: "/b.webp",
	},
	{ id: "locked", locked: true, name: "Locked.txt", parentId: "root" },
	{ disabled: true, id: "offline", name: "Offline", parentId: "root" },
];
const capabilities = {
	create: true,
	open: true,
	rename: true,
	selectAll: true,
};

test("context selection preserves a selected group, replaces other files, and clears on the background", () => {
	const selected = ["a", "b"];
	expect(finderContextSelection(selected, "a")).toEqual(["a", "b"]);
	expect(finderContextSelection(selected, "locked")).toEqual(["locked"]);
	expect(finderContextSelection(selected)).toEqual([]);
	expect(
		finderSelectedFiles(files, ["b", "missing", "offline", "a", "b"]).map(
			(file) => file.id
		)
	).toEqual(["b", "a"]);
	expect(selected).toEqual(["a", "b"]);
});

test("built-in file actions respect capabilities, locked items, selection cardinality, and virtual locations", () => {
	const context = finderActionContext(files, ["a"], "root", capabilities);
	expect(finderActionEnabled(context.defaultActions, "quick-look")).toBe(true);
	expect(finderActionEnabled(context.defaultActions, "info")).toBe(true);
	expect(finderActionEnabled(context.defaultActions, "rename")).toBe(true);
	const group = finderActionContext(files, ["a", "b"], "root", capabilities);
	expect(finderActionEnabled(group.defaultActions, "info")).toBe(false);
	expect(finderActionEnabled(group.defaultActions, "open")).toBe(true);
	expect(
		finderActionEnabled(
			finderActionContext(files, ["locked"], "root", capabilities)
				.defaultActions,
			"rename"
		)
	).toBe(false);
	const readOnly = finderActionContext(files, ["a"], "root", {
		...capabilities,
		create: false,
		rename: false,
	});
	expect(finderActionEnabled(readOnly.defaultActions, "rename")).toBe(false);
	expect(finderActionEnabled(readOnly.defaultActions, "new-folder")).toBe(
		false
	);
	const virtual = finderActionContext(files, [], "saved-search", capabilities);
	expect(finderActionEnabled(virtual.defaultActions, "new-folder")).toBe(false);
	expect(finderActionEnabled(virtual.defaultActions, "info")).toBe(false);
	expect(
		finderActionEnabled(
			finderActionContext(files, [], "root", capabilities).defaultActions,
			"info"
		)
	).toBe(true);
});

test("custom action factories receive the target folder and validated selection without bypassing capabilities", () => {
	const context = finderActionContext(files, ["a", "offline"], "root", {
		...capabilities,
		rename: false,
	});
	const items = finderConfiguredActions(
		context,
		({ defaultActions, selectedIds, locationId }) => {
			expect(selectedIds).toEqual(["a"]);
			expect(locationId).toBe("root");
			return [
				...defaultActions.filter((entry) => entry.id !== "rename"),
				{ disabled: false, id: "rename", label: "Custom Rename" },
				{ id: "review", label: "Mark Reviewed" },
			];
		}
	);
	expect(finderActionEnabled(items, "rename")).toBe(false);
	expect(finderActionEnabled(items, "review")).toBe(true);
	expect(finderActionEnabled(items, "unknown")).toBeUndefined();
});

test("nested disabled actions stay disabled and a configuration can hide or disable built-ins", () => {
	const context = finderActionContext(files, ["a"], "root", capabilities);
	const menu = finderConfiguredActions(context, [
		{ disabled: true, id: "quick-look", label: "Preview" },
		{
			disabled: true,
			id: "custom",
			items: [{ id: "archive", label: "Archive" }],
			label: "Custom",
		},
	]);
	expect(finderActionEnabled(menu, "quick-look")).toBe(false);
	expect(finderActionEnabled(menu, "archive")).toBe(false);
	expect(finderActionEnabled(menu, "info")).toBeUndefined();
	expect(finderConfiguredActions(context, [])).toEqual([]);
});

test("Quick Look uses supplied content and thumbnails without inventing document previews", () => {
	expect(finderQuickLookItem(files[1]).preview?.text).toBe(
		files[1].preview?.text
	);
	expect(finderQuickLookItem(files[2]).preview).toMatchObject({
		presentation: "image",
		src: "/b.webp",
	});
	expect(finderQuickLookItem(files[0]).preview).toBeUndefined();
	const explicit = finderQuickLookItem({
		...files[2],
		preview: { src: "/full.webp" },
	});
	expect(explicit.preview?.src).toBe("/full.webp");
	const text = finderQuickLookItem({ ...files[1], thumbnail: "/small.png" });
	expect(text.preview?.src).toBeUndefined();
	const html = renderToStaticMarkup(
		<MacQuickLookPanel item={text} onClose={closePreview} />
	);
	expect(html).toContain("mac-quick-look-text");
	expect(html).toContain("&lt;script&gt;consumer text&lt;/script&gt;");
	expect(html).not.toContain("<script>");
});

test("file shortcuts support native commands and leave modified Space and ordinary controls alone", () => {
	const event = {
		altKey: false,
		ctrlKey: false,
		key: " ",
		metaKey: false,
		shiftKey: false,
	};
	expect(finderFileShortcut(event, true)).toBe("quick-look");
	expect(finderFileShortcut(event, false)).toBeUndefined();
	expect(
		finderFileShortcut({ ...event, shiftKey: true }, true)
	).toBeUndefined();
	expect(finderFileShortcut({ ...event, key: "I", metaKey: true }, false)).toBe(
		"info"
	);
	expect(finderFileShortcut({ ...event, ctrlKey: true, key: "a" }, true)).toBe(
		"select-all"
	);
	expect(finderFileShortcut({ ...event, key: "o", metaKey: true }, true)).toBe(
		"open"
	);
	expect(finderFileShortcut({ ...event, key: "i" }, true)).toBeUndefined();
	expect(
		finderFileShortcut(
			{ ...event, altKey: true, key: "i", metaKey: true },
			true
		)
	).toBeUndefined();
});

test("clipboard, duplicate, Trash and history shortcuts preserve modifier rules", () => {
	const event = {
		altKey: false,
		ctrlKey: false,
		key: "c",
		metaKey: true,
		shiftKey: false,
	};
	for (const [key, action] of [
		["c", "copy"],
		["v", "paste"],
		["d", "duplicate"],
		["Backspace", "trash"],
		["Delete", "trash"],
		["z", "undo"],
	]) {
		expect(finderFileShortcut({ ...event, key }, false)).toBe(action);
	}
	expect(finderFileShortcut({ ...event, altKey: true, key: "v" }, false)).toBe(
		"move-here"
	);
	expect(
		finderFileShortcut(
			{ ...event, altKey: true, code: "KeyV", key: "√" },
			false
		)
	).toBe("move-here");
	expect(
		finderFileShortcut({ ...event, key: "Z", shiftKey: true }, false)
	).toBe("redo");
	expect(
		finderFileShortcut({ ...event, key: "v", shiftKey: true }, true)
	).toBeUndefined();
	expect(
		finderFileShortcut({ ...event, altKey: true, key: "z" }, true)
	).toBeUndefined();
	expect(finderFileShortcut({ ...event, key: "x" }, true)).toBeUndefined();
	expect(
		finderFileShortcut({ ...event, metaKey: false }, true)
	).toBeUndefined();
});

test("operation capabilities and configured disabled actions cannot be bypassed", () => {
	const context = finderActionContext(files, ["a"], "root", {
		...capabilities,
		operations: ({ selectedIds }) => {
			expect(selectedIds).toEqual(["a"]);
			return [
				{ disabled: true, id: "duplicate", label: "Duplicate" },
				{ id: "copy", label: "Copy" },
			];
		},
	});
	const menu = finderConfiguredActions(context, [
		{ disabled: false, id: "duplicate", label: "Duplicate" },
		{ disabled: true, id: "copy", label: "Copy" },
	]);
	expect(finderActionEnabled(menu, "duplicate")).toBe(false);
	expect(finderActionEnabled(menu, "copy")).toBe(false);
	const locked = finderActionContext(
		[{ ...files[0], locked: true }],
		[],
		"root",
		capabilities
	);
	expect(finderActionEnabled(locked.defaultActions, "new-folder")).toBe(false);
	expect(finderActionEnabled(locked.defaultActions, "info")).toBe(true);
});
