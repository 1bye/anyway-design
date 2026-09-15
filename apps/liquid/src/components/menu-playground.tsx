import { Slider as DialSlider } from "dialkit";
import {
	Archive,
	Check,
	ChevronDown,
	ChevronRight,
	Copy,
	Folder,
	FolderInput,
	MoreHorizontal,
	RotateCcw,
	Star,
} from "lucide-react";
import {
	type ChangeEvent,
	type MouseEvent,
	useCallback,
	useMemo,
	useRef,
	useState,
} from "react";
import { createExampleCode } from "./example-code";
import { ExampleNav } from "./example-nav";
import { ExamplePreview } from "./example-preview";
import {
	LiquidMenu,
	LiquidMenuContent,
	LiquidMenuItem,
	type LiquidMenuProps,
	LiquidMenuSeparator,
	LiquidMenuSub,
	LiquidMenuSubContent,
	LiquidMenuSubTrigger,
	LiquidMenuTrigger,
} from "./liquid/liquid-menu";
import {
	LIQUID_MENU_GEOMETRY,
	LIQUID_MENU_MOTION,
} from "./liquid/liquid-menu-config";
import { LiquidProvider } from "./liquid/liquid-provider";
import { MorePlaygrounds } from "./more-playgrounds";
import { PlaygroundControlsProvider } from "./playground-controls";

type ExampleSettings = Pick<
	LiquidMenuProps,
	"geometry" | "motion" | "onOpenChange"
>;

function ActionMenuExample(settings: ExampleSettings) {
	const [saved, setSaved] = useState(false);
	const [copies, setCopies] = useState(0);
	const duplicate = useCallback(() => {
		setCopies((count) => count + 1);
	}, []);
	const save = useCallback(() => setSaved((value) => !value), []);
	return (
		<div className="preview-stage simple-preview">
			<LiquidMenu {...settings} modal={false}>
				<LiquidMenuTrigger>
					Actions
					<ChevronDown aria-hidden="true" size={14} />
				</LiquidMenuTrigger>
				<LiquidMenuContent className="demo-menu">
					<LiquidMenuItem onClick={duplicate}>
						<Copy aria-hidden="true" />
						{copies > 0 ? `Duplicate (${copies})` : "Duplicate"}
					</LiquidMenuItem>
					<LiquidMenuItem onClick={save}>
						<Star aria-hidden="true" />
						{saved ? "Saved" : "Save for later"}
					</LiquidMenuItem>
				</LiquidMenuContent>
			</LiquidMenu>
		</div>
	);
}

const STATUS_OPTIONS = ["To do", "In progress", "Done"] as const;

function StatusMenuExample(settings: ExampleSettings) {
	const [status, setStatus] = useState("In progress");
	const changeStatus = useCallback((event: MouseEvent<HTMLElement>) => {
		const nextStatus = event.currentTarget.dataset.status;
		if (nextStatus) {
			setStatus(nextStatus);
		}
	}, []);
	return (
		<div className="preview-stage simple-preview">
			<LiquidMenu {...settings} modal={false}>
				<LiquidMenuTrigger aria-label={`Change status: ${status}`}>
					<span aria-hidden="true" className="status-dot" />
					{status}
					<ChevronDown aria-hidden="true" size={14} />
				</LiquidMenuTrigger>
				<LiquidMenuContent className="demo-menu">
					{STATUS_OPTIONS.map((option) => (
						<LiquidMenuItem
							data-status={option}
							key={option}
							onClick={changeStatus}
						>
							{option}
							{status === option && (
								<Check aria-hidden="true" className="item-trailing" />
							)}
						</LiquidMenuItem>
					))}
				</LiquidMenuContent>
			</LiquidMenu>
		</div>
	);
}

const VARIANTS = [
	{ label: "Connected", value: "connected" },
	{ label: "Action", value: "action" },
	{ label: "Status", value: "status" },
] as const;
type Variant = (typeof VARIANTS)[number]["value"];

