import { spawnSync } from "node:child_process";
import { chmod, cp, mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const temporary = await mkdtemp(join(tmpdir(), "anyway-md-package-"));
const source = fileURLToPath(
	new URL("../../../packages/md-cli/", import.meta.url)
);
const output = fileURLToPath(new URL("../public/cli.tgz", import.meta.url));
try {
	await mkdir(join(temporary, "package"));
	await Promise.all(
		["package.json", "bin.mjs", "README.md"].map((file) =>
			cp(join(source, file), join(temporary, "package", file))
		)
	);
	await chmod(join(temporary, "package/bin.mjs"), 0o755);
	const result = spawnSync(
		"tar",
		["-czf", output, "-C", temporary, "package"],
		{ stdio: "inherit" }
	);
	if (result.status !== 0) {
		throw new Error("Could not package the installer.");
	}
} finally {
	await rm(temporary, { force: true, recursive: true });
}
