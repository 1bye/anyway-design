import { expect, it } from "bun:test";
import { file } from "bun";
import { docsConfig } from "../src/docs.config";

it("points configured navigation and hero actions at existing MDX pages", async () => {
	const slugs = new Set([
		docsConfig.homePage,
		...docsConfig.navigation.map((item) => item.slug),
		...docsConfig.hero.actions.map((action) => action.slug),
	]);
	await Promise.all(
		[...slugs].map(async (slug) => {
			const page = file(
				new URL(`../content/docs/${slug}.mdx`, import.meta.url)
			);
			expect(await page.exists(), `Missing configured docs page: ${slug}`).toBe(
				true
			);
		})
	);
});

it("ships the configured logo and keeps its baseline within the asset", async () => {
	const { logo } = docsConfig;
	const asset = file(new URL(`../public${logo.src}`, import.meta.url));
	expect(await asset.exists()).toBe(true);
	expect(logo.width).toBeGreaterThan(0);
	expect(logo.baseline).toBeGreaterThan(0);
	expect(logo.baseline).toBeLessThanOrEqual(logo.height);
});
