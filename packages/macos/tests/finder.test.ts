import { expect, test } from "bun:test";
import {
	arrangeFinderFiles,
	createFinderTab,
	finderCanNavigate,
	finderColumnItems,
	finderGroupLabel,
	finderLocation,
	finderLocationFiles,
	finderPath,
	finderShortcut,
	type MacFinderFile,
	navigateFinderTab,
	resolveFinderTab,
	selectFinderColumn,
	stepFinderHistory,
} from "../src/finder-model";

const collections = [
	{
		filter: (file: MacFinderFile) => file.shared === true,
		id: "shared",
		label: "Shared",
	},
	{
		filter: (file: MacFinderFile) =>
			file.tags?.some((tag) => tag.label === "Work") ?? false,
		id: "work",
		label: "Work",
	},
	{ filter: () => false, id: "urgent", label: "Urgent" },
];
const now = new Date(2026, 9, 21, 12).getTime();
const files: MacFinderFile[] = [
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
	expect(
		finderLocationFiles(files, "shared", "", collections).map((file) => file.id)
	).toEqual(["nested"]);
	expect(
		finderLocationFiles(files, "work", "", collections).map((file) => file.id)
	).toEqual(["brief"]);
	expect(finderLocationFiles(files, "urgent", "", collections)).toEqual([]);
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

test("arbitrary folder and collection IDs work without playground locations", () => {
	const custom: MacFinderFile[] = [
		{ id: "tenant:42", kind: "folder", name: "Acme" },
		{
			id: "specs:9",
			kind: "folder",
			name: "Specifications",
			parentId: "tenant:42",
		},
		{
			id: "leaf:7",
			kind: "text",
			name: "Overview.txt",
			parentId: "specs:9",
			preview: { text: "Supplied content" },
		},
		{
			disabled: true,
			id: "locked",
			kind: "folder",
			name: "Locked",
			parentId: "tenant:42",
		},
	];
	const views = [
		{
			filter: (file: MacFinderFile) => file.kind === "text",
			id: "saved:important",
			label: "Important",
		},
	];
	expect(finderCanNavigate(custom, views, "specs:9")).toBe(true);
	expect(finderCanNavigate(custom, views, "saved:important")).toBe(true);
	expect(finderCanNavigate(custom, views, "locked")).toBe(false);
	expect(finderCanNavigate(custom, views, "documents")).toBe(false);
	expect(
		finderLocationFiles(custom, "saved:important", "overview", views).map(
			(file) => file.id
		)
	).toEqual(["leaf:7"]);
	const tab = createFinderTab("custom", "specs:9");
	const tree = finderColumnItems(
		custom,
		finderLocationFiles(custom, "specs:9"),
		tab,
		now
	);
	expect(tree[0].preview?.text).toBe("Supplied content");
	const collectionTab = {
		...tab,
		history: ["saved:important"],
		view: "columns" as const,
	};
	expect(
		selectFinderColumn(collectionTab, custom[2], ["leaf:7"], views).history
	).toEqual(["saved:important"]);
});

test("dataset changes prune removed history and selection while respecting allowed views", () => {
	const tab = {
		...navigateFinderTab(
			navigateFinderTab(createFinderTab("one", "home"), "projects"),
			"downloads"
		),
		column: "brief",
		columnRoot: "projects",
		selected: ["brief", "nested"],
		view: "gallery" as const,
	};
	const remaining = files.filter(
		(file) => !["projects", "brief"].includes(file.id)
	);
	const next = resolveFinderTab(tab, remaining, [], "home", [
		"list",
		"columns",
	]);
	expect(next.history).toEqual(["home", "downloads"]);
	expect(next.selected).toEqual(["nested"]);
	expect(next.column).toBeUndefined();
	expect(next.columnRoot).toBeUndefined();
	expect(next.view).toBe("list");
	expect(finderLocation(stepFinderHistory(next, -1))).toBe("home");
	const removed = resolveFinderTab(
		{ ...tab, index: 1, query: "brief", searchOpen: true },
		remaining,
		[],
		"home",
		["icons"]
	);
	expect(finderLocation(removed)).toBe("home");
	expect(removed.query).toBe("");
	expect(removed.searchOpen).toBe(false);
	expect(removed.selected).toEqual([]);
	expect(
		resolveFinderTab(
			createFinderTab("gone", "missing"),
			remaining,
			[],
			"home",
			["icons"]
		).history
	).toEqual(["home"]);
	expect(tab.history).toEqual(["home", "projects", "downloads"]);
});
