import type { FinderFile } from "./finder-browser-model";
import { PLAYGROUND_FILES } from "./playground-data";

export function createFinderFiles(now: number): FinderFile[] {
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
			modifiedAt: now - index * day * 3,
			modifiedLabel: undefined,
			parentId: "documents",
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
			tags: [{ color: "#ff302b", label: "Urgent" }],
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
			tags: [{ color: "#f5c300", label: "Vacation" }],
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
			tags: [{ color: "#ff9300", label: "Work" }],
			thumbnail: "/assets/native-file-gallery/notes-thumbnail.png",
		},
	];
}
