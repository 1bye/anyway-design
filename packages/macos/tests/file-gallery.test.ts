import { expect, test } from "bun:test";
import {
	fileGalleryDetails,
	fileGallerySelection,
	fileGalleryTags,
	type MacFileGalleryItem,
} from "../src/file-gallery-model";

const items: MacFileGalleryItem[] = [
	{
		id: "image",
		name: "Clouds.webp",
		preview: {
			details: [
				{ label: "Created", value: "Monday" },
				{ label: "Modified", value: "Tuesday" },
			],
			moreDetails: [{ label: "Dimensions", value: "1920 × 1082" }],
		},
	},
	{
		id: "folder",
		kind: "folder",
		name: "Resources",
		preview: {
			details: [
				{ label: "Created", value: "Monday" },
				{ label: "Modified", value: "Wednesday" },
			],
		},
	},
	{ disabled: true, id: "offline", name: "Offline" },
];

test("Gallery resolves selection in visual order, excluding removed and disabled items", () => {
	expect(
		fileGallerySelection(items, [
			"folder",
			"image",
			"image",
			"missing",
			"offline",
		]).map((file) => file.id)
	).toEqual(["image", "folder"]);
	expect(fileGallerySelection([], ["image"])).toEqual([]);
	expect(fileGallerySelection(items, [])).toEqual([]);
	expect(
		fileGallerySelection(items.slice(1), ["image", "folder"]).map(
			(file) => file.id
		)
	).toEqual(["folder"]);
});

test("Gallery only shares identical metadata across a multiple selection", () => {
	expect(fileGalleryDetails(items.slice(0, 2))).toEqual([
		{ label: "Created", value: "Monday" },
	]);
	expect(fileGalleryDetails([items[0]])).toHaveLength(2);
	expect(fileGalleryDetails([])).toEqual([]);
	expect(
		fileGalleryDetails([items[0], { id: "no-metadata", name: "Notes.txt" }])
	).toEqual([]);
});

test("Gallery falls back to a supplied modified label without inventing metadata", () => {
	expect(
		fileGalleryDetails([
			{ id: "notes", modifiedLabel: "Yesterday", name: "Notes" },
		])
	).toEqual([{ label: "Modified", value: "Yesterday" }]);
	expect(fileGalleryDetails([{ id: "notes", name: "Notes" }])).toEqual([]);
});

test("multiple Gallery selections only show common tags", () => {
	const common = { color: "green", label: "Approved" };
	const files = [
		{
			id: "one",
			name: "One",
			tags: [common, { color: "blue", label: "Work" }],
		},
		{ id: "two", name: "Two", tags: [common] },
	];
	expect(fileGalleryTags(files)).toEqual([common]);
	expect(fileGalleryTags([files[0], { id: "none", name: "None" }])).toEqual([]);
	expect(fileGalleryTags([])).toEqual([]);
});
