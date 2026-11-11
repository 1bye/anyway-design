import assert from "node:assert/strict";
import { lstat, readdir, readFile } from "node:fs/promises";
import { MacSwitch } from "@1bye/macos/controls";
import { MacOSEnvironment } from "@1bye/macos/environment";
import { MacFileIcon } from "@1bye/macos/file-icons";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const packageRoot = new URL("./node_modules/@1bye/macos/", import.meta.url);
const manifest = JSON.parse(
	await readFile(new URL("package.json", packageRoot), "utf8")
);
assert.equal(
	(await lstat(packageRoot)).isSymbolicLink(),
	false,
	"Consumer must use the extracted tarball, not a workspace link"
);
assert.equal(manifest.name, "@1bye/macos");
assert.equal(manifest.version, "0.1.0");
assert.equal(manifest.private, undefined);
assert.equal(manifest.license, "MIT");
for (const dependencies of [
	manifest.dependencies,
	manifest.peerDependencies,
	manifest.devDependencies,
]) {
	for (const version of Object.values(dependencies)) {
		assert.doesNotMatch(version, /workspace:|catalog:|file:/);
	}
}
const files = await readdir(new URL("dist/", packageRoot));
await Promise.all(
	files
		.filter((name) => name.endsWith(".d.ts"))
		.map((file) => import(`@1bye/macos/${file.slice(0, -5)}`))
);
const markup = renderToStaticMarkup(
	createElement(
		MacOSEnvironment,
		{ appearance: "light" },
		createElement(MacSwitch, {
			defaultChecked: true,
			key: "switch",
			label: "Notifications",
		}),
		createElement(MacFileIcon, { key: "icon", name: "folder" })
	)
);
assert.match(markup, /data-appearance="light"/);
assert.match(markup, /role="switch"/);
assert.match(markup, /data:image\/png;base64,/);
assert.match(
	await readFile(new URL("dist/styles.css", packageRoot), "utf8"),
	/mac-switch/
);
console.log(
	`Verified installed exports, declarations, SSR, CSS, and embedded assets (${files.filter((file) => file.endsWith(".d.ts")).length} entry points).`
);
