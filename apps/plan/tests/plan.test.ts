import { expect, test } from "bun:test";
import {
	addToPlan,
	INITIAL_PLAN,
	NODE_APPEARANCES,
	planSchema,
	removeFromPlan,
	updatePlan,
} from "../src/lib/plan";
import { type ModelContext, registerPlanTools } from "../src/lib/webmcp";

test("AI additions connect new and existing blocks atomically; invalid additions preserve the canvas", () => {
	const worker = {
		data: { detail: "", kind: "worker", label: "Process uploads" },
		id: "worker",
		position: { x: 320, y: 320 },
		type: "block",
	};
	const next = addToPlan(INITIAL_PLAN, {
		edges: [{ id: "jobs", source: "api", target: "worker" }],
		nodes: [worker],
	});
	expect(next.nodes).toHaveLength(4);
	expect(next.edges).toHaveLength(3);
	expect(next.nodes.at(-1)?.data.aiReveal).toBe(true);
	expect(next.nodes[0]).toBe(INITIAL_PLAN.nodes[0]);
	expect(planSchema.parse(next).nodes.at(-1)).toEqual(worker);
	expect(INITIAL_PLAN.nodes).toHaveLength(3);
	expect(() =>
		addToPlan(INITIAL_PLAN, {
			edges: [{ id: "broken", source: "api", target: "missing" }],
			nodes: [worker],
		})
	).toThrow("missing block");
	expect(() => addToPlan(next, { nodes: [worker] })).toThrow("unique ID");
	expect(() =>
		addToPlan(INITIAL_PLAN, {
			nodes: [{ ...worker, position: { x: Number.POSITIVE_INFINITY, y: 0 } }],
		})
	).toThrow();
	expect(INITIAL_PLAN.nodes).toHaveLength(3);
});

test("portable plans retain content but discard transient canvas state and reject future versions", () => {
	const plan = planSchema.parse({
		...INITIAL_PLAN,
		nodes: INITIAL_PLAN.nodes.map((node) => ({
			...node,
			data: { ...node.data, aiReveal: true },
			measured: { height: 128, width: 224 },
			selected: true,
		})),
	});
	expect(plan).toEqual(INITIAL_PLAN);
	expect(planSchema.parse(JSON.parse(JSON.stringify(plan)))).toEqual(
		INITIAL_PLAN
	);
	expect(() => planSchema.parse({ ...plan, version: 2 })).toThrow();
});

test("node appearances, service icons, and connection sides survive a portable round trip", () => {
	const nodes = INITIAL_PLAN.nodes.map((node, index) => ({
		...node,
		data: {
			...node.data,
			appearance: NODE_APPEARANCES[index],
			service: "lambda",
		},
	}));
	const edges = INITIAL_PLAN.edges.map((edge) => ({
		...edge,
		sourceHandle: "bottom",
		targetHandle: "top",
	}));
	const saved = planSchema.parse({ ...INITIAL_PLAN, edges, nodes });
	const reopened = planSchema.parse(JSON.parse(JSON.stringify(saved)));
	expect(reopened.nodes.map((node) => node.data.appearance)).toEqual(
		NODE_APPEARANCES
	);
	expect(reopened.nodes.map((node) => node.position)).toEqual(
		INITIAL_PLAN.nodes.map((node) => node.position)
	);
	expect(
		reopened.nodes.map((node) => [node.data.label, node.data.detail])
	).toEqual(
		INITIAL_PLAN.nodes.map((node) => [node.data.label, node.data.detail])
	);
	expect(reopened.edges).toEqual(edges);
	expect(reopened).toEqual(saved);
	for (const data of [{ appearance: "chip" }, { service: "unknown" }]) {
		expect(() =>
			planSchema.parse({
				...saved,
				nodes: [{ ...nodes[0], data: { ...nodes[0].data, ...data } }],
			})
		).toThrow();
	}
});

