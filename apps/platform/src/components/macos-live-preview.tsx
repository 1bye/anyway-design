import {
	PLAYGROUND_ENVIRONMENT,
	type PlaygroundEntry,
	type PlaygroundEnvironment,
	type PlaygroundValues,
	playgroundDefaults,
} from "macos-lab/catalog";
import { lazy, Suspense, useEffect, useRef, useState } from "react";

const ComponentPreview = lazy(() =>
	import("macos-lab/preview").then((module) => ({
		default: module.ComponentPreview,
	}))
);
const ignoreEvent = () => undefined;

export function MacosLivePreview({
	entry,
	compact = false,
	environment = PLAYGROUND_ENVIRONMENT,
	values,
	revision = 0,
	onEvent = ignoreEvent,
	onPropertyChange = ignoreEvent,
}: {
	entry: PlaygroundEntry;
	compact?: boolean;
	environment?: PlaygroundEnvironment;
	values?: PlaygroundValues;
	revision?: number;
	onEvent?: (message: string) => void;
	onPropertyChange?: (key: string, value: string | number | boolean) => void;
}) {
	const host = useRef<HTMLElement>(null);
	const [visible, setVisible] = useState(false);
	useEffect(() => {
		if (!compact) {
			setVisible(true);
			return;
		}
		const node = host.current;
		// biome-ignore lint/suspicious/noUnnecessaryConditions: Refs are nullable during mount and teardown.
		if (!node) {
			return;
		}
		// Only mount nearby thumbnails; desktop examples own observers and listeners.
		const observer = new IntersectionObserver(
			([observation]) => setVisible(observation.isIntersecting),
			{ rootMargin: "160px" }
		);
		observer.observe(node);
		return () => observer.disconnect();
	}, [compact]);
	const fallback = (
		<div className="platform-preview-placeholder" role="status">
			Loading preview…
		</div>
	);
	return (
		<section
			aria-label={`${entry.title} ${compact ? "preview" : "interactive preview"}`}
			className={
				compact ? "platform-component-thumbnail" : "platform-component-preview"
			}
			data-component-preview=""
			ref={host}
			role={compact ? "img" : undefined}
		>
			<div aria-hidden={compact || undefined} inert={compact}>
				{visible ? (
					<Suspense fallback={fallback}>
						<ComponentPreview
							background="auto"
							canvasHeight={
								compact &&
								(entry.group === "Form controls" || entry.group === "Feedback")
									? 200
									: entry.height
							}
							canvasWidth={
								compact &&
								(entry.group === "Form controls" || entry.group === "Feedback")
									? 400
									: entry.width
							}
							entry={entry}
							environment={
								compact ? { ...environment, reduceMotion: true } : environment
							}
							maxHeight={compact ? 200 : undefined}
							onEvent={onEvent}
							onPropertyChange={onPropertyChange}
							revision={revision}
							values={values ?? playgroundDefaults(entry)}
							zoom="fit"
						/>
					</Suspense>
				) : (
					fallback
				)}
			</div>
		</section>
	);
}
