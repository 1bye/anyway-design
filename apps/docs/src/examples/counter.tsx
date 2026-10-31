import { useCallback, useState } from "react";

export function CounterExample() {
	const [count, setCount] = useState(0);
	const increment = useCallback(() => setCount((value) => value + 1), []);
	return (
		<button
			className="min-h-11 rounded-full bg-fd-primary px-5 py-2.5 text-fd-primary-foreground text-sm"
			onClick={increment}
			type="button"
		>
			Clicked {count} {count === 1 ? "time" : "times"}
		</button>
	);
}
