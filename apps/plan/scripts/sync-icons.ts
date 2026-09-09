import { writeFile } from "node:fs/promises";
import { z } from "zod";
import { catalogSchema, ICON_REVISION } from "../src/lib/icons";

const sourceSchema = z.array(
	z.object({
		aliases: z.array(z.string()).default([]),
		categories: z.array(z.string()),
		collection: z.string().default("brands"),
		hex: z.string(),
		slug: z.string(),
		title: z.string(),
		variants: z.object({ default: z.string() }),
	})
);
const response = await fetch(
	`https://raw.githubusercontent.com/glincker/thesvg/${ICON_REVISION}/src/data/icons.json`
);
if (!response.ok) {
	throw new Error(`Catalog download failed: ${response.status}`);
}
const source = sourceSchema.parse(await response.json());
const providers: Record<string, string> = {
	aws: "AWS",
	azure: "Azure",
	gcp: "GCP",
};
const DATABASE_CATEGORY = /database/i;
const featured = [
	"cloudflare",
	"aws-amazon-route-53",
	"aws-aws-lambda",
	"aws-amazon-rds",
	"gcp-cloud-run",
	"neon",
	"planetscale",
	"openai-chatgpt",
	"claude",
	"cloudflare-workers",
	"cloudflare-pages",
	"supabase",
	"vercel",
	"github",
	"docker",
	"postgresql",
	"redis",
	"stripe",
	"azure-functions",
	"google-gemini",
];
const catalog = source.map((entry) => {
	const provider = providers[entry.collection];
	const groups = provider ? [provider] : [];
	if (entry.slug.includes("cloudflare")) {
		groups.push("Cloudflare");
	}
	if (entry.categories.includes("AI")) {
		groups.push("AI");
	}
	if (entry.categories.some((category) => DATABASE_CATEGORY.test(category))) {
		groups.push("Databases");
	}
	const variant = entry.variants.default.split("/").at(-1)?.replace(".svg", "");
	if (!["default", "color", "mono"].includes(variant ?? "")) {
		throw new Error(`Unsupported icon variant: ${entry.slug}`);
	}
	return {
		color: `#${entry.hex}`,
		groups,
		keywords: [
			entry.title,
			entry.slug,
			...entry.aliases,
			...entry.categories,
			...groups,
			provider === "GCP" ? "google cloud" : "",
			provider === "AWS" ? "amazon web services" : "",
			provider === "Azure" ? "microsoft" : "",
		]
			.join(" ")
			.toLowerCase(),
		label: entry.title,
		slug: entry.slug,
		variant,
	};
});
catalog.sort((a, b) => {
	const aRank = featured.indexOf(a.slug);
	const bRank = featured.indexOf(b.slug);
	return (
		(aRank < 0 ? featured.length : aRank) -
			(bRank < 0 ? featured.length : bRank) || a.label.localeCompare(b.label)
	);
});
catalogSchema.parse(catalog);
await writeFile(
	new URL("../public/icons/catalog.json", import.meta.url),
	`${JSON.stringify(catalog)}\n`
);
process.stdout.write(`Saved ${catalog.length} icons at ${ICON_REVISION}.\n`);
