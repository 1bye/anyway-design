import { createFileRoute } from "@tanstack/react-router";
import { createSearchAPI } from "fumadocs-core/search/server";
import { docsConfig } from "../../docs.config";
import { macosSearchIndexes } from "../../lib/macos-search";
import { source } from "../../lib/source";

let search: ReturnType<typeof createSearchAPI> | undefined;

async function getSearch() {
	if (search) {
		return search;
	}
	const initialized = createSearchAPI("advanced", {
		indexes: async () => [
			...(await Promise.all(
				source
					.getPages()
					.filter((page) => !page.url.startsWith("/docs/macos/components/"))
					.map(async (page) => {
						const data = page.data.structuredData;
						const structuredData =
							typeof data === "function" ? await data() : data;
						if (!structuredData) {
							throw new Error(`Missing search content for ${page.url}`);
						}
						return {
							id: page.url,
							title: page.data.title ?? page.url,
							description: page.data.description,
							breadcrumbs: [docsConfig.name],
							url: page.url,
							structuredData,
						};
					})
			)),
			...macosSearchIndexes,
		],
	});
	// Workers forbid indexing timers at module scope; share only a completed index.
	await initialized.search("");
	search = initialized;
	return initialized;
}

export const Route = createFileRoute("/api/search")({
	server: {
		handlers: { GET: async ({ request }) => (await getSearch()).GET(request) },
	},
});
