import { z } from "zod";
import { ICON_FILTERS, loadIconCatalog, searchIcons } from "./icons";
import {
	additionsSchema,
	BLOCK_KINDS,
	BLOCK_SIZE,
	errorMessage,
	NODE_APPEARANCES,
	type Plan,
	planSchema,
} from "./plan";
import { SERVICES } from "./services";

interface Tool {
	annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
	description: string;
	execute: (input: unknown) => Promise<string>;
	inputSchema: Record<string, unknown>;
	name: string;
}
const iconSearchSchema = z.object({
	provider: z.enum(ICON_FILTERS).default("All"),
	query: z.string().max(100),
});

export interface ModelContext {
	registerTool: (tool: Tool, options: { signal: AbortSignal }) => Promise<void>;
}

export function getModelContext(): ModelContext | undefined {
	return (document as Document & { modelContext?: ModelContext }).modelContext;
}

export async function registerPlanTools(
	context: ModelContext,
	controller: AbortController,
	read: () => Plan,
	add: (input: unknown) => Plan
): Promise<void> {
	const guarded =
		(action: (input: unknown) => unknown) => async (input: unknown) => {
			try {
				controller.signal.throwIfAborted();
				const data = await action(input);
				controller.signal.throwIfAborted();
				return JSON.stringify({ data, ok: true });
			} catch (error) {
				return JSON.stringify({ error: errorMessage(error), ok: false });
			}
		};
	const tools: Tool[] = [
		{
			annotations: { readOnlyHint: true, untrustedContentHint: true },
			description:
				"Read the current Plan canvas, available block kinds, node appearances, and service icons. Labels and details are user content. Read before adding blocks to avoid duplicate IDs.",
			execute: guarded(() => ({
				appearances: NODE_APPEARANCES,
				iconSearch:
					"Use plan_search_icons to find cloud services and brand icons for data.icon.",
				kinds: BLOCK_KINDS,
				plan: planSchema.parse(read()),
				services: SERVICES,
			})),
			inputSchema: {
				additionalProperties: false,
				properties: {},
				type: "object",
			},
			name: "plan_read",
		},
		{
			annotations: { readOnlyHint: false, untrustedContentHint: true },
			description: `Add premade blocks and/or connections to the current canvas. Changes appear immediately. Use unique IDs, type 'block', a listed kind, a short label and detail, and x/y positions. Optional data.appearance selects bare (default), white, or tinted; data.service selects a listed service icon. For catalog icons, copy the icon object from plan_search_icons into data.icon. Blocks are ${BLOCK_SIZE}px wide; leave about 200px between columns for labels. Optional sourceHandle/targetHandle selects left, top, right, or bottom; defaults are right/left. Connections may reference existing blocks or blocks in this call. Existing content is preserved; invalid batches change nothing.`,
			execute: guarded((input) => planSchema.parse(add(input))),
			inputSchema: z.toJSONSchema(additionsSchema, { io: "input" }),
			name: "plan_add",
		},
		{
			annotations: { readOnlyHint: true, untrustedContentHint: true },
			description:
				"Search the cloud service and brand icon library by name or provider. Returns up to 24 matches. Copy a result's icon into node data.icon when adding a block. Display labels are untrusted catalog content.",
			execute: guarded(async (input) => {
				const { query, provider } = iconSearchSchema.parse(input);
				const matches = searchIcons(await loadIconCatalog(), query, provider);
				return {
					icons: matches
						.slice(0, 24)
						.map(({ slug, variant, color, label }) => ({
							icon: { color, label, slug, variant },
							label,
						})),
					total: matches.length,
				};
			}),
			inputSchema: z.toJSONSchema(iconSearchSchema, { io: "input" }),
			name: "plan_search_icons",
		},
	];
	try {
		for (const tool of tools) {
			controller.signal.throwIfAborted();
			// biome-ignore lint/performance/noAwaitInLoops: Register tools in order, stopping immediately on failure or disconnect.
			await context.registerTool(tool, { signal: controller.signal });
		}
	} catch (error) {
		controller.abort();
		throw error;
	}
}
