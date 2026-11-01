import { constants } from "node:fs";
import { copyFile, mkdir, readdir } from "node:fs/promises";
import { resolve } from "node:path";

export async function includeLabAssets(
	source: string,
	destination: string
): Promise<void> {
	await mkdir(destination, { recursive: true });
	await Promise.all(
		(await readdir(source, { withFileTypes: true })).map(async (entry) => {
			if (entry.name === "index.html") {
				return;
			}
			const from = resolve(source, entry.name);
			const to = resolve(destination, entry.name);
			if (entry.isDirectory()) {
				await includeLabAssets(from, to);
			} else {
				await copyFile(from, to, constants.COPYFILE_EXCL);
			}
		})
	);
}
