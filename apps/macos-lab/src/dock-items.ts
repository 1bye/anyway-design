import type { DockItem } from "@1bye/macos/dock";

export const DOCK_ITEMS: DockItem[] = [
	{ icon: "/assets/finder.webp", id: "finder", label: "Finder", running: true },
	{ icon: "/assets/safari.webp", id: "safari", label: "Safari" },
	{ badge: "2", icon: "/assets/mail.webp", id: "mail", label: "Mail" },
	{
		icon: "/assets/tada-icon.webp",
		id: "taada",
		label: "Taada",
		running: true,
	},
	{
		icon: "/assets/downloads.webp",
		id: "downloads",
		label: "Downloads",
		separatorBefore: true,
	},
	{ icon: "/assets/trash.webp", id: "trash", label: "Trash" },
];
