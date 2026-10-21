import { type Ref, useCallback, useEffect, useRef, useState } from "react";

// Base UI's visual state must also reset when the browser resets its hidden inputs.
export function useControlValue<
	Value,
	Details extends { isCanceled: boolean },
>({
	value,
	defaultValue,
	onChange,
	inputRef: externalRef,
	form,
}: {
	defaultValue: Value;
	form?: string;
	inputRef?: Ref<HTMLInputElement>;
	onChange?: (value: Value, details: Details) => void;
	value?: Value;
}) {
	const [internal, setInternal] = useState(defaultValue);
	const [resetKey, setResetKey] = useState(0);
	const input = useRef<HTMLInputElement | null>(null);
	const uncontrolled = value === undefined;
	const inputRef = useCallback(
		(element: HTMLInputElement | null) => {
			input.current = element;
			const cleanup =
				typeof externalRef === "function" ? externalRef(element) : undefined;
			if (externalRef && typeof externalRef !== "function") {
				externalRef.current = element;
			}
			return () => {
				input.current = null;
				if (typeof cleanup === "function") {
					cleanup();
				} else if (typeof externalRef === "function") {
					externalRef(null);
				} else if (externalRef) {
					externalRef.current = null;
				}
			};
		},
		[externalRef]
	);
	useEffect(() => {
		const owner = input.current?.form;
		if (!owner || (form !== undefined && owner.id !== form)) {
			return;
		}
		let mounted = true;
		const reset = (event: Event) => {
			queueMicrotask(() => {
				if (mounted && !event.defaultPrevented) {
					if (uncontrolled) {
						setInternal(defaultValue);
					}
					setResetKey((before) => before + 1);
				}
			});
		};
		owner.addEventListener("reset", reset);
		return () => {
			mounted = false;
			owner.removeEventListener("reset", reset);
		};
	}, [uncontrolled, defaultValue, form]);
	const change = useCallback(
		(next: Value, details: Details) => {
			onChange?.(next, details);
			if (uncontrolled && !details.isCanceled) {
				setInternal(next);
			}
		},
		[onChange, uncontrolled]
	);
	return {
		change,
		input,
		inputRef,
		resetKey,
		value: uncontrolled ? internal : value,
	};
}
