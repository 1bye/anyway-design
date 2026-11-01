import { createFileRoute } from "@tanstack/react-router";
import { createSearchAPI } from "fumadocs-core/search/server";
import { docsConfig } from "../../docs.config";
import { macosSearchIndexes } from "../../lib/macos-search";
import { source } from "../../lib/source";

const search = createSearchAPI("advanced", {
	indexes: async () => [
		...(await Promise.all(
			source.getPages().map(async (page) => {
				const data = page.data.structuredData;
				const structuredData = typeof data === "function" ? await data() : data;
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

export const Route = createFileRoute("/api/search")({
	server: { handlers: { GET: ({ request }) => search.GET(request) } },
});
