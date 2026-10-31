import { expect, it } from "bun:test";
import { BookOpen } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";
import { DocsHeader, DocsWelcomeBanner } from "../src/components/docs-header";
import { DocsNotFound } from "../src/components/docs-state";
import { type DocsConfig, DocsProvider, getDocsHref } from "../src/config";

const platform: DocsConfig = {
	baseUrl: "/platform/docs/",
	description: "Platform documentation",
	headerLabel: "platform",
	hero: {
		actions: [
			{ hash: "setup", label: "Start", slug: "intro", variant: "primary" },
		],
		lines: ["Build with Platform."],
	},
	homePage: "intro",
	logo: {
		baseline: 138,
		height: 202,
		src: "/brand/anyway-wordmark.svg",
		width: 934,
	},
	name: "Platform",
	navigation: [{ icon: BookOpen, label: "Guides", slug: "intro" }],
	repositoryUrl: "https://example.com/platform",
};

it("uses the consumer's identity and base URL without importing app configuration", () => {
	const html = renderToStaticMarkup(
		<DocsProvider config={platform}>
			<DocsHeader />
			<DocsWelcomeBanner />
		</DocsProvider>
	);
	expect(html).toContain('aria-label="Platform documentation home"');
	expect(html).toContain('href="/platform/docs/intro"');
	expect(html).toContain('href="/platform/docs/intro#setup"');
	expect(html).toContain("/brand/anyway-wordmark.svg");
	expect(html).toContain('data-header-label="platform"');
	expect(html).toContain(">platform</span>");
	expect(html).toContain("Build with Platform.");
	expect(html).not.toContain("Anyway way");
});

it("keeps each provider's configuration isolated and supplies useful defaults", () => {
	const anotherProject = {
		...platform,
		baseUrl: undefined,
		headerLabel: undefined,
		name: "Notebook",
	};
	const html = renderToStaticMarkup(
		<DocsProvider config={anotherProject}>
			<DocsHeader />
		</DocsProvider>
	);
	expect(html).toContain('aria-label="Notebook documentation home"');
	expect(html).not.toContain('aria-label="Platform documentation home"');
	expect(html).toContain(">docs</span>");
	expect(getDocsHref(anotherProject)).toBe("/docs/intro");
	expect(getDocsHref({ ...platform, baseUrl: "/" }, "guide")).toBe("/guide");
});

it("renders the canvas 404 with the consumer's header on the server", () => {
	const html = renderToStaticMarkup(
		<DocsProvider config={platform}>
			<DocsNotFound />
		</DocsProvider>
	);
	expect(html).toContain('aria-label="404 — Page not found"');
	expect(html).toContain('href="/platform/docs/intro"');
	expect(html).toContain("data-canvas-text");
});

it("reports a missing provider clearly", () => {
	expect(() => renderToStaticMarkup(<DocsHeader />)).toThrow("<DocsProvider");
});
