import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { includeLabAssets } from "../tooling/include-lab-assets";

const labDist = fileURLToPath(
	new URL("../../macos-lab/dist/", import.meta.url)
);
const clientDist = fileURLToPath(new URL("../dist/client/", import.meta.url));
const labHtml = await readFile(resolve(labDist, "index.html"), "utf8");
await includeLabAssets(labDist, clientDist);
await mkdir(resolve(clientDist, "macos-lab"), { recursive: true });
await writeFile(resolve(clientDist, "macos-lab/index.html"), labHtml);
process.stdout.write(
	"Included macOS Lab, fonts, and native reference assets in Platform.\n"
);
