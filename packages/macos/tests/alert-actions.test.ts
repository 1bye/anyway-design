import { describe, expect, test } from "bun:test";
import { enabledAlertAction, orderedAlertActions } from "../src/alert-actions";

const actions = [
	{ id: "save", label: "Save" },
	{ id: "cancel", label: "Cancel" },
	{ destructive: true, id: "discard", label: "Don’t Save" },
];

describe("alert actions", () => {
	test("three actions place the default first and cancel last without mutating caller order", () => {
		expect(
			orderedAlertActions(actions, "save", "cancel").map((action) => action.id)
		).toEqual(["save", "discard", "cancel"]);
		expect(actions.map((action) => action.id)).toEqual([
			"save",
			"cancel",
			"discard",
		]);
	});
	test("two actions put cancel on the left, even when it is the default", () => {
		expect(
			orderedAlertActions(actions.slice(0, 2), "save", "cancel").map(
				(action) => action.id
			)
		).toEqual(["cancel", "save"]);
		expect(
			orderedAlertActions([actions[2], actions[1]], "cancel", "cancel").map(
				(action) => action.id
			)
		).toEqual(["cancel", "discard"]);
	});
	test("missing or disabled shortcuts never fall through to a destructive action", () => {
		const disabled = [{ ...actions[0], disabled: true }, actions[2]];
		expect(enabledAlertAction(disabled, "save")).toBeUndefined();
		expect(enabledAlertAction(disabled, "cancel")).toBeUndefined();
		expect(enabledAlertAction(disabled)).toBeUndefined();
		expect(enabledAlertAction(disabled, "discard")?.id).toBe("discard");
	});
});