test("AI additions accept styled service nodes and validate connection sides", () => {
	const node = {
		...INITIAL_PLAN.nodes[0],
		data: {
			appearance: "tinted",
			detail: "Work",
			kind: "worker",
			label: "Lambda",
			service: "lambda",
		},
		id: "lambda",
	};
	const edge = {
		id: "invoke",
		source: "api",
		sourceHandle: "bottom",
		target: "lambda",
		targetHandle: "top",
	};
	const next = addToPlan(INITIAL_PLAN, { edges: [edge], nodes: [node] });
	expect(planSchema.parse(next).nodes.at(-1)?.data).toEqual(node.data);
	expect(next.edges.at(-1)).toEqual(edge);
	expect(() =>
		addToPlan(INITIAL_PLAN, {
			edges: [{ ...edge, targetHandle: "invalid" }],
			nodes: [node],
		})
	).toThrow();
	expect(INITIAL_PLAN.nodes).toHaveLength(3);
});

test("partial updates preserve node data, positions, and IDs while allowing reconnection and icon resets", () => {
	const icon = {
		color: "#f80",
		label: "Lambda",
		slug: "aws-aws-lambda",
		variant: "default",
	};
	const updated = updatePlan(INITIAL_PLAN, {
		edges: [
			{
				id: "app-api",
				label: "invoke",
				target: "database",
				targetHandle: "top",
			},
		],
		nodes: [
			{
				data: { appearance: "tinted", icon, label: "Lambda" },
				id: "api",
				position: { y: 240 },
			},
		],
	});
	expect(updated.nodes[1].data).toMatchObject({
		...INITIAL_PLAN.nodes[1].data,
		appearance: "tinted",
		icon,
		label: "Lambda",
	});
	expect(updated.nodes[1].position).toEqual({ x: 320, y: 240 });
	expect(updated.nodes[1].data.aiReveal).toBeUndefined();
	expect(updated.nodes[0]).toBe(INITIAL_PLAN.nodes[0]);
	expect(updated.edges[0]).toEqual({
		...INITIAL_PLAN.edges[0],
		label: "invoke",
		target: "database",
		targetHandle: "top",
	});
	const service = updatePlan(updated, {
		nodes: [{ data: { icon: null, service: "lambda" }, id: "api" }],
	});
	expect(service.nodes[1].data.icon).toBeUndefined();
	expect(service.nodes[1].data.service).toBe("lambda");
	const cleared = updatePlan(service, {
		nodes: [{ data: { service: null }, id: "api" }],
	});
	expect(cleared.nodes[1].data.service).toBeUndefined();
	expect(
		planSchema.parse(JSON.parse(JSON.stringify(cleared))).nodes[1].data
	).toEqual({
		...INITIAL_PLAN.nodes[1].data,
		appearance: "tinted",
		label: "Lambda",
	});
	expect(INITIAL_PLAN.nodes[1].data.label).toBe("API");
});

test("invalid update batches preserve the whole canvas", () => {
	const before = JSON.stringify(INITIAL_PLAN);
	const validPatch = { data: { label: "Changed" }, id: "app" };
	for (const input of [
		{ nodes: [validPatch, { id: "missing" }] },
		{ nodes: [validPatch, validPatch] },
		{ edges: [{ id: "app-api", target: "missing" }], nodes: [validPatch] },
		{ edges: [{ id: "missing", label: "Changed" }], nodes: [validPatch] },
		{ nodes: [{ id: "api", position: { x: Number.POSITIVE_INFINITY } }] },
		{ nodes: [{ data: { label: "" }, id: "api" }] },
		{ nodes: [{ data: { appearance: "invalid" }, id: "api" }] },
		{ nodes: [{ data: { icon: { slug: "../secret" } }, id: "api" }] },
		{ nodes: [{ id: "api", label: "Wrong field" }] },
		{ edges: [{ id: "app-api" }, { id: "app-api" }] },
	]) {
		expect(() => updatePlan(INITIAL_PLAN, input)).toThrow();
		expect(JSON.stringify(INITIAL_PLAN)).toBe(before);
	}
});

