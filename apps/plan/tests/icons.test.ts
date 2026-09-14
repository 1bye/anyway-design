import { expect, spyOn, test } from "bun:test";
import { readFile } from "node:fs/promises";
import {
	catalogSchema,
	iconSchema,
	iconSource,
	searchIcons,
} from "../src/lib/icons";
import { addToPlan, INITIAL_PLAN, planSchema } from "../src/lib/plan";
import { type ModelContext, registerPlanTools } from "../src/lib/webmcp";

test("the full catalog validates, searches by provider and alias, and saves portable service nodes", async () => {
	const catalog = catalogSchema.parse(
		JSON.parse(
			await readFile(
				new URL("../public/icons/catalog.json", import.meta.url),
				"utf8"
			)
		)
	);
	expect(catalog.length).toBeGreaterThan(6000);
	expect(new Set(catalog.map((entry) => entry.slug)).size).toBe(catalog.length);
	expect(searchIcons(catalog, "  ")).toBe(catalog);
	for (const query of [
		"neon",
		"planetscale",
		"chatgpt",
		"claude",
		"cloudflare workers",
	]) {
		expect(searchIcons(catalog, query).length).toBeGreaterThan(0);
	}
	expect(
		searchIcons(catalog, " aWs   LaMbDa ", "AWS").some(
			(entry) => entry.slug === "aws-aws-lambda"
		)
	).toBe(true);
	expect(
		searchIcons(catalog, "google cloud run", "GCP").some(
			(entry) => entry.slug === "gcp-cloud-run"
		)
	).toBe(true);
	expect(searchIcons(catalog, "functions", "Azure").length).toBeGreaterThan(0);
	expect(searchIcons(catalog, "neon", "Databases")[0]?.slug).toBe("neon");
	expect(searchIcons(catalog, "neon", "AWS")).toEqual([]);
	expect(searchIcons(catalog, "no-such-icon-zzzz")).toEqual([]);
	const [chatgpt] = searchIcons(catalog, "chatgpt");
	const icon = iconSchema.parse(chatgpt);
	expect(iconSource(icon)).toEndWith("/openai-chatgpt/mono.svg");
	const node = {
		data: {
			appearance: "tinted",
			detail: "My service",
			icon,
			kind: "external",
			label: "Assistant",
		},
		id: "chatgpt",
		position: { x: 123, y: 456 },
		type: "block",
	};
	const plan = addToPlan(INITIAL_PLAN, { nodes: [node] });
	const reopened = planSchema.parse(JSON.parse(JSON.stringify(plan)));
	expect(reopened.nodes.at(-1)).toEqual(node);
	for (const patch of [
		{ slug: "../secret" },
		{ slug: "https://example.com/icon" },
		{ color: "url(x)" },
		{ variant: "unknown" },
	]) {
		expect(iconSchema.safeParse({ ...icon, ...patch }).success).toBe(false);
	}
});

test("AI icon search returns usable references and rejects requests after disconnect", async () => {
	const catalog = await readFile(
		new URL("../public/icons/catalog.json", import.meta.url),
		"utf8"
	);
	const request = spyOn(globalThis, "fetch").mockResolvedValue(
		new Response(catalog)
	);
	const registered: Parameters<ModelContext["registerTool"]>[0][] = [];
	const controller = new AbortController();
	try {
		await registerPlanTools(
			{
				registerTool: (tool) => {
					registered.push(tool);
					return Promise.resolve();
				},
			},
			controller,
			() => INITIAL_PLAN,
			(change) => change(INITIAL_PLAN)
		);
		const search = registered.find((tool) => tool.name === "plan_search_icons");
		if (!search) {
			throw new Error("Icon search was not registered");
		}
		const result = JSON.parse(
			await search.execute({ provider: "AWS", query: "lambda" })
		);
		expect(result.ok).toBe(true);
		expect(
			result.data.icons.some(
				(entry: { icon: { slug: string } }) =>
					entry.icon.slug === "aws-aws-lambda"
			)
		).toBe(true);
		expect(iconSchema.safeParse(result.data.icons[0].icon).success).toBe(true);
		expect(result.data.icons.length).toBeLessThanOrEqual(24);
		controller.abort();
		expect(JSON.parse(await search.execute({ query: "neon" })).ok).toBe(false);
	} finally {
		request.mockRestore();
	}
});
