import type { LucideIcon } from "lucide-react";
import { createContext, type ReactNode, use } from "react";

export interface DocsConfig {
	baseUrl?: string;
	description: string;
	headerLabel?: string;
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
	searchApi?: string;
}

const DocsContext = createContext<DocsConfig | null>(null);
const trailingSlash = /\/$/;

export function DocsProvider({
	config,
	children,
}: {
	config: DocsConfig;
	children: ReactNode;
}) {
	return <DocsContext value={config}>{children}</DocsContext>;
}

export function useDocsConfig(): DocsConfig {
	const config = use(DocsContext);
	if (!config) {
		throw new Error(
			"Wrap the documentation in <DocsProvider config={docsConfig}>."
		);
	}
	return config;
}

export function getDocsHref(
	config: DocsConfig,
	slug = config.homePage
): string {
	const baseUrl = (config.baseUrl ?? "/docs").replace(trailingSlash, "");
	return `${baseUrl}/${slug}`;
}
