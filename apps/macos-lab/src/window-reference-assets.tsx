import type { WindowSidebarGroup } from "@anyway-design/macos/window-sidebar";
import { WindowSymbol } from "@anyway-design/macos/window-symbol";

export const WINDOW_REFERENCE_SOURCE =
	"https://support.apple.com/en-euro/guide/mac-help/mchlp2605/26/mac/26";
export const WINDOW_REFERENCE_ORIGINAL =
	"https://help.apple.com/assets/69DD569682238CF8EC0621E2/69DD569982238CF8EC0621E9/en_US/4c09ae5b39875fee3cde6fbc1fbf89d3.png";
export const WINDOW_REFERENCE_IMAGE =
	"/assets/apple-tahoe-finder-reference.png";
// A consistent 2:1 normalization for this published image, not a measured OS scale.
export const WINDOW_REFERENCE_SIZE = { height: 347, width: 572 } as const;
export const WINDOW_REFERENCE_CROPS = {
	files: { height: 278, width: 451, x: 121, y: 69 },
	sidebar: { height: 347, width: 128, x: 0, y: 0 },
	toolbar: { height: 72, width: 572, x: 0, y: 0 },
	window: { height: 347, width: 572, x: 0, y: 0 },
} as const;

export const WINDOW_REFERENCE_GROUPS: WindowSidebarGroup[] = [
	{
		id: "pinned",
		items: [
			{
				icon: <WindowSymbol name="recents" />,
				id: "recents",
				label: "Recents",
			},
			{
				icon: <WindowSymbol name="shared" />,
				id: "shared",
				label: "Shared",
			},
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
				icon: <span className="window-study-tag tag-urgent" />,
				id: "urgent",
				label: "Urgent",
			},
			{
				icon: <span className="window-study-tag tag-work" />,
				id: "work",
				label: "Work",
			},
			{
				icon: <span className="window-study-tag tag-vacation" />,
				id: "vacation",
				label: "Vacation",
			},
		],
		label: "Tags",
	},
];
