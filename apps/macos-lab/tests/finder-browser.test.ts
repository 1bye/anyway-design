import { expect, test } from "bun:test";
import {
	arrangeFinderFiles,
	createFinderTab,
	type FinderFile,
	finderColumnItems,
	finderGroupLabel,
	finderLocation,
	finderLocationFiles,
	finderPath,
	finderShortcut,
	navigateFinderTab,
	selectFinderColumn,
	stepFinderHistory,
} from "../src/finder-browser-model";

const now = new Date(2026, 9, 21, 12).getTime();
const files: FinderFile[] = [
	{ id: "home", kind: "folder", name: "Home" },
	{ id: "documents", kind: "folder", name: "Documents", parentId: "home" },
	{ id: "downloads", kind: "folder", name: "Downloads", parentId: "home" },
	{ id: "projects", kind: "folder", name: "Projects", parentId: "documents" },
	{
		id: "brief",
		kind: "pdf",
		modifiedAt: now,
		name: "Brief.pdf",
		parentId: "documents",
		size: 200_000,
		tags: [{ color: "orange", label: "Work" }],
	},
	{
		id: "nested",
		kind: "text",
		name: "Brief 2.txt",
		parentId: "projects",
		shared: true,
		size: 50,
	},
	{
		id: "download",
		kind: "archive",
		name: "Brief.zip",
		parentId: "downloads",
		size: 2_000_000,
	},
];

test("history clamps at its ends, branches after Back, and stays independent between tabs", () => {
	const first = createFinderTab("first", "documents");
	const second = createFinderTab("second", "home");
	const opened = navigateFinderTab(
		navigateFinderTab(first, "projects"),
		"downloads"
	);
	const back = stepFinderHistory(opened, -1);
	expect(finderLocation(back)).toBe("projects");
	expect(finderLocation(stepFinderHistory(back, 1))).toBe("downloads");
	const branch = navigateFinderTab(back, "home");
	expect(branch.history).toEqual(["documents", "projects", "home"]);
	expect(stepFinderHistory(branch, 1)).toBe(branch);
	expect(stepFinderHistory(first, -1)).toBe(first);
	expect(second.history).toEqual(["home"]);
	expect(first.history).toEqual(["documents"]);
});

test("navigation clears transient search, selection and column state without resetting the chosen view", () => {
	const tab = {
		...createFinderTab("one", "documents"),
		column: "projects",
		query: "brief",
		searchOpen: true,
		selected: ["brief"],
		view: "list" as const,
	};
	const next = navigateFinderTab(tab, "projects");
	expect(next).toMatchObject({
		column: undefined,
		query: "",
		searchOpen: false,
		selected: [],
		view: "list",
	});
	expect(navigateFinderTab(tab, "documents").history).toEqual(["documents"]);
});

test("search stays within the current subtree, includes names and tags, and virtual locations do not expose unrelated files", () => {
	expect(
		finderLocationFiles(files, "documents").map((file) => file.id)
	).toEqual(["projects", "brief"]);
	expect(
		finderLocationFiles(files, "documents", " BRIEF ").map((file) => file.id)
	).toEqual(["brief", "nested"]);
	expect(
		finderLocationFiles(files, "documents", "work").map((file) => file.id)
	).toEqual(["brief"]);
	expect(finderLocationFiles(files, "shared").map((file) => file.id)).toEqual([
		"nested",
	]);
	expect(finderLocationFiles(files, "work").map((file) => file.id)).toEqual([
		"brief",
	]);
	expect(finderLocationFiles(files, "urgent")).toEqual([]);
	expect(finderLocationFiles(files, "documents", "missing")).toEqual([]);
});

test("the clickable path follows actual parents and tolerates missing or cyclic parent records", () => {
	expect(finderPath(files, "nested").map((file) => file.id)).toEqual([
		"home",
		"documents",
		"projects",
		"nested",
	]);
	expect(finderPath(files, "missing")).toEqual([]);
	expect(
		finderPath(
			[
				{ id: "a", name: "A", parentId: "b" },
				{ id: "b", name: "B", parentId: "a" },
			],
			"a"
		)
	).toHaveLength(2);
});

test("sort and grouping keep every identity exactly once and leave source files untouched", () => {
	const snapshot = JSON.stringify(files);
	const arranged = arrangeFinderFiles(
		files.filter((file) => file.parentId),
		{ column: "size", direction: "descending" },
		"kind",
		now
	);
	expect(arranged.slice(0, 3).map((file) => file.id)).toEqual([
		"download",
		"brief",
		"nested",
	]);
	expect(new Set(arranged.map((file) => file.id)).size).toBe(arranged.length);
	expect(JSON.stringify(files)).toBe(snapshot);
	expect(finderGroupLabel(files[4], "size", now)).toBe("100 KB to 1 MB");
	expect(finderGroupLabel(files[3], "size", now)).toBe("Folders");
	expect(finderGroupLabel(files[4], "date", now)).toBe("Today");
	expect(finderGroupLabel(files[5], "date", now)).toBe("Unknown Date");
	expect(finderGroupLabel(files[4], "tags", now)).toBe("Work");
	expect(finderGroupLabel(files[5], "tags", now)).toBe("No Tags");
});

test("column trees retain nested folders while search results stay flat and share the selected sort", () => {
	const tab = createFinderTab("one", "documents");
	const tree = finderColumnItems(
		files,
		finderLocationFiles(files, "documents"),
		tab,
		now
	);
	expect(tree.find((file) => file.id === "projects")?.children?.[0]?.id).toBe(
		"nested"
	);
	const search = { ...tab, query: "brief" };
	const results = finderColumnItems(
		files,
		finderLocationFiles(files, "documents", search.query),
		search,
		now
	);
	expect(results.map((file) => file.id)).toEqual(["nested", "brief"]);
	expect(results.every((file) => !file.children)).toBe(true);
});

test("Finder shortcuts leave ordinary typing and Shift/Alt combinations alone", () => {
	const event = {
		altKey: false,
		ctrlKey: false,
		key: "f",
		metaKey: false,
		shiftKey: false,
	};
	expect(finderShortcut(event)).toBeUndefined();
	expect(finderShortcut({ ...event, metaKey: true })).toBe("search");
	expect(finderShortcut({ ...event, ctrlKey: true, key: "]" })).toBe("forward");
	expect(finderShortcut({ ...event, altKey: true, key: "ArrowLeft" })).toBe(
		"back"
	);
	expect(
		finderShortcut({ ...event, key: "N", metaKey: true, shiftKey: true })
	).toBe("new-folder");
	expect(finderShortcut({ ...event, key: "4", metaKey: true })).toBe("gallery");
	expect(
		finderShortcut({ ...event, metaKey: true, shiftKey: true })
	).toBeUndefined();
});

test("column navigation records history while retaining ancestors and file selection does not add duplicate history", () => {
	const tab = {
		...createFinderTab("one", "documents"),
		view: "columns" as const,
	};
	const folder = selectFinderColumn(tab, files[3], ["projects"]);
	expect(folder.columnRoot).toBe("documents");
	expect(finderLocation(folder)).toBe("projects");
	const selected = selectFinderColumn(folder, files[5], ["nested"]);
	expect(selected.history).toEqual(["documents", "projects"]);
	expect(selected.columnRoot).toBe("documents");
	expect(stepFinderHistory(selected, -1).columnRoot).toBeUndefined();
	const searching = selectFinderColumn({ ...tab, query: "brief" }, files[5], [
		"nested",
	]);
	expect(searching.query).toBe("brief");
	expect(searching.history).toEqual(["documents"]);
});
