import { BookOpen, Component, type LucideIcon } from "lucide-react";

interface DocsConfig {
	description: string;
	hero: {
		lines: readonly string[];
		actions: readonly {
			label: string;
			slug: string;
			hash?: string;
			variant: "primary" | "ghost";
		}[];
	};
	homePage: string;
	logo: { src: string; width: number; height: number; baseline: number };
	name: string;
	navigation: readonly { label: string; slug: string; icon: LucideIcon }[];
	repositoryUrl: string;
}

const pages = { components: "components/switch", guide: "getting-started" };

export const docsConfig: DocsConfig = {
	description: "Guides and considered components for building with Anyway.",
	hero: {
		actions: [
			{
				hash: "find-your-starting-point",
				label: "Read the guide",
				slug: pages.guide,
				variant: "primary",
			},
			{ label: "Explore components", slug: pages.components, variant: "ghost" },
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
		{ icon: Component, label: "Components", slug: pages.components },
	],
	repositoryUrl: "https://github.com/1bye/anyway-design",
};
