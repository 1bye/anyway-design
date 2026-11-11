import type { MacFinderFile } from "@1bye/macos/finder";

/** Demo imports stay in memory; callers choose how to decode and persist their own files. */
export function finderImports(
	incoming: readonly File[],
	parentId: string,
	existing: readonly MacFinderFile[],
	objectUrls: string[]
): MacFinderFile[] {
	const names = new Set(
		existing
			.filter((file) => file.parentId === parentId)
			.map((file) => file.name.normalize("NFC").toLocaleLowerCase())
	);
	return incoming.map((file) => {
		let { name } = file;
		let suffix = 2;
		while (names.has(name.normalize("NFC").toLocaleLowerCase())) {
			name = `${file.name} (${suffix})`;
			suffix += 1;
		}
		names.add(name.normalize("NFC").toLocaleLowerCase());
		let kind: MacFinderFile["kind"] = "document";
		let thumbnail: string | undefined;
		if (file.type.startsWith("image/")) {
			kind = "image";
			thumbnail = URL.createObjectURL(file);
			objectUrls.push(thumbnail);
		} else if (file.type === "application/pdf") {
			kind = "pdf";
		} else if (file.type.startsWith("text/")) {
			kind = "text";
		}
		return {
			id: crypto.randomUUID(),
			kind,
			modifiedAt: file.lastModified,
			name,
			parentId,
			size: file.size,
			thumbnail,
		};
	});
}
