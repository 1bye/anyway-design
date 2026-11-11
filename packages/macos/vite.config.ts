import { readdirSync } from "node:fs";
import { cp } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const source = fileURLToPath(new URL("./src", import.meta.url));
const sourceExtension = /\.(ts|tsx)$/;
const entries = Object.fromEntries(
	readdirSync(source)
		.filter((file) => sourceExtension.test(file) && !file.endsWith(".d.ts"))
		.map((file) => [file.replace(sourceExtension, ""), resolve(source, file)])
);

export default defineConfig({
	build: {
		cssCodeSplit: true,
		lib: {
			cssFileName: "styles",
			entry: { ...entries, styles: resolve(source, "styles.css") },
			fileName: (_format, entry) => `${entry}.js`,
			formats: ["es"],
		},
		minify: false,
		rolldownOptions: {
			external: [
				/^react(?:\/|$)/,
				/^react-dom(?:\/|$)/,
				/^@base-ui\/react(?:\/|$)/,
			],
		},
		target: "es2022",
	},
	plugins: [
		{
			closeBundle: async () =>
				cp(
					resolve(source, "assets"),
					fileURLToPath(new URL("./dist/asset-notices", import.meta.url)),
					{
						filter: (file) =>
							!extname(file) || [".md", ".json"].includes(extname(file)),
						recursive: true,
					}
				),
			name: "macos-asset-notices",
		},
	],
});
