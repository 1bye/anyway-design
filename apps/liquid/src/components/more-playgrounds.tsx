import { Slider as DialSlider } from "dialkit";
import { RotateCcw } from "lucide-react";
import { type ChangeEvent, useCallback, useState } from "react";
import { ExamplePreview } from "./example-preview";
import ContextMenuExample from "./examples/context-menu";
import contextSource from "./examples/context-menu?raw";
import NestedMenuExample from "./examples/nested-menu";
import nestedSource from "./examples/nested-menu?raw";
import ShortcutPreviewExample from "./examples/shortcut-preview";
import shortcutSource from "./examples/shortcut-preview?raw";
import StackedMenuExample from "./examples/stacked-menu";
import stackedSource from "./examples/stacked-menu?raw";
import {
	LIQUID_MENU_GEOMETRY,
	LIQUID_MENU_MOTION,
} from "./liquid/liquid-menu-config";
import { LiquidProvider } from "./liquid/liquid-provider";
import type { ShortcutSide } from "./liquid/liquid-shortcut";

const examples = [
	{
		component: ShortcutPreviewExample,
		description:
			"Hold Command on Mac or Control on Windows to reveal available actions.",
		id: "shortcuts",
		source: shortcutSource,
		title: "Shortcut preview",
	},
	{
		component: NestedMenuExample,
		description:
			"Follow Design → Liquid → Components. Use arrow keys to explore each level.",
		id: "nested-menus",
		source: nestedSource,
		title: "Nested submenus",
	},
	{
		component: StackedMenuExample,
		description:
			"Open Project, then Manage access. Escape returns to the surface underneath.",
		id: "stacked-menus",
		source: stackedSource,
		title: "Stacked menus",
	},
	{
		component: ContextMenuExample,
		description:
			"Right-click the idea, or focus it and press Shift + F10. Long-press works on touchscreens.",
		id: "context-menu",
		source: contextSource,
		title: "Context menu",
	},
];

function ComponentPlayground({
	example,
}: {
	example: (typeof examples)[number];
}) {
	const { id, title, description, component: Component, source } = example;
	const [softness, setSoftness] = useState(LIQUID_MENU_GEOMETRY.blendRadius);
	const [radius, setRadius] = useState(LIQUID_MENU_GEOMETRY.menuRadius);
	const [duration, setDuration] = useState(LIQUID_MENU_MOTION.openDurationMs);
	const [dim, setDim] = useState(LIQUID_MENU_MOTION.backdropOpacity);
	const [side, setSide] = useState<ShortcutSide>("top");
	const [offset, setOffset] = useState(8);
	const [delay, setDelay] = useState(300);
	const isShortcut = id === "shortcuts";
	const hasDim = id === "stacked-menus" || id === "context-menu";
	const changeSide = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
		const { value } = event.target;
		if (
			value === "top" ||
			value === "bottom" ||
			value === "left" ||
			value === "right"
		) {
			setSide(value);
		}
	}, []);
	const reset = useCallback(() => {
		setSoftness(LIQUID_MENU_GEOMETRY.blendRadius);
		setRadius(LIQUID_MENU_GEOMETRY.menuRadius);
		setDuration(LIQUID_MENU_MOTION.openDurationMs);
		setDim(LIQUID_MENU_MOTION.backdropOpacity);
		setSide("top");
		setOffset(8);
		setDelay(300);
	}, []);
	const code = (
		isShortcut
			? source
					.replace('side = "top"', `side = "${side}"`)
					.replace("offset = 8", `offset = ${offset}`)
					.replace("delay = 300", `delay = ${delay}`)
			: source.replace(
					"<LiquidProvider>",
					`<LiquidProvider softness={${softness}} radius={${radius}} duration={${duration}}${hasDim ? ` dim={${dim}}` : ""}>`
				)
	).replaceAll('"../liquid/', '"./components/liquid/');
	return (
		<section
			aria-labelledby={`${id}-title`}
			className="component-example"
			id={id}
		>
			<ExamplePreview
				code={code}
				controls={
					<div className="surface-controls">
						<div className="controls-heading">
							<h2>{title}</h2>
							<button
								aria-label={`Reset ${title} controls`}
								className="reset-button"
								onClick={reset}
								type="button"
							>
								<RotateCcw aria-hidden="true" size={15} />
							</button>
						</div>
						<div className="dial-controls">
							{isShortcut ? (
								<>
									<label className="control-select">
										Position
										<select onChange={changeSide} value={side}>
											<option value="top">Top</option>
											<option value="bottom">Bottom</option>
											<option value="left">Left</option>
											<option value="right">Right</option>
										</select>
									</label>
									<DialSlider
										label="Spacing"
										max={32}
										min={4}
										onChange={setOffset}
										step={1}
										unit="px"
										value={offset}
									/>
									<DialSlider
										label="Reveal delay"
										max={800}
										min={0}
										onChange={setDelay}
										step={50}
										unit="ms"
										value={delay}
									/>
								</>
							) : (
								<>
									<DialSlider
										label="Softness"
										max={64}
										min={0}
										onChange={setSoftness}
										step={2}
										unit="px"
										value={softness}
									/>
									<DialSlider
										label="Corner radius"
										max={28}
										min={4}
										onChange={setRadius}
										step={1}
										unit="px"
										value={radius}
									/>
									<DialSlider
										label="Duration"
										max={600}
										min={100}
										onChange={setDuration}
										step={20}
										unit="ms"
										value={duration}
									/>
									{!!hasDim && (
										<DialSlider
											label="Background dim"
											max={0.5}
											min={0}
											onChange={setDim}
											step={0.01}
											value={dim}
										/>
									)}
								</>
							)}
						</div>
					</div>
				}
				heading={
					<header className="example-heading">
						<h2 id={`${id}-title`}>{title}</h2>
						<p>{description}</p>
					</header>
				}
				name={title}
				variants={null}
			>
				<LiquidProvider
					dim={hasDim ? dim : 0}
					duration={duration}
					radius={radius}
					softness={softness}
				>
					<div className="preview-stage simple-preview">
						{isShortcut ? (
							<ShortcutPreviewExample
								delay={delay}
								offset={offset}
								side={side}
							/>
						) : (
							<Component />
						)}
					</div>
				</LiquidProvider>
			</ExamplePreview>
		</section>
	);
}

export function MorePlaygrounds() {
	return examples.map((example) => (
		<ComponentPlayground example={example} key={example.id} />
	));
}
