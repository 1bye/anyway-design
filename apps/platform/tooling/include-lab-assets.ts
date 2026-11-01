import { constants } from "node:fs";
import { copyFile, mkdir, readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

async function copyAsset(from: string, to: string): Promise<void> {
	try {
		await copyFile(from, to, constants.COPYFILE_EXCL);
	} catch (error) {
		// Both builds emit the same hashed assets when Platform imports live demos.
		if (
			error &&
			typeof error === "object" &&
			"code" in error &&
			error.code === "EEXIST" &&
			(await readFile(from)).equals(await readFile(to))
		) {
			return;
		}
		throw error;
	}
}

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
				await copyAsset(from, to);
			}
		})
	);
}