export function MenuPlayground() {
	const [active, setActive] = useState("Menu");
	const changeActive = useCallback((id: string) => {
		const names: Record<string, string> = {
			"connected-menu": "Menu",
			"context-menu": "Context menu",
			"nested-menus": "Nested submenus",
			shortcuts: "Shortcut preview",
			"stacked-menus": "Stacked menus",
		};
		setActive(names[id] ?? "Menu");
	}, []);
	const [variant, setVariant] = useState<Variant>("connected");
	const changeVariant = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		const next = VARIANTS.find((item) => item.value === event.target.value);
		if (next) {
			setVariant(next.value);
		}
	}, []);
	const [softness, setSoftness] = useState(LIQUID_MENU_GEOMETRY.blendRadius);
	const [radius, setRadius] = useState(LIQUID_MENU_GEOMETRY.menuRadius);
	const [duration, setDuration] = useState(LIQUID_MENU_MOTION.openDurationMs);
	const [folder, setFolder] = useState("Personal");
	const [copies, setCopies] = useState(0);
	const controlsRef = useRef<HTMLDivElement>(null);
	const geometry = useMemo(
		() => ({ blendRadius: softness, menuRadius: radius }),
		[softness, radius]
	);
	const motion = useMemo(
		() => ({
			backdropOpacity: 0,
			closeDurationMs: duration * 0.75,
			contentDelayMs: duration / 2,
			contentDurationMs: duration / 2,
			openDurationMs: duration,
			submenuCloseDurationMs: (duration * 2) / 3,
			submenuContentDelayMs: duration * 0.375,
			submenuOpenDurationMs: (duration * 5) / 6,
		}),
		[duration]
	);

	const reset = useCallback(() => {
		setSoftness(LIQUID_MENU_GEOMETRY.blendRadius);
		setRadius(LIQUID_MENU_GEOMETRY.menuRadius);
		setDuration(LIQUID_MENU_MOTION.openDurationMs);
	}, []);
	const changeOpen = useCallback<NonNullable<LiquidMenuProps["onOpenChange"]>>(
		(open, details) => {
			const { target } = details.event;
			if (
				!open &&
				(details.reason === "outside-press" ||
					details.reason === "focus-out") &&
				target instanceof Node &&
				controlsRef.current?.contains(target)
			) {
				details.cancel();
			}
		},
		[]
	);
	const duplicate = useCallback(() => {
		setCopies((count) => count + 1);
	}, []);
	const movePersonal = useCallback(() => {
		setFolder("Personal");
	}, []);
	const moveTeam = useCallback(() => {
		setFolder("Team");
	}, []);
	const archive = useCallback(() => setFolder("Archived"), []);

	return (
		<LiquidProvider>
			<div className="component-library" id="examples">
				<PlaygroundControlsProvider active={active}>
					<ExampleNav onActiveChange={changeActive} />
					<div className="example-collection">
						<section
							aria-labelledby="connected-menu-title"
							className="component-example"
							id="connected-menu"
						>
							<ExamplePreview
								code={createExampleCode(variant, { geometry, motion })}
								controls={
									<div className="surface-controls" ref={controlsRef}>
										<div className="controls-heading">
											<h2>Menus</h2>
											<button
												aria-label="Reset controls"
												className="reset-button"
												onClick={reset}
												title="Reset controls"
												type="button"
											>
												<RotateCcw aria-hidden="true" size={15} />
											</button>
										</div>
										<div className="dial-controls">
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
										</div>
									</div>
								}
								heading={
									<header className="example-heading">
										<h2 id="connected-menu-title">Menus</h2>
										<p>
											Connected surfaces, from a simple action to a nested menu.
										</p>
									</header>
								}
								name="Menu"
								variants={
									<fieldset className="variant-controls">
										<legend>Variants</legend>
										{VARIANTS.map((item) => (
											<label key={item.value}>
												<input
													checked={variant === item.value}
													name="menu-variant"
													onChange={changeVariant}
													type="radio"
													value={item.value}
												/>
												<span>{item.label}</span>
											</label>
										))}
									</fieldset>
								}
							>
								{variant === "connected" ? (
									<div className="preview-stage">
										<div className="preview-document">
											<div className="document-icon">
												<Folder
													aria-hidden="true"
													size={24}
													strokeWidth={1.3}
												/>
											</div>
											<div className="document-description">
												<span className="document-title">Untitled idea</span>
												<span className="document-meta">
													{folder}
													{copies > 0
														? ` · ${copies} ${copies === 1 ? "copy" : "copies"}`
														: ""}
												</span>
											</div>
											<LiquidMenu
												geometry={geometry}
												modal={false}
												motion={motion}
												onOpenChange={changeOpen}
											>
												<LiquidMenuTrigger aria-label="Open idea menu">
													<MoreHorizontal aria-hidden="true" size={20} />
												</LiquidMenuTrigger>
												<LiquidMenuContent align="end" className="demo-menu">
													<LiquidMenuItem onClick={duplicate}>
														<Copy aria-hidden="true" />
														Duplicate
													</LiquidMenuItem>
													<LiquidMenuSub>
														<LiquidMenuSubTrigger>
															<FolderInput aria-hidden="true" />
															Move to
															<ChevronRight
																aria-hidden="true"
																className="item-trailing"
															/>
														</LiquidMenuSubTrigger>
														<LiquidMenuSubContent className="demo-submenu">
															<LiquidMenuItem onClick={movePersonal}>
																Personal
																{folder === "Personal" && (
																	<Check
																		aria-hidden="true"
																		className="item-trailing"
																	/>
																)}
															</LiquidMenuItem>
															<LiquidMenuItem onClick={moveTeam}>
																Team
																{folder === "Team" && (
																	<Check
																		aria-hidden="true"
																		className="item-trailing"
																	/>
																)}
															</LiquidMenuItem>
														</LiquidMenuSubContent>
													</LiquidMenuSub>
													<LiquidMenuSeparator />
													<LiquidMenuItem onClick={archive}>
														<Archive aria-hidden="true" />
														Archive
													</LiquidMenuItem>
												</LiquidMenuContent>
											</LiquidMenu>
										</div>
									</div>
								) : null}
								{variant === "action" ? (
									<ActionMenuExample
										geometry={geometry}
										motion={motion}
										onOpenChange={changeOpen}
									/>
								) : null}
								{variant === "status" ? (
									<StatusMenuExample
										geometry={geometry}
										motion={motion}
										onOpenChange={changeOpen}
									/>
								) : null}
							</ExamplePreview>
						</section>
						<MorePlaygrounds />
					</div>
				</PlaygroundControlsProvider>
			</div>
		</LiquidProvider>
	);
}
