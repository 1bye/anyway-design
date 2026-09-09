import { useEffect, useRef, useState } from "react";

interface TurnstileApi {
	remove: (id: string) => void;
	render: (
		element: HTMLElement,
		options: {
			sitekey: string;
			callback: (token: string) => void;
			"expired-callback": () => void;
			"error-callback": () => void;
			theme: string;
		}
	) => string;
}
declare global {
	interface Window {
		turnstile?: TurnstileApi;
	}
}

export function Turnstile({
	siteKey,
	onToken,
}: {
	siteKey: string;
	onToken: (token: string) => void;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const [failed, setFailed] = useState(false);
	useEffect(() => {
		let widget: string | undefined;
		const existing = document.querySelector<HTMLScriptElement>(
			"script[data-md-turnstile]"
		);
		const script = existing ?? document.createElement("script");
		function render() {
			// biome-ignore lint/suspicious/noUnnecessaryConditions: React populates this ref after mounting; the SDK loads asynchronously.
			if (!(ref.current && window.turnstile)) {
				return;
			}
			widget = window.turnstile.render(ref.current, {
				callback: onToken,
				"error-callback": () => {
					onToken("");
					setFailed(true);
				},
				"expired-callback": () => onToken(""),
				sitekey: siteKey,
				theme: "light",
			});
		}
		const fail = () => setFailed(true);
		if (window.turnstile) {
			render();
		} else {
			script.addEventListener("load", render);
			script.addEventListener("error", fail);
		}
		if (!existing) {
			script.src =
				"https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
			script.async = true;
			script.dataset.mdTurnstile = "true";
			document.head.appendChild(script);
		}
		return () => {
			script.removeEventListener("load", render);
			script.removeEventListener("error", fail);
			if (widget) {
				window.turnstile?.remove(widget);
			}
		};
	}, [siteKey, onToken]);
	return (
		<>
			<div ref={ref} />
			{failed ? (
				<p role="alert">
					Verification could not load. Reopen this dialog to try again.
				</p>
			) : null}
		</>
	);
}
