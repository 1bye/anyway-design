import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: [
			{
				find: /^@1bye\/macos\/(.+)$/,
				replacement: fileURLToPath(
					new URL("../../packages/macos/src/$1", import.meta.url)
				),
			},
		],
	},
	server: { port: 3006, strictPort: true },
});
