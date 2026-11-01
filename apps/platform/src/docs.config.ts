import type { DocsConfig } from "@anyway-design/docs/config";
import { BookOpen, Monitor } from "lucide-react";

export const docsConfig: DocsConfig = {
	description:
		"macOS components, live playgrounds, and native references from Anyway.",
	headerLabel: "platform",
	hero: {
		actions: [
			{
				hash: "use-a-component",
				label: "Get started",
				slug: "getting-started",
				variant: "primary",
			},
			{ label: "Explore macOS", slug: "macos", variant: "ghost" },
		],
		lines: ["Build with", "Platform."],
	},
	homePage: "getting-started",
	logo: {
		baseline: 138,
		height: 202,
		src: "/brand/anyway-wordmark.svg",
		width: 934,
	},
	name: "Platform",
	navigation: [
		{ icon: BookOpen, label: "Documentation", slug: "getting-started" },
		{ icon: Monitor, label: "macOS", slug: "macos" },
	],
	repositoryUrl: "https://github.com/1bye/anyway-design",
};
