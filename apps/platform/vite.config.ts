import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { fumadocsMdx } from "fumadocs-mdx/vite";
import { defineConfig } from "vite";
import { macosLabDev } from "./tooling/macos-lab.ts";

export default defineConfig({
	plugins: [
		macosLabDev(),
		fumadocsMdx(),
		tailwindcss(),
		tanstackStart(),
		react(),
	],
	resolve: {
		dedupe: ["react", "react-dom", "lucide-react"],
		tsconfigPaths: true,
	},
	server: { port: 3008, strictPort: true },
	ssr: {
		noExternal: ["@anyway-design/docs", "macos-lab", "@anyway-design/macos"],
	},
});
