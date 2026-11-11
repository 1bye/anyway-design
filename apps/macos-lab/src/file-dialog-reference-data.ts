import type {
	MacFileDialogDirectory,
	MacFileDialogType,
} from "@1bye/macos/file-dialog";
import type { MacFileListItem } from "@1bye/macos/file-list";
import { FOLDER_LIST_REFERENCE_ITEMS } from "./folder-list-reference-data";

function panelFile(item: MacFileListItem): MacFileListItem {
	return { ...item, children: undefined, modifiedLabel: "Today at 22:29" };
}
const folders = FOLDER_LIST_REFERENCE_ITEMS.filter((item) =>
	["Design resources", "Photos", "Project brief.txt"].includes(item.id)
);

export const PANEL_DIRECTORIES: MacFileDialogDirectory[] = [
	{
		id: "root",
		items: [
			...folders.map(panelFile),
			{
				id: "Meeting notes.txt",
				kind: "text",
				kindLabel: "text",
				modifiedLabel: "Today at 22:29",
				name: "Meeting notes.txt",
				size: 525,
			},
		],
		name: "Anyway-Panel-Files",
	},
	...folders
		.filter((item) => item.kind === "folder")
		.map((folder) => ({
			id: folder.id,
			items: (folder.children ?? [])
				.filter((item) => item.kind !== "folder")
				.map(panelFile),
			name: folder.name,
			parentId: "root",
		})),
];
export const PANEL_TYPES: MacFileDialogType[] = [
	{ extensions: ["txt"], id: "text", label: "Plain Text" },
	{ extensions: ["webp", "png", "jpg"], id: "image", label: "Images" },
	{ extensions: [], id: "all", label: "All Files" },
];
