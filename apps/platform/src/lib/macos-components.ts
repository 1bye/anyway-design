import type { StaticSource } from "fumadocs-core/source";
import { PLAYGROUND_ENTRIES } from "macos-lab/catalog";

export const componentGroups = [
	...new Set(PLAYGROUND_ENTRIES.map((entry) => entry.group)),
];

export const macosComponentUrl = (id: string) => `/docs/macos/components/${id}`;

export const macosComponentSource: StaticSource = {
	files: PLAYGROUND_ENTRIES.map((entry) => ({
		data: {
			description: entry.description,
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
		},
		path: `macos/components/${entry.id}.mdx`,
		type: "page",
	})),
};

macosComponentSource.files.push({
	data: {
		collapsible: false,
		pages: componentGroups.flatMap((group) => [
			`---${group}---`,
			...PLAYGROUND_ENTRIES.filter((entry) => entry.group === group).map(
				(entry) => entry.id
			),
		]),
		title: "Components",
	},
	path: "macos/components/meta.json",
	type: "meta",
});
