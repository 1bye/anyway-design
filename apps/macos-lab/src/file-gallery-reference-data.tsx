import type {
	MacFileGalleryAction,
	MacFileGalleryItem,
} from "@1bye/macos/file-gallery";
import { WindowSymbol } from "@1bye/macos/window-symbol";

const DETAILS = ["Created", "Modified"].map((label) => ({
	label,
	value: "12 October 2026 at 09:41",
}));
export const GALLERY_TEXT =
	"Anyway Design\n\nGallery view demonstration.\n\nA supplied preview keeps the file browser independent of the filesystem.\n";

export const GALLERY_ITEMS: MacFileGalleryItem[] = [
	{
		id: "clouds",
		kind: "image",
		kindLabel: "WebP Image",
		name: "Clouds.webp",
		preview: {
			details: DETAILS,
			moreDetails: [
				{ label: "Content created", value: "12 Oct 2026 at 09:41" },
			],
			src: "/assets/clouds.webp",
		},
		sizeLabel: "46 KB",
		thumbnail: "/assets/clouds.webp",
	},
	{
		id: "resources",
		kind: "folder",
		name: "Design resources",
		preview: { details: DETAILS },
		sizeLabel: "Zero bytes",
	},
	{
		id: "notes",
		kind: "text",
		kindLabel: "text",
		name: "Notes.txt",
		preview: { details: DETAILS, text: GALLERY_TEXT },
		sizeLabel: "117 bytes",
		thumbnail: "/assets/native-file-gallery/notes-thumbnail.png",
		thumbnailStyle: "image",
	},
];

export const GALLERY_ACTIONS: MacFileGalleryAction[] = [
	{ icon: <WindowSymbol name="document" />, id: "pdf", label: "Create PDF" },
	{
		icon: <WindowSymbol name="photos" />,
		id: "convert",
		label: "Convert Image",
	},
	{ icon: <WindowSymbol name="more-circle" />, id: "more", label: "More…" },
];

export const GALLERY_PRESETS = {
	folder: { ids: ["resources"], label: "Folder" },
	image: { ids: ["clouds"], label: "Image" },
	information: { ids: ["clouds"], label: "More information" },
	text: { ids: ["notes"], label: "Text" },
} as const;

export const GALLERY_CROPS = {
	all: { height: 658, label: "Whole Gallery", width: 1050, x: 0, y: 0 },
	filmstrip: { height: 66, label: "Filmstrip", width: 400, x: 0, y: 592 },
	info: { height: 350, label: "Information", width: 240, x: 810, y: 0 },
	preview: { height: 596, label: "Preview", width: 810, x: 0, y: 0 },
} as const;
