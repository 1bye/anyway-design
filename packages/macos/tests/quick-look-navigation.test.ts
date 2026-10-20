import { expect, test } from "bun:test";
import { requestFilePreview } from "../src/file-interactions";
import { quickLookNeighbor } from "../src/quick-look-navigation";

test("Quick Look skips disabled files and clamps at each endpoint", () => {
	const items = [{ id: "a" }, { disabled: true, id: "offline" }, { id: "b" }];
	expect(quickLookNeighbor(items, "a", 1)?.id).toBe("b");
	expect(quickLookNeighbor(items, "b", -1)?.id).toBe("a");
	expect(quickLookNeighbor(items, "b", 1)?.id).toBe("b");
	expect(quickLookNeighbor(items, "a", -1)?.id).toBe("a");
	expect(items.map((item) => item.id)).toEqual(["a", "offline", "b"]);
});

test("Quick Look recovers a removed selection and tolerates no enabled files", () => {
	expect(quickLookNeighbor([{ id: "remaining" }], "removed", 0)?.id).toBe(
		"remaining"
	);
	expect(
		quickLookNeighbor([{ disabled: true, id: "disabled" }], "disabled", 0)
	).toBeUndefined();
	expect(quickLookNeighbor([], "missing", 1)).toBeUndefined();
});

test("Space preview leaves modified keys alone and ignores held-key repeats", () => {
	let opened = 0;
	let prevented = 0;
	const event = {
		altKey: false,
		ctrlKey: false,
		key: " ",
		metaKey: false,
		preventDefault: () => {
			prevented += 1;
		},
		repeat: false,
		shiftKey: false,
	};
	const preview = (id: string) => {
		expect(id).toBe("file");
		opened += 1;
	};
	expect(requestFilePreview(event, "file")).toBe(false);
	expect(
		requestFilePreview({ ...event, shiftKey: true }, "file", preview)
	).toBe(false);
	expect(requestFilePreview({ ...event, key: "Enter" }, "file", preview)).toBe(
		false
	);
	expect(requestFilePreview(event, "file", preview)).toBe(true);
	expect(requestFilePreview({ ...event, repeat: true }, "file", preview)).toBe(
		true
	);
	expect(opened).toBe(1);
	expect(prevented).toBe(2);
});
