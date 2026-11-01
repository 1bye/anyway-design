import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { normalizePath, type Plugin, type ViteDevServer } from "vite";

export const labRoot = fileURLToPath(
	new URL("../../macos-lab/", import.meta.url)
);
export const labPublic = resolve(labRoot, "public");
export const labFramePath = "/macos-lab/index.html";
const publicPrefix = /^\/(assets|fonts|brand)\//;
const mimeTypes: Record<string, string> = {
	".jpeg": "image/jpeg",
	".jpg": "image/jpeg",
	".json": "application/json",
	".md": "text/plain",
	".png": "image/png",
	".rtf": "application/rtf",
	".svg": "image/svg+xml",
	".txt": "text/plain",
	".webp": "image/webp",
	".woff2": "font/woff2",
};

export function labPublicFile(pathname: string): string | undefined {
	let decoded: string;
	try {
		decoded = decodeURIComponent(pathname);
	} catch {
		return;
	}
	if (!publicPrefix.test(decoded)) {
		return;
	}
	const file = resolve(labPublic, decoded.slice(1));
	return file.startsWith(`${labPublic}${sep}`) ? file : undefined;
}

export function labDevelopmentHtml(html: string): string {
	const entry = 'src="/src/main.tsx"';
	if (!html.includes(entry)) {
		throw new Error(
			"The macOS Lab HTML entry changed; update Platform's frame integration."
		);
	}
	return html.replace(
		entry,
		`src="/@fs/${normalizePath(resolve(labRoot, "src/main.tsx"))}"`
	);
}

function isMissingFile(error: unknown): boolean {
	return (
		error !== null &&
		typeof error === "object" &&
		"code" in error &&
		(error.code === "ENOENT" || error.code === "ENOTDIR")
	);
}

async function loadLabResource(pathname: string, server: ViteDevServer) {
	if (pathname === labFramePath) {
		const html = labDevelopmentHtml(
			await readFile(resolve(labRoot, "index.html"), "utf8")
		);
		return {
			body: await server.transformIndexHtml(labFramePath, html),
			contentType: "text/html; charset=utf-8",
		};
	}
	const file = labPublicFile(pathname);
	if (!(file && (await stat(file)).isFile())) {
		return;
	}
	return {
		body: await readFile(file),
		contentType: mimeTypes[extname(file)] ?? "application/octet-stream",
	};
}

export function macosLabDev(): Plugin {
	return {
		apply: "serve",
		configureServer(server) {
			server.middlewares.use(async (request, response, next) => {
				if (request.method !== "GET" && request.method !== "HEAD") {
					return next();
				}
				const { pathname } = new URL(request.url ?? "/", "http://localhost");
				try {
					const resource = await loadLabResource(pathname, server);
					if (!resource) {
						return next();
					}
					response.setHeader("Content-Type", resource.contentType);
					response.end(request.method === "HEAD" ? undefined : resource.body);
				} catch (error) {
					next(isMissingFile(error) ? undefined : error);
				}
			});
		},
		enforce: "pre",
		name: "platform-macos-lab",
	};
}
