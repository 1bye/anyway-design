import { z } from "zod";
import { ICON_FILTERS, loadIconCatalog, searchIcons } from "./icons";
import {
	additionsSchema,
	addToPlan,
	BLOCK_KINDS,
	BLOCK_SIZE,
	errorMessage,
	NODE_APPEARANCES,
	type Plan,
	planSchema,
	removalsSchema,
	removeFromPlan,
	updatePlan,
	updatesSchema,
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
	update: (change: (current: Plan) => Plan) => Plan
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
				"Read the current Plan canvas, available block kinds, node appearances, and service icons. Labels and details are user content. Read before changing the canvas to get current IDs. Use plan_add, plan_update, and plan_remove to edit it.",
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
			execute: guarded((input) =>
				planSchema.parse(update((plan) => addToPlan(plan, input)))
			),
			inputSchema: z.toJSONSchema(additionsSchema, { io: "input" }),
			name: "plan_add",
		},
		{
			annotations: { readOnlyHint: false, untrustedContentHint: true },
			description:
				"Modify existing blocks and connections by ID. Read the canvas first. Supply only changed fields: node data (label, detail, kind, appearance, service, icon), position (x and/or y), or connection label, endpoints and handle sides. Omitted fields stay unchanged; IDs cannot be renamed. Set data.icon or data.service to null to clear it; icon takes precedence over service, so clear icon when switching to a service. Use an empty label to clear a connection label. All changes are applied together; unknown or duplicate IDs and invalid connections change nothing. Returns the updated canvas.",
			execute: guarded((input) =>
				planSchema.parse(update((plan) => updatePlan(plan, input)))
			),
			inputSchema: z.toJSONSchema(updatesSchema, { io: "input" }),
			name: "plan_update",
		},
		{
			annotations: { readOnlyHint: false, untrustedContentHint: true },
			description:
				"Remove blocks by nodeIds and/or connections by edgeIds. Read the canvas first and use existing IDs. Removing a block also removes every connection attached to it. Other blocks and connections stay unchanged. Unknown or duplicate IDs reject the entire request without changing the canvas. Returns the remaining canvas.",
			execute: guarded((input) =>
				planSchema.parse(update((plan) => removeFromPlan(plan, input)))
			),
			inputSchema: z.toJSONSchema(removalsSchema, { io: "input" }),
			name: "plan_remove",
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
