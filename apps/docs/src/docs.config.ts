import type { DocsConfig } from "@anyway-design/docs/config";
import { BookOpen, Component } from "lucide-react";

const pages = { examples: "components", guide: "getting-started" };

export const docsConfig: DocsConfig = {
	description: "Guides and live examples for documenting Anyway projects.",
	hero: {
		actions: [
			{
				hash: "start-your-docs",
				label: "Read the guide",
				slug: pages.guide,
				variant: "primary",
			},
			{ label: "Explore examples", slug: pages.examples, variant: "ghost" },
		],
		lines: ["Build it the", "Anyway way."],
	},
	homePage: pages.guide,
	logo: {
		baseline: 138,
		height: 202,
		src: "/brand/anyway-wordmark.svg",
		width: 934,
	},
	name: "Anyway",
	navigation: [
		{ icon: BookOpen, label: "Documentation", slug: pages.guide },
		{ icon: Component, label: "Examples", slug: pages.examples },
	],
	repositoryUrl: "https://github.com/1bye/anyway-design",
};
