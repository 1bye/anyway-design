import type { AdvancedIndex } from "fumadocs-core/search/server";
import { PLAYGROUND_ENTRIES } from "macos-lab/catalog";
import { docsConfig } from "../docs.config";
import { macosComponentUrl } from "./macos-components";

export const macosSearchIndexes: AdvancedIndex[] = PLAYGROUND_ENTRIES.map(
	(entry) => ({
		breadcrumbs: [docsConfig.name, "macOS", entry.group],
		description: entry.description,
		id: `macos-${entry.id}`,
		structuredData: {
			contents: [
				{
					content: `${entry.description} ${entry.imports}`,
					heading: undefined,
				},
			],
			headings: [],
		},
		title: entry.title,
		url: macosComponentUrl(entry.id),
	})
);
