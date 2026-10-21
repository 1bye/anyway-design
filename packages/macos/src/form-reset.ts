export function observeFormReset(owner: EventTarget, onReset: () => void) {
	let mounted = true;
	const reset = (event: Event) => {
		// React's delegated onReset can cancel after the native listener returns.
		setTimeout(() => {
			if (mounted && !event.defaultPrevented) {
				onReset();
			}
		}, 0);
	};
	owner.addEventListener("reset", reset);
	return () => {
		mounted = false;
		owner.removeEventListener("reset", reset);
	};
}
