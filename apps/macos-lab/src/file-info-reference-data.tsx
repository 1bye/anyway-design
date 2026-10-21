import type {
	MacFileInfoItem,
	MacGetInfoSection,
} from "@anyway-design/macos/file-info";

export const INFO_DATE = "Monday, 12 October 2026 at 09:41";
const WHERE = "Macintosh HD ▸ private ▸ tmp ▸ Anyway-Info-Reference";
const PERMISSIONS = {
	entries: [
		{ id: "owner", name: "Owner (Me)", privilege: "Read & Write" },
		{ id: "group", name: "wheel", privilege: "Read only" },
		{ id: "everyone", name: "everyone", privilege: "Read only" },
	],
	summary: "You can read and write",
};

export const INFO_FILES: MacFileInfoItem[] = [
	{
		applicationId: "preview",
		applications: [
			{ id: "preview", label: "Preview.app (default)" },
			{ id: "other", label: "Another application" },
		],
		defaultApplicationId: "preview",
		general: [
			{ label: "Kind", value: "WebP Image" },
			{ label: "Size", value: "46\u00a0482 bytes (49 KB on disk)" },
			{ label: "Where", value: WHERE },
			{ label: "Created", value: INFO_DATE },
			{ label: "Modified", value: INFO_DATE },
		],
		icon: (
			<img
				alt=""
				className="mac-file-icon"
				draggable={false}
				height={64}
				src="/assets/native-file-info/clouds-icon.png"
				width={64}
			/>
		),
		id: "clouds",
		kind: "image",
		kindLabel: "WebP Image",
		modifiedLabel: INFO_DATE,
		moreInfo: [{ label: "Last opened", value: INFO_DATE }],
		name: "Clouds.webp",
		permissions: PERMISSIONS,
		preview: { src: "/assets/clouds.webp" },
		sizeLabel: "46 KB",
		thumbnail: "/assets/clouds.webp",
	},
	{
		general: [
			{ label: "Kind", value: "Folder" },
			{ label: "Size", value: "Zero bytes (Zero bytes on disk) for 1 item" },
			{ label: "Where", value: WHERE },
			{ label: "Created", value: INFO_DATE },
			{ label: "Modified", value: INFO_DATE },
		],
		id: "resources",
		kind: "folder",
		modifiedLabel: INFO_DATE,
		moreInfo: [{ label: "Last opened", value: INFO_DATE }],
		name: "Design resources",
		permissions: PERMISSIONS,
		sizeLabel: "Zero KB",
	},
	{
		id: "notes",
		kind: "text",
		modifiedLabel: INFO_DATE,
		name: "Notes.txt",
		permissions: PERMISSIONS,
		sizeLabel: "39 bytes",
	},
];

export const INFO_PRESETS: Record<
	"image" | "folder" | "preview",
	{
		expanded: readonly MacGetInfoSection[];
		height: number;
		id: string;
		label: string;
	}
> = {
	folder: {
		expanded: ["general", "more", "name"],
		height: 473,
		id: "resources",
		label: "Folder",
	},
	image: {
		expanded: ["general", "more", "name"],
		height: 493,
		id: "clouds",
		label: "Image",
	},
	preview: {
		expanded: ["general", "more", "name", "preview"],
		height: 685,
		id: "clouds",
		label: "With preview",
	},
};
