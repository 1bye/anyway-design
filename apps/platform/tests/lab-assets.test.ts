import { expect, it } from "bun:test";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { includeLabAssets } from "../tooling/include-lab-assets";

it("merges lab assets with Platform files and refuses to overwrite collisions", async () => {
	const root = await mkdtemp(join(tmpdir(), "platform-lab-assets-"));
	try {
		const source = join(root, "lab");
		const destination = join(root, "platform");
		await Promise.all([
			mkdir(join(source, "brand"), { recursive: true }),
			mkdir(join(destination, "brand"), { recursive: true }),
		]);
		await Promise.all([
			writeFile(join(source, "index.html"), "Lab entry"),
			writeFile(join(source, "brand/lab.png"), "Lab logo"),
			writeFile(join(destination, "index.html"), "Platform entry"),
			writeFile(join(destination, "brand/platform.svg"), "Platform logo"),
		]);
		await includeLabAssets(source, destination);
		expect(await readFile(join(destination, "index.html"), "utf8")).toBe(
			"Platform entry"
		);
		expect(
			await readFile(join(destination, "brand/platform.svg"), "utf8")
		).toBe("Platform logo");
		expect(await readFile(join(destination, "brand/lab.png"), "utf8")).toBe(
			"Lab logo"
		);
		await expect(
			includeLabAssets(source, destination)
		).resolves.toBeUndefined();
		await writeFile(join(source, "brand/lab.png"), "Conflicting logo");
		await expect(includeLabAssets(source, destination)).rejects.toThrow();
		expect(await readFile(join(destination, "brand/lab.png"), "utf8")).toBe(
			"Lab logo"
		);
	} finally {
		await rm(root, { force: true, recursive: true });
	}
});
