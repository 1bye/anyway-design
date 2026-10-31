import { Check, Copy } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const statusLabels = { copied: "Copied", error: "Couldn’t copy", idle: "Copy" };

export function CopyButton({
	text,
	label = "Copy code",
}: {
	text: string;
	label?: string;
}) {
	const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
	const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
	useEffect(
		() => () => {
			if (timer.current !== null) {
				clearTimeout(timer.current);
			}
		},
		[]
	);

	const copy = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(text);
			setStatus("copied");
		} catch {
			setStatus("error");
		}
		if (timer.current !== null) {
			clearTimeout(timer.current);
		}
		timer.current = setTimeout(() => setStatus("idle"), 2500);
	}, [text]);

	return (
		<button
			aria-label={label}
			className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs hover:bg-fd-accent"
			onClick={copy}
			type="button"
		>
			{status === "copied" ? (
				<Check aria-hidden="true" size={14} />
			) : (
				<Copy aria-hidden="true" size={14} />
			)}
			<span aria-live="polite">{statusLabels[status]}</span>
		</button>
	);
}
