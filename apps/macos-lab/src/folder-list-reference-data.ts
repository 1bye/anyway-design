import type { MacFileListItem } from "@1bye/macos/file-list";

export const FOLDER_LIST_REFERENCE_ITEMS: MacFileListItem[] = [
	{
		children: [],
		id: "Archive",
		kind: "folder",
		kindLabel: "Folder",
		modifiedAt: 1_791_794_460_000,
		modifiedLabel: "12 Oct 2026 at 09:41",
		name: "Archive",
		sizeLabel: "--",
	},
	{
		children: [
			{
				children: [
					{
						id: "Design resources/Brand/Colors.txt",
						kind: "text",
						kindLabel: "text",
						modifiedAt: 1_791_794_460_000,
						modifiedLabel: "12 Oct 2026 at 09:41",
						name: "Colors.txt",
						size: 1082,
						sizeLabel: "1 KB",
					},
					{
						id: "Design resources/Brand/Type.txt",
						kind: "text",
						kindLabel: "text",
						modifiedAt: 1_791_794_460_000,
						modifiedLabel: "12 Oct 2026 at 09:41",
						name: "Type.txt",
						size: 1082,
						sizeLabel: "1 KB",
					},
				],
				id: "Design resources/Brand",
				kind: "folder",
				kindLabel: "Folder",
				modifiedAt: 1_791_794_460_000,
				modifiedLabel: "12 Oct 2026 at 09:41",
				name: "Brand",
				sizeLabel: "--",
			},
			{
				children: [
					{
						id: "Design resources/Icons/Notes.txt",
						kind: "text",
						kindLabel: "text",
						modifiedAt: 1_791_794_460_000,
						modifiedLabel: "12 Oct 2026 at 09:41",
						name: "Notes.txt",
						size: 1082,
						sizeLabel: "1 KB",
					},
				],
				id: "Design resources/Icons",
				kind: "folder",
				kindLabel: "Folder",
				modifiedAt: 1_791_794_460_000,
				modifiedLabel: "12 Oct 2026 at 09:41",
				name: "Icons",
				sizeLabel: "--",
			},
			{
				id: "Design resources/Read me.txt",
				kind: "text",
				kindLabel: "text",
				modifiedAt: 1_791_794_460_000,
				modifiedLabel: "12 Oct 2026 at 09:41",
				name: "Read me.txt",
				size: 1082,
				sizeLabel: "1 KB",
			},
		],
		id: "Design resources",
		kind: "folder",
		kindLabel: "Folder",
		modifiedAt: 1_791_794_460_000,
		modifiedLabel: "12 Oct 2026 at 09:41",
		name: "Design resources",
		sizeLabel: "--",
	},
	{
		children: [
			{
				id: "Photos/Clouds.webp",
				kind: "image",
				kindLabel: "WebP Image",
				modifiedAt: 1_791_794_460_000,
				modifiedLabel: "12 Oct 2026 at 09:41",
				name: "Clouds.webp",
				size: 46_482,
				sizeLabel: "46 KB",
			},
		],
		id: "Photos",
		kind: "folder",
		kindLabel: "Folder",
		modifiedAt: 1_791_794_460_000,
		modifiedLabel: "12 Oct 2026 at 09:41",
		name: "Photos",
		sizeLabel: "--",
	},
	{
		id: "Project brief.txt",
		kind: "text",
		kindLabel: "text",
		modifiedAt: 1_791_794_460_000,
		modifiedLabel: "12 Oct 2026 at 09:41",
		name: "Project brief.txt",
		size: 1082,
		sizeLabel: "1 KB",
	},
];

export const FOLDER_LIST_EXPANDED_IDS = [
	"Design resources",
	"Design resources/Brand",
];

export function renameFolderFile(
	items: readonly MacFileListItem[],
	id: string,
	name: string
): MacFileListItem[] {
	return items.map((file) => ({
		...file,
		children: file.children
			? renameFolderFile(file.children, id, name)
			: undefined,
		name: file.id === id ? name : file.name,
	}));
}
