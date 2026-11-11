import type { MacFileColumnItem } from "@1bye/macos/file-columns";
import { FOLDER_LIST_REFERENCE_ITEMS } from "./folder-list-reference-data";

const DETAILS = ["Created", "Modified", "Last opened"].map((label) => ({
	label,
	value: "12 October 2026 at 09:41",
}));
const DEMO_TEXT = "Anyway Design — demonstration file.\n".repeat(31);

function columnItems(items: readonly MacFileColumnItem[]): MacFileColumnItem[] {
	return items.map((file) => ({
		...file,
		children: file.children ? columnItems(file.children) : undefined,
		preview:
			file.kind === "image"
				? { details: DETAILS, src: "/assets/clouds.webp" }
				: { details: DETAILS, text: DEMO_TEXT },
		thumbnail: file.kind === "image" ? "/assets/clouds.webp" : undefined,
	}));
}

export const COLUMN_REFERENCE_ITEMS = columnItems(FOLDER_LIST_REFERENCE_ITEMS);
export const COLUMN_REFERENCE_STATES = {
	folders: {
		active: false,
		label: "Folder path",
		value: "Design resources/Brand",
		width: 735,
	},
	image: {
		active: true,
		label: "Image preview",
		value: "Photos/Clouds.webp",
		width: 730,
	},
} as const;