test("removals cascade attached connections and reject invalid batches without data loss", () => {
	const before = JSON.stringify(INITIAL_PLAN);
	const removed = removeFromPlan(INITIAL_PLAN, { nodeIds: ["api"] });
	expect(removed.nodes.map((node) => node.id)).toEqual(["app", "database"]);
	expect(removed.edges).toEqual([]);
	expect(removed.nodes[0]).toBe(INITIAL_PLAN.nodes[0]);
	const edgeOnly = removeFromPlan(INITIAL_PLAN, { edgeIds: ["app-api"] });
	expect(edgeOnly.nodes).toEqual(INITIAL_PLAN.nodes);
	expect(edgeOnly.edges.map((edge) => edge.id)).toEqual(["api-database"]);
	expect(
		removeFromPlan(INITIAL_PLAN, {
			edgeIds: ["api-database"],
			nodeIds: ["app"],
		}).edges
	).toEqual([]);
	for (const input of [
		{ nodeIds: ["api", "missing"] },
		{ edgeIds: ["missing"], nodeIds: ["api"] },
		{ nodeIds: ["api", "api"] },
		{ edgeIds: ["app-api", "app-api"] },
		{ nodes: ["api"] },
	]) {
		expect(() => removeFromPlan(INITIAL_PLAN, input)).toThrow();
		expect(JSON.stringify(INITIAL_PLAN)).toBe(before);
	}
});

test("WebMCP handlers edit the current state atomically and stop after disconnect", async () => {
	let plan = INITIAL_PLAN;
	const registered: Parameters<ModelContext["registerTool"]>[0][] = [];
	const controller = new AbortController();
	const context: ModelContext = {
		registerTool: (tool) => {
			registered.push(tool);
			return Promise.resolve();
		},
	};
	await registerPlanTools(
		context,
		controller,
		() => plan,
		(change) => {
			plan = change(plan);
			return plan;
		}
	);
	const [read, add, update, remove] = registered;
	expect(registered.map((tool) => tool.name)).toEqual([
		"plan_read",
		"plan_add",
		"plan_update",
		"plan_remove",
		"plan_search_icons",
	]);
	expect(
		JSON.parse(
			await add.execute({
				edges: [{ id: "invalid", source: "app", target: "missing" }],
			})
		).ok
	).toBe(false);
	expect(
		JSON.parse(
			await add.execute({
				edges: [{ id: "direct", source: "app", target: "database" }],
			})
		).ok
	).toBe(true);
	expect(JSON.parse(await read.execute({})).data.plan.edges).toHaveLength(3);
	expect(update.annotations.readOnlyHint).toBe(false);
	expect(remove.annotations.readOnlyHint).toBe(false);
	expect(
		JSON.parse(
			await update.execute({
				nodes: [{ data: { label: "Backend" }, id: "api" }],
			})
		).ok
	).toBe(true);
	expect(JSON.parse(await read.execute({})).data.plan.nodes[1].data.label).toBe(
		"Backend"
	);
	const beforeFailure = plan;
	expect(
		JSON.parse(
			await update.execute({ edges: [{ id: "direct", target: "missing" }] })
		).ok
	).toBe(false);
	expect(
		JSON.parse(await remove.execute({ nodeIds: ["api", "missing"] })).ok
	).toBe(false);
	expect(plan).toBe(beforeFailure);
	expect(JSON.parse(await remove.execute({ nodeIds: ["api"] })).ok).toBe(true);
	expect(plan.edges.map((edge) => edge.id)).toEqual(["direct"]);
	expect(JSON.parse(await read.execute({})).data.plan.nodes).toHaveLength(2);
	const beforeAbort = plan;
	controller.abort();
	expect(JSON.parse(await add.execute({})).ok).toBe(false);
	expect(
		JSON.parse(
			await update.execute({
				nodes: [{ data: { label: "Aborted" }, id: "app" }],
			})
		).ok
	).toBe(false);
	expect(JSON.parse(await remove.execute({ nodeIds: ["app"] })).ok).toBe(false);
	expect(plan).toBe(beforeAbort);
});

test("partial WebMCP registration failure cleans up registered tools", async () => {
	const controller = new AbortController();
	const context: ModelContext = {
		registerTool: (tool) => {
			if (tool.name === "plan_add") {
				return Promise.reject(new Error("Registration failed"));
			}
			return Promise.resolve();
		},
	};
	await expect(
		registerPlanTools(
			context,
			controller,
			() => INITIAL_PLAN,
			() => INITIAL_PLAN
		)
	).rejects.toThrow("Registration failed");
	expect(controller.signal.aborted).toBe(true);
});
