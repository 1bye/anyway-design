import type { MacFileGalleryItem } from "@anyway-design/macos/file-gallery";
import type { MacFileListItem } from "@anyway-design/macos/file-list";
import type { MacMenuEntry } from "@anyway-design/macos/menu";
import { NATIVE_SYMBOLS } from "@anyway-design/macos/native-symbols";
import type { MacQuickLookItem } from "@anyway-design/macos/quick-look";
import {
	WindowSymbol,
	type WindowSymbolName,
} from "@anyway-design/macos/window-symbol";

const files: MacFileListItem[] = [
	{
		children: [],
		id: "projects",
		kind: "folder",
		name: "Projects",
		sizeLabel: "—",
	},
	{
		id: "brief",
		kind: "pdf",
		name: "Project brief.pdf",
		size: 240_000,
		sizeLabel: "240 KB",
		tags: [{ color: "#30b956", label: "Approved" }],
		thumbnail: "/assets/native-quick-look/document-preview.svg",
		thumbnailFit: "cover",
	},
	{
		id: "notes",
		kind: "text",
		name: "Meeting notes.txt",
		size: 1082,
		sizeLabel: "1 KB",
		thumbnail: "/assets/native-file-gallery/notes-thumbnail.png",
		thumbnailFit: "cover",
	},
	{
		id: "clouds",
		kind: "image",
		name: "Clouds.webp",
		size: 46_482,
		sizeLabel: "46 KB",
		thumbnail: "/assets/clouds.webp",
	},
	{
		id: "archive",
		kind: "archive",
		name: "Design assets.zip",
		size: 1_800_000,
		sizeLabel: "1.8 MB",
	},
	{
		id: "agreement",
		kind: "document",
		name: "Agreement for Services.pages",
		size: 84_000,
		sizeLabel: "84 KB",
		tags: [{ color: "#ff9f0a", label: "Work" }],
	},
];
export const PLAYGROUND_FILES = files.map((file) => ({
	...file,
	modifiedAt: 1_791_794_460_000,
	modifiedLabel: "12 Oct 2026 at 09:41",
}));
export const PLAYGROUND_GALLERY: MacFileGalleryItem[] = PLAYGROUND_FILES.map(
	(file) => ({
		...file,
		preview:
			file.kind === "image"
				? {
						details: [{ label: "Dimensions", value: "1920 × 1080" }],
						src: "/assets/clouds.webp",
					}
				: {
						details: [{ label: "Kind", value: file.kind ?? "document" }],
						text: "Anyway Design\n\nA sample document for the component playground.\n\nYour content belongs here.",
					},
	})
);
export const PLAYGROUND_QUICK_LOOK: MacQuickLookItem[] = [
	{
		id: "clouds",
		kind: "image",
		name: "Clouds.webp",
		preview: { src: "/assets/clouds.webp" },
		thumbnail: "/assets/clouds.webp",
	},
	{
		id: "brief",
		kind: "pdf",
		name: "Project brief.pdf",
		preview: { presentation: "document", src: "/assets/clouds.webp" },
	},
];
export const PLAYGROUND_MENU: MacMenuEntry[] = [
	{
		icon: <WindowSymbol name="document" />,
		id: "open",
		label: "Open",
		shortcut: "⌘O",
	},
	{
		id: "open-with",
		items: [
			{ id: "preview", label: "Preview" },
			{ id: "other", label: "Other…" },
		],
		label: "Open With",
	},
	{
		checked: true,
		id: "preview-pane",
		label: "Show Preview",
		separatorBefore: true,
	},
	{ disabled: true, id: "paste", label: "Paste", shortcut: "⌘V" },
	{
		icon: <WindowSymbol name="trash" />,
		id: "trash",
		label: "Move to Trash",
		separatorBefore: true,
	},
];
export const PLAYGROUND_SIDEBAR = [
	{
		id: "pinned",
		items: [
			{
				icon: <WindowSymbol name="recents" />,
				id: "recents",
				label: "Recents",
			},
			{ icon: <WindowSymbol name="shared" />, id: "shared", label: "Shared" },
		],
	},
	{
		id: "favorites",
		items: [
			{
				icon: <WindowSymbol name="applications" />,
				id: "applications",
				label: "Applications",
			},
			{
				icon: <WindowSymbol name="desktop" />,
				id: "desktop",
				label: "Desktop",
			},
			{
				icon: <WindowSymbol name="document" />,
				id: "documents",
				label: "Documents",
			},
			{
				icon: <WindowSymbol name="downloads" />,
				id: "downloads",
				label: "Downloads",
			},
		],
		label: "Favorites",
	},
	{ id: "locations", items: [], label: "Locations" },
	{
		id: "tags",
		items: [
			{
				icon: <span className="finder-tag-dot" />,
				id: "urgent",
				label: "Urgent",
			},
			{
				icon: <span className="finder-tag-dot finder-tag-work" />,
				id: "work",
				label: "Work",
			},
			{
				icon: (
					<span className="finder-tag-dot" style={{ background: "#f5c300" }} />
				),
				id: "vacation",
				label: "Vacation",
			},
		],
		label: "Tags",
	},
];
export const PLAYGROUND_SYMBOLS = Object.keys(
	NATIVE_SYMBOLS
) as WindowSymbolName[];
