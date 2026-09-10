import { z } from "zod";
import { type Plan, planSchema } from "./plan";

export const DRAFT_KEY = "anyway-plan:v1";
export const SAVED_PLANS_KEY = "anyway-plan:saved:v1";
type PlanStorage = Pick<Storage, "getItem" | "setItem">;
const draftSchema = z.object({
	plan: planSchema,
	savedPlanId: z.string().nullable(),
});
const savedPlanSchema = z.object({
	id: z.string().min(1),
	plan: planSchema,
	updatedAt: z.number().int().nonnegative(),
});
export type SavedPlan = z.infer<typeof savedPlanSchema>;

export function readDraft(storage: PlanStorage) {
	const raw = storage.getItem(DRAFT_KEY);
	if (!raw) {
		return null;
	}
	const value: unknown = JSON.parse(raw);
	const draft = draftSchema.safeParse(value);
	return draft.success
		? draft.data
		: { plan: planSchema.parse(value), savedPlanId: null };
}

export function writeDraft(
	storage: PlanStorage,
	plan: Plan,
	savedPlanId: string | null
) {
	storage.setItem(
		DRAFT_KEY,
		JSON.stringify(draftSchema.parse({ plan, savedPlanId }))
	);
}

export function readSavedPlans(storage: PlanStorage): SavedPlan[] {
	const raw = storage.getItem(SAVED_PLANS_KEY);
	return raw
		? z
				.array(savedPlanSchema)
				.parse(JSON.parse(raw))
				.sort((a, b) => b.updatedAt - a.updatedAt)
		: [];
}

export function savePlan(
	storage: PlanStorage,
	plan: Plan,
	id?: string
): SavedPlan {
	const plans = readSavedPlans(storage);
	const saved = savedPlanSchema.parse({
		id: id ?? crypto.randomUUID(),
		plan,
		updatedAt: Date.now(),
	});
	storage.setItem(
		SAVED_PLANS_KEY,
		JSON.stringify([saved, ...plans.filter((entry) => entry.id !== saved.id)])
	);
	return saved;
}

export function deleteSavedPlan(storage: PlanStorage, id: string) {
	const plans = readSavedPlans(storage).filter((entry) => entry.id !== id);
	storage.setItem(SAVED_PLANS_KEY, JSON.stringify(plans));
}

export function exportPlan(plan: Plan) {
	const portable = planSchema.parse(plan);
	const url = URL.createObjectURL(
		new Blob([JSON.stringify(portable, null, 2)], { type: "application/json" })
	);
	const link = document.createElement("a");
	link.href = url;
	link.download = `${portable.name.replace(/[^\p{L}\p{N} _-]/gu, "").trim() || "canvas"}.plan.json`;
	link.click();
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}
