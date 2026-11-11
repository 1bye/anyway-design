import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cp, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = fileURLToPath(new URL("../", import.meta.url));
const directory = await mkdtemp(join(tmpdir(), "anyway-macos-release-"));
const cache = join(directory, ".npm-cache");
const developmentPath = /^(src|scripts|tests|fixtures)\//;
execFileSync("bun", ["run", "build"], { cwd: packageRoot, stdio: "inherit" });
const [pack] = JSON.parse(
	execFileSync(
		"npm",
		[
			"pack",
			"--ignore-scripts",
			"--json",
			"--cache",
			cache,
			"--pack-destination",
			directory,
		],
		{ cwd: packageRoot, encoding: "utf8" }
	)
);
const paths = pack.files.map((file) => file.path);
for (const required of [
	"dist/styles.css",
	"dist/controls.js",
	"dist/controls.d.ts",
	"LICENSE",
	"THIRD_PARTY_NOTICES.md",
	"dist/asset-notices/native-symbols/SOURCES.md",
]) {
	assert.ok(paths.includes(required), `Missing ${required}`);
}
assert.ok(
	paths.every((path) => !developmentPath.test(path)),
	"Package contains development files"
);
await cp(new URL("../fixtures/release-app/", import.meta.url), directory, {
	recursive: true,
});
const declarations = paths.filter((path) => path.endsWith(".d.ts"));
await writeFile(
	join(directory, "src/exports-check.ts"),
	declarations
		.map(
			(path, index) =>
				`import type * as Entry${index} from "@1bye/macos/${path.slice(5, -5)}";`
		)
		.join("\n")
);
const manifest = JSON.parse(
	await readFile(join(directory, "package.json"), "utf8")
);
manifest.dependencies["@1bye/macos"] = `file:./${pack.filename}`;
await writeFile(
	join(directory, "package.json"),
	`${JSON.stringify(manifest, null, 2)}\n`
);
console.log(
	`Fresh consumer: ${directory}\nTarball: ${pack.filename} (${pack.size} bytes)`
);
execFileSync("npm", ["install", "--cache", cache, "--no-audit", "--no-fund"], {
	cwd: directory,
	stdio: "inherit",
});
for (const task of ["test", "build"]) {
	execFileSync("npm", ["run", task], { cwd: directory, stdio: "inherit" });
}
console.log(
	`Release smoke test passed. Preview with: cd ${directory} && npm run preview`
);
