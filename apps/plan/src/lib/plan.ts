import type { Edge, Node } from "@xyflow/react";
import { z } from "zod";

export const BLOCK_KINDS = [
	"app",
	"api",
	"database",
	"storage",
	"worker",
	"queue",
	"external",
	"note",
] as const;
export type BlockKind = (typeof BLOCK_KINDS)[number];
export type PlanNode = Node<
	{ kind: BlockKind; label: string; detail: string },
	"block"
>;
export interface Plan {
	edges: Edge[];
	name: string;
	nodes: PlanNode[];
	version: 1;
}

const idSchema = z.string().min(1).max(100);
const nodeSchema = z.object({
	data: z.object({
		detail: z.string().max(500),
		kind: z.enum(BLOCK_KINDS),
		label: z.string().min(1).max(100),
	}),
	id: idSchema,
	position: z.object({
		x: z.number().min(-100_000).max(100_000),
		y: z.number().min(-100_000).max(100_000),
	}),
	type: z.literal("block"),
});
const edgeSchema = z.object({
	id: idSchema,
	label: z.string().max(100).optional(),
	source: idSchema,
	target: idSchema,
});

// Parsing also removes React Flow's transient selection and measurement fields.
export const planSchema = z
	.object({
		edges: z.array(edgeSchema).max(1000),
		name: z.string().min(1).max(100),
		nodes: z.array(nodeSchema).max(500),
		version: z.literal(1),
	})
	.superRefine((plan, context) => {
		const nodeIds = new Set(plan.nodes.map((node) => node.id));
		const edgeIds = new Set(plan.edges.map((edge) => edge.id));
		if (
			nodeIds.size !== plan.nodes.length ||
			edgeIds.size !== plan.edges.length
		) {
			context.addIssue({
				code: "custom",
				message: "Each block and connection needs a unique ID.",
			});
		}
		for (const edge of plan.edges) {
			if (!(nodeIds.has(edge.source) && nodeIds.has(edge.target))) {
				context.addIssue({
					code: "custom",
					message: `Connection ${edge.id} refers to a missing block.`,
				});
			}
		}
	});

export const additionsSchema = z.object({
	edges: z.array(edgeSchema).max(200).default([]),
	nodes: z.array(nodeSchema).max(100).default([]),
});

export function addToPlan(plan: Plan, input: unknown): Plan {
	const additions = additionsSchema.parse(input);
	const next = {
		...plan,
		edges: [...plan.edges, ...additions.edges],
		nodes: [...plan.nodes, ...additions.nodes],
	};
	planSchema.parse(next);
	return next;
}

export const INITIAL_PLAN: Plan = {
	edges: [
		{ id: "app-api", label: "HTTPS", source: "app", target: "api" },
		{
			id: "api-database",
			label: "read / write",
			source: "api",
			target: "database",
		},
	],
	name: "A simple web app",
	nodes: [
		{
			data: {
				detail: "Where people use your product",
				kind: "app",
				label: "Web app",
			},
			id: "app",
			position: { x: 0, y: 80 },
			type: "block",
		},
		{
			data: {
				detail: "A little logic in the middle",
				kind: "api",
				label: "API",
			},
			id: "api",
			position: { x: 320, y: 80 },
			type: "block",
		},
		{
			data: {
				detail: "Everything worth keeping",
				kind: "database",
				label: "Database",
			},
			id: "database",
			position: { x: 640, y: 80 },
			type: "block",
		},
	],
	version: 1,
};

export function errorMessage(error: unknown): string {
	if (error instanceof z.ZodError) {
		return error.issues[0]?.message ?? "This plan is invalid.";
	}
	return error instanceof Error
		? error.message
		: "Something went wrong. Please try again.";
}
