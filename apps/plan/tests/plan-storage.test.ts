import { expect, test } from "bun:test";
import { addToPlan, INITIAL_PLAN, planSchema } from "../src/lib/plan";
import {
	DRAFT_KEY,
	deleteSavedPlan,
	readDraft,
	readSavedPlans,
	SAVED_PLANS_KEY,
	savePlan,
	writeDraft,
} from "../src/lib/plan-storage";

function memoryStorage() {
	const entries = new Map<string, string>();
	return {
		getItem: (key: string) => entries.get(key) ?? null,
		setItem: (key: string, value: string) => {
			entries.set(key, value);
		},
	};
}

test("legacy drafts reopen unchanged and migrate with saved-plan identity", () => {
	const storage = memoryStorage();
	const legacy = JSON.stringify(INITIAL_PLAN);
	storage.setItem(DRAFT_KEY, legacy);
	expect(readDraft(storage)).toEqual({ plan: INITIAL_PLAN, savedPlanId: null });
	expect(storage.getItem(DRAFT_KEY)).toBe(legacy);
	writeDraft(storage, INITIAL_PLAN, "saved-1");
	expect(readDraft(storage)).toEqual({
		plan: INITIAL_PLAN,
		savedPlanId: "saved-1",
	});
});

test("named snapshots update independently, copy, reopen, and delete without removing the draft", () => {
	const storage = memoryStorage();
	const animated = addToPlan(INITIAL_PLAN, {
		nodes: [{ ...INITIAL_PLAN.nodes[0], id: "copy" }],
	});
	const first = savePlan(storage, animated);
	expect(first.plan).toEqual(planSchema.parse(animated));
	expect(first.plan.nodes.at(-1)?.data).not.toHaveProperty("aiReveal");
	writeDraft(storage, animated, first.id);
	const draft = storage.getItem(DRAFT_KEY);
	const second = savePlan(storage, { ...INITIAL_PLAN, name: "Second plan" });
	const updated = savePlan(
		storage,
		{ ...INITIAL_PLAN, name: "Renamed plan" },
		first.id
	);
	expect(updated.id).toBe(first.id);
	expect(readSavedPlans(storage).map((entry) => entry.plan.name)).toEqual([
		"Renamed plan",
		"Second plan",
	]);
	expect(
		readSavedPlans(storage).find((entry) => entry.id === second.id)
	).toEqual(second);
	const copy = savePlan(storage, updated.plan);
	expect(copy.id).not.toBe(updated.id);
	expect(copy.plan).toEqual(updated.plan);
	deleteSavedPlan(storage, first.id);
	expect(readSavedPlans(storage).map((entry) => entry.id)).toEqual([
		copy.id,
		second.id,
	]);
	expect(storage.getItem(DRAFT_KEY)).toBe(draft);
});

test("corrupt storage, invalid plans, and quota failures preserve existing saved data", () => {
	const storage = memoryStorage();
	savePlan(storage, INITIAL_PLAN);
	const original = storage.getItem(SAVED_PLANS_KEY);
	expect(() => savePlan(storage, { ...INITIAL_PLAN, name: "" })).toThrow();
	expect(storage.getItem(SAVED_PLANS_KEY)).toBe(original);
	const full = {
		getItem: storage.getItem,
		setItem: () => {
			throw new Error("Quota exceeded");
		},
	};
	expect(() => savePlan(full, INITIAL_PLAN)).toThrow("Quota exceeded");
	expect(storage.getItem(SAVED_PLANS_KEY)).toBe(original);
	storage.setItem(SAVED_PLANS_KEY, "corrupt");
	expect(() => savePlan(storage, INITIAL_PLAN)).toThrow();
	expect(() => deleteSavedPlan(storage, "anything")).toThrow();
	expect(storage.getItem(SAVED_PLANS_KEY)).toBe("corrupt");
});
