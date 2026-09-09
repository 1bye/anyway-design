import { z } from "zod";

export const ICON_REVISION = "19107207407cd85eaebd5a84b2ba7084336c69fc";
export const ICON_CDN = `https://cdn.jsdelivr.net/gh/glincker/thesvg@${ICON_REVISION}/public/icons`;
export const ICON_FILTERS = [
	"All",
	"AWS",
	"GCP",
	"Azure",
	"Cloudflare",
	"AI",
	"Databases",
] as const;
export type IconFilter = (typeof ICON_FILTERS)[number];

export const iconSchema = z.object({
	color: z.string().regex(/^#[\da-fA-F]{3}(?:[\da-fA-F]{3})?$/),
	label: z.string().min(1).max(100),
	slug: z
		.string()
		.min(1)
		.max(150)
		.regex(/^[a-z0-9][a-z0-9-]*$/),
	variant: z.enum(["default", "color", "mono"]),
});
export type IconReference = z.infer<typeof iconSchema>;

const catalogEntrySchema = iconSchema.extend({
	groups: z.array(z.string()),
	keywords: z.string(),
});
export type CatalogEntry = z.infer<typeof catalogEntrySchema>;
export const catalogSchema = z.array(catalogEntrySchema).max(20_000);
let catalogRequest: Promise<CatalogEntry[]> | undefined;

export function loadIconCatalog(): Promise<CatalogEntry[]> {
	catalogRequest ??= fetchCatalog();
	return catalogRequest;
}

async function fetchCatalog(): Promise<CatalogEntry[]> {
	try {
		const response = await fetch("/icons/catalog.json");
		if (!response.ok) {
			throw new Error("The icon library could not be loaded.");
		}
		return catalogSchema.parse(await response.json());
	} catch (error) {
		catalogRequest = undefined;
		throw error;
	}
}

const WORD_SEPARATOR = /[\s-]+/;
export function matchesIconSearch(keywords: string, query: string): boolean {
	return query
		.toLowerCase()
		.trim()
		.split(WORD_SEPARATOR)
		.every((word) => keywords.includes(word));
}

export function searchIcons(
	catalog: CatalogEntry[],
	query: string,
	filter: IconFilter = "All"
): CatalogEntry[] {
	const matches = catalog.filter(
		(entry) =>
			(filter === "All" || entry.groups.includes(filter)) &&
			matchesIconSearch(entry.keywords, query)
	);
	const exact = query.trim().toLowerCase();
	if (!exact) {
		return matches;
	}
	return matches.sort(
		(a, b) =>
			Number(b.label.toLowerCase() === exact || b.slug === exact) -
			Number(a.label.toLowerCase() === exact || a.slug === exact)
	);
}

export function iconSource(icon: IconReference): string {
	return `${ICON_CDN}/${icon.slug}/${icon.variant}.svg`;
}
