import { expect, test } from "bun:test";
import { observeFormReset } from "../src/form-reset";

const nextTask = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

test("form reset waits for delegated cancellation beyond a native-listener microtask", async () => {
	const form = new EventTarget();
	let resets = 0;
	const stop = observeFormReset(form, () => {
		resets += 1;
	});
	const event = new Event("reset", { cancelable: true });
	form.dispatchEvent(event);
	// Browsers may run a microtask before React's delegated reset handler.
	await Promise.resolve();
	event.preventDefault();
	await nextTask();
	expect(resets).toBe(0);
	form.dispatchEvent(new Event("reset", { cancelable: true }));
	await nextTask();
	expect(resets).toBe(1);
	stop();
});

test("removing a reset observer cancels pending work and future notifications", async () => {
	const form = new EventTarget();
	let resets = 0;
	const stop = observeFormReset(form, () => {
		resets += 1;
	});
	form.dispatchEvent(new Event("reset"));
	stop();
	await nextTask();
	form.dispatchEvent(new Event("reset"));
	await nextTask();
	expect(resets).toBe(0);
});
