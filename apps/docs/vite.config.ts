import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { fumadocsMdx } from "fumadocs-mdx/vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [fumadocsMdx(), tailwindcss(), tanstackStart(), react()],
	resolve: {
		alias: [
			{
				find: /^@1bye\/macos\/(.+)$/,
				replacement: fileURLToPath(
					new URL("../../packages/macos/src/$1", import.meta.url)
				),
			},
		],
		dedupe: ["react", "react-dom", "lucide-react"],
		tsconfigPaths: true,
	},
	server: { port: 3007, strictPort: true },
	ssr: { noExternal: ["@anyway-design/docs"] },
});
