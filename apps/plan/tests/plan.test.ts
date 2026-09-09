import { expect, test } from "bun:test";
import { addToPlan, INITIAL_PLAN, planSchema } from "../src/lib/plan";
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

test("WebMCP handlers validate additions, read current state, and stop after disconnect", async () => {
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
		(input) => {
			plan = addToPlan(plan, input);
			return plan;
		}
	);
	const [read, add] = registered;
	expect(registered.map((tool) => tool.name)).toEqual([
		"plan_read",
		"plan_add",
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
	controller.abort();
	expect(JSON.parse(await add.execute({})).ok).toBe(false);
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
