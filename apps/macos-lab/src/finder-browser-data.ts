import type { MacFinderFile } from "@1bye/macos/finder";
import { PLAYGROUND_FILES } from "./playground-data";

export function createFinderFiles(now: number): MacFinderFile[] {
	const day = 86_400_000;
	return [
		{ id: "home", kind: "folder", name: "Home" },
		...["Documents", "Desktop", "Downloads", "Applications"].map((name) => ({
			id: name.toLowerCase(),
			kind: "folder" as const,
			name,
			parentId: "home",
		})),
		...PLAYGROUND_FILES.map((file, index) => ({
			...file,
			comments:
				file.id === "brief" ? "Project overview and next steps." : undefined,
			modifiedAt: now - index * day * 3,
			modifiedLabel: undefined,
			parentId: "documents",
			preview:
				file.id === "notes"
					? {
							text: "Meeting notes\n\nReview the Tahoe components.\nConnect the file actions.\nShare the next prototype.",
						}
					: undefined,
			shared: file.id === "agreement",
		})),
		{
			id: "project-assets",
			kind: "folder",
			modifiedAt: now - day,
			name: "Design resources",
			parentId: "projects",
		},
		{
			id: "project-plan",
			kind: "pdf",
			modifiedAt: now,
			name: "Launch plan.pdf",
			parentId: "projects",
			size: 380_000,
			sizeLabel: "380 KB",
			tags: [{ color: "#ff0000", label: "Urgent" }],
			thumbnail: "/assets/native-quick-look/document-preview.svg",
		},
		{
			id: "project-image",
			kind: "image",
			modifiedAt: now - 8 * day,
			name: "Mountain study.webp",
			parentId: "project-assets",
			size: 46_482,
			thumbnail: "/assets/clouds.webp",
		},
		{
			id: "download-image",
			kind: "image",
			modifiedAt: now - day,
			name: "Tahoe wallpaper.webp",
			parentId: "downloads",
			size: 46_482,
			tags: [{ color: "#ffc000", label: "Vacation" }],
			thumbnail: "/assets/clouds.webp",
		},
		{
			id: "download-archive",
			kind: "archive",
			modifiedAt: now - 10 * day,
			name: "Assets.zip",
			parentId: "downloads",
			size: 3_400_000,
		},
		{
			id: "desktop-notes",
			kind: "text",
			modifiedAt: now - 2 * day,
			name: "Ideas.txt",
			parentId: "desktop",
			size: 1280,
			tags: [{ color: "#ff8000", label: "Work" }],
			thumbnail: "/assets/native-file-gallery/notes-thumbnail.png",
		},
	];
}
