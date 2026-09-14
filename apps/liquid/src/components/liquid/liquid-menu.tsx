"use client";

import { Menu } from "@base-ui/react/menu";
import type {
	ComponentProps,
	CSSProperties,
	ReactElement,
	ReactNode,
	Ref,
	RefCallback,
} from "react";
import {
	use,
	useCallback,
	useEffect,
	useId,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { LiquidAutoSize } from "./liquid-auto-size";
import { LiquidDefaults } from "./liquid-defaults";
import {
	getLiquidMenuStyle,
	LIQUID_MENU_CONNECTED_BUTTON_ANCHOR_GEOMETRY,
	LIQUID_MENU_GEOMETRY,
	LIQUID_MENU_MOTION,
	LIQUID_SUBMENU_CLOSE_DELAY_MS,
	type LiquidMenuGeometry,
	type LiquidMenuMotion,
} from "./liquid-menu-config";
import type {
	LiquidMenuAnchorGeometry,
	LiquidMenuBranch,
	LiquidMenuSubmenuMeasurement,
} from "./liquid-menu-geometry";
import { getLiquidMenuLayerZIndices } from "./liquid-menu-stack";
import { LiquidMenuSurface } from "./liquid-menu-surface";
import { readLiquidTheme } from "./liquid-theme";
import { createLiquidGeometryTracker } from "./track-liquid-geometry";
import {
	LiquidMenuContext,
	type LiquidMenuContextValue,
	LiquidMenuSubContext,
	type LiquidMenuSubContextValue,
	useLiquidMenuContext,
	useLiquidMenuSubContext,
} from "./use-liquid-menu-context";
import { useLiquidMenuStack } from "./use-liquid-menu-stack";
import { useLiquidProgress } from "./use-liquid-menu-surface";
import "./liquid.css";

export interface LiquidMenuProps extends Omit<Menu.Root.Props, "children"> {
	readonly anchor?: () => Element | null;
	readonly anchorClip?: () => Element | null;
	readonly anchorGeometry?: LiquidMenuAnchorGeometry;
	readonly children?: ReactNode;
	readonly geometry?: Partial<LiquidMenuGeometry>;
	readonly motion?: Partial<LiquidMenuMotion>;
	readonly onPresenceChange?: (isPresent: boolean) => void;
	readonly outlineWidth?: number;
}

interface UseLiquidMenuRootOptions {
	readonly anchor: (() => Element | null) | undefined;
	readonly anchorClip: (() => Element | null) | undefined;
	readonly anchorGeometry: LiquidMenuAnchorGeometry;
	readonly defaultOpen?: boolean;
	readonly geometry: Partial<LiquidMenuGeometry> | undefined;
	readonly motion: Partial<LiquidMenuMotion> | undefined;
	readonly onPresenceChange?: (isPresent: boolean) => void;
	readonly open?: boolean;
	readonly outlineWidth: number;
}

interface LiquidMenuRootState {
	readonly changeOpen: (isOpen: boolean) => void;
	readonly context: LiquidMenuContextValue;
	readonly isOpen: boolean;
}

type LiquidTriggerState = "closing" | "idle" | "open";

const assignRef = <ElementType,>(
	ref: Ref<ElementType> | undefined,
	value: ElementType | null
): (() => void) => {
	if (typeof ref === "function") {
		const cleanup = ref(value);
		return typeof cleanup === "function" ? cleanup : () => ref(null);
	}
	if (ref) {
		ref.current = value;
	}
	return () => {
		if (ref) {
			ref.current = null;
		}
	};
};

const useMergedElementRef = <ElementType extends HTMLElement>(
	firstRef: Ref<ElementType> | undefined,
	secondRef: RefCallback<HTMLElement>
): RefCallback<ElementType> =>
	useCallback(
		(element: ElementType | null) => {
			const cleanupFirst = assignRef(firstRef, element);
			const cleanupSecond = assignRef(secondRef, element);
			return () => {
				cleanupFirst();
				cleanupSecond();
			};
		},
		[firstRef, secondRef]
	);

export const useLiquidMenuRoot = ({
	anchor,
	anchorClip,
	anchorGeometry,
	defaultOpen,
	geometry,
	motion,
	onPresenceChange,
	open,
	outlineWidth,
}: UseLiquidMenuRootOptions): LiquidMenuRootState => {
	const defaults = use(LiquidDefaults);
	const layerId = useId();
	const [branchMap, setBranchMap] = useState<Record<string, LiquidMenuBranch>>(
		{}
	);
	const branches = useMemo(() => Object.values(branchMap), [branchMap]);
	const updateBranch = useCallback(
		(id: string, branch: LiquidMenuBranch | null) => {
			setBranchMap((current) => {
				if (!(branch || current[id])) {
					return current;
				}
				const next = { ...current };
				if (branch) {
					next[id] = branch;
				} else {
					delete next[id];
				}
				return next;
			});
		},
		[]
	);
	const stack = useLiquidMenuStack();
	const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false);
	const [activeSubmenuId, setActiveSubmenuId] = useState<string | null>(null);
	const activeSubmenuIdRef = useRef<string | null>(null);
	const [hasSurface, setHasSurface] = useState(false);
	const [hasSubmenuSurface, setHasSubmenuSurface] = useState(false);
	const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(
		null
	);
	const [menuElement, setMenuElement] = useState<HTMLElement | null>(null);
	const [submenuElement, setSubmenuElement] = useState<HTMLElement | null>(
		null
	);
	const [submenuTriggerElement, setSubmenuTriggerElement] =
		useState<HTMLElement | null>(null);
	const isOpen = open ?? internalOpen;
	const layerIndex = stack.layerIds.indexOf(layerId);
	const isTopLayer =
		layerIndex >= 0 && layerIndex === stack.layerIds.length - 1;
	const readTriggerElement = useCallback(
		(): Element | null => triggerElement,
		[triggerElement]
	);
	const resolvedAnchor = anchor ?? readTriggerElement;
	const resolvedAnchorGeometry = useMemo(() => {
		if (
			anchorGeometry !== LIQUID_MENU_CONNECTED_BUTTON_ANCHOR_GEOMETRY ||
			!triggerElement
		) {
			return anchorGeometry;
		}
		const radius = Number.parseFloat(
			getComputedStyle(triggerElement).borderRadius
		);
		return Number.isFinite(radius)
			? { ...anchorGeometry, radius }
			: anchorGeometry;
	}, [anchorGeometry, triggerElement]);
	const resolvedGeometry = useMemo<LiquidMenuGeometry>(
		() => ({ ...LIQUID_MENU_GEOMETRY, ...defaults.geometry, ...geometry }),
		[geometry, defaults.geometry]
	);
	const resolvedMotion = useMemo<LiquidMenuMotion>(
		() => ({ ...LIQUID_MENU_MOTION, ...defaults.motion, ...motion }),
		[motion, defaults.motion]
	);

	const changeSubmenuOpen = useCallback(
		(submenuId: string, nextIsOpen: boolean): void => {
			if (nextIsOpen) {
				activeSubmenuIdRef.current = submenuId;
				setActiveSubmenuId(submenuId);
				setSubmenuElement(null);
				setSubmenuTriggerElement(null);
				return;
			}
			if (activeSubmenuIdRef.current === submenuId) {
				activeSubmenuIdRef.current = null;
				setActiveSubmenuId(null);
			}
		},
		[]
	);
	const changeOpen = useCallback(
		(nextIsOpen: boolean): void => {
			if (open === undefined) {
				setInternalOpen(nextIsOpen);
			}
			if (!nextIsOpen) {
				activeSubmenuIdRef.current = null;
				setActiveSubmenuId(null);
			}
		},
		[open]
	);
	const changePresence = useCallback(
		(isPresent: boolean): void => {
			setHasSurface(isPresent);
			onPresenceChange?.(isPresent);
		},
		[onPresenceChange]
	);
	const changeSubmenuPresence = useCallback((isPresent: boolean): void => {
		setHasSubmenuSurface(isPresent);
	}, []);

	useLayoutEffect(() => {
		if (!hasSurface) {
			return;
		}
		stack.showLayer(layerId);
		return () => stack.hideLayer(layerId);
	}, [hasSurface, layerId, stack.hideLayer, stack.showLayer]);

	useLayoutEffect(() => {
		if (hasSurface && isOpen) {
			stack.showLayer(layerId);
		}
	}, [hasSurface, isOpen, layerId, stack.showLayer]);

	const context = useMemo<LiquidMenuContextValue>(
		() => ({
			activeSubmenuId,
			anchor: resolvedAnchor,
			anchorClip,
			anchorGeometry: resolvedAnchorGeometry,
			branches,
			geometry: resolvedGeometry,
			hasSubmenuSurface,
			hasSurface,
			isOpen,
			isSubmenuOpen: activeSubmenuId !== null,
			isTopLayer,
			layerIndex,
			menuElement,
			motion: resolvedMotion,
			onPresenceChange: changePresence,
			onSubmenuOpenChange: changeSubmenuOpen,
			onSubmenuPresenceChange: changeSubmenuPresence,
			outlineWidth,
			setMenuElement,
			setSubmenuElement,
			setSubmenuTriggerElement,
			setTriggerElement,
			submenuElement,
			submenuTriggerElement,
			updateBranch,
		}),
		[
			branches,
			updateBranch,
			activeSubmenuId,
			anchorClip,
			resolvedAnchorGeometry,
			changePresence,
			changeSubmenuOpen,
			changeSubmenuPresence,
			hasSubmenuSurface,
			hasSurface,
			isOpen,
			isTopLayer,
			layerIndex,
			menuElement,
			outlineWidth,
			resolvedAnchor,
			resolvedGeometry,
			resolvedMotion,
			submenuElement,
			submenuTriggerElement,
		]
	);

	return { changeOpen, context, isOpen };
};

const getLiquidTriggerState = (
	context: LiquidMenuContextValue
): LiquidTriggerState => {
	if (context.isOpen) {
		return "open";
	}
	return context.hasSurface ? "closing" : "idle";
};

export function LiquidMenu({
	anchor,
	anchorClip,
	anchorGeometry = LIQUID_MENU_CONNECTED_BUTTON_ANCHOR_GEOMETRY,
	defaultOpen,
	geometry,
	motion,
	onOpenChange,
	onPresenceChange,
	open,
	outlineWidth = 1,
	...props
}: LiquidMenuProps): ReactElement {
	const parent = use(LiquidMenuContext);
	const state = useLiquidMenuRoot({
		anchor,
		anchorClip,
		anchorGeometry,
		defaultOpen,
		geometry,
		motion,
		onPresenceChange,
		open,
		outlineWidth,
	});
	const parentOpen = parent?.isOpen;
	useEffect(() => {
		if (parentOpen === false) {
			state.changeOpen(false);
		}
	}, [parentOpen, state.changeOpen]);
	const changeOpen = useCallback<NonNullable<Menu.Root.Props["onOpenChange"]>>(
		(nextOpen, details) => {
			onOpenChange?.(nextOpen, details);
			if (!details.isCanceled) {
				state.changeOpen(nextOpen);
			}
		},
		[onOpenChange, state.changeOpen]
	);
	return (
		<LiquidMenuContext value={state.context}>
			<LiquidMenuSurface />
			<LiquidMenuSubContext value={null}>
				{parent ? (
					<Menu.SubmenuRoot
						{...props}
						onOpenChange={changeOpen}
						open={state.isOpen}
					/>
				) : (
					<Menu.Root {...props} onOpenChange={changeOpen} open={state.isOpen} />
				)}
			</LiquidMenuSubContext>
		</LiquidMenuContext>
	);
}

export function LiquidMenuTrigger({
	children,
	ref,
	...props
}: ComponentProps<typeof Menu.Trigger>): ReactElement {
	const context = useLiquidMenuContext();
	const triggerRef = useMergedElementRef(ref, context.setTriggerElement);
	return (
		<Menu.Trigger
			{...props}
			data-liquid-state={getLiquidTriggerState(context)}
			data-liquid-trigger=""
			ref={triggerRef}
		>
			<LiquidAutoSize duration={context.motion.openDurationMs}>
				{children}
			</LiquidAutoSize>
		</Menu.Trigger>
	);
}

interface LiquidMenuContentProps
	extends Omit<ComponentProps<typeof Menu.Popup>, "style">,
		Pick<
			Menu.Positioner.Props,
			| "side"
			| "sideOffset"
			| "align"
			| "alignOffset"
			| "anchor"
			| "collisionPadding"
		> {
	readonly style?: CSSProperties;
}

function MenuContent({
	children,
	anchor,
	align = "start",
	alignOffset = 0,
	side = "bottom",
	sideOffset = 4,
	collisionPadding = 12,
	ref,
	style,
	...props
}: LiquidMenuContentProps): ReactElement {
	const context = useLiquidMenuContext();
	const { content } = getLiquidMenuLayerZIndices(context.layerIndex);
	const popupStyle: CSSProperties & { "--liquid-radius": string } = {
		...readLiquidTheme(context.anchor()),
		...getLiquidMenuStyle(context.motion),
		"--liquid-radius": `${context.geometry.menuRadius}px`,
		...style,
	};
	return (
		<Menu.Portal keepMounted>
			<Menu.Positioner
				align={align}
				alignOffset={alignOffset}
				anchor={anchor}
				collisionPadding={collisionPadding}
				side={side}
				sideOffset={sideOffset}
				style={{ zIndex: content }}
			>
				<Menu.Popup
					{...props}
					data-liquid-content=""
					ref={ref}
					style={popupStyle}
				>
					<LiquidAutoSize block duration={context.motion.openDurationMs}>
						{children}
					</LiquidAutoSize>
				</Menu.Popup>
			</Menu.Positioner>
		</Menu.Portal>
	);
}

export function LiquidMenuContent({
	anchor,
	ref,
	...props
}: LiquidMenuContentProps): ReactElement {
	const context = useLiquidMenuContext();
	const contentRef = useMergedElementRef(ref, context.setMenuElement);
	return (
		<MenuContent
			{...props}
			anchor={anchor ?? context.anchor}
			data-liquid-surface={context.hasSurface ? "true" : undefined}
			data-name="LiquidMenuContent"
			ref={contentRef}
		/>
	);
}

const noop = () => undefined;

export function LiquidMenuSub({
	onOpenChange,
	defaultOpen = false,
	open,
	...props
}: Menu.SubmenuRoot.Props): ReactElement {
	const context = useLiquidMenuContext();
	const parent = use(LiquidMenuSubContext);
	const id = useId();
	const [internalOpen, setInternalOpen] = useState(defaultOpen);
	const [contentElement, setContentElement] = useState<HTMLElement | null>(
		null
	);
	const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(
		null
	);
	const [measurement, setMeasurement] = useState<
		(LiquidMenuSubmenuMeasurement & { parent: DOMRect }) | null
	>(null);
	const isOpen =
		(open ?? internalOpen) && context.isOpen && (parent?.isOpen ?? true);
	const parentOpen = context.isOpen && (parent?.isOpen ?? true);
	useEffect(() => {
		if (!parentOpen && open === undefined) {
			setInternalOpen(false);
		}
	}, [parentOpen, open]);
	const changeOpen = useCallback<
		NonNullable<Menu.SubmenuRoot.Props["onOpenChange"]>
	>(
		(next, details) => {
			onOpenChange?.(next, details);
			if (!details.isCanceled && open === undefined) {
				setInternalOpen(next);
			}
		},
		[onOpenChange, open]
	);
	useLayoutEffect(() => {
		if (!(isOpen && contentElement && triggerElement)) {
			return;
		}
		const parentElement = triggerElement.closest('[role="menu"]');
		if (!parentElement) {
			return;
		}
		const tracker = createLiquidGeometryTracker(() => {
			const menu = contentElement.getBoundingClientRect();
			if (!(menu.width && menu.height)) {
				return;
			}
			const next = {
				menu,
				parent: parentElement.getBoundingClientRect(),
				side:
					contentElement.dataset.side === "left"
						? ("left" as const)
						: ("right" as const),
				trigger: triggerElement.getBoundingClientRect(),
			};
			setMeasurement((current) =>
				JSON.stringify(current) === JSON.stringify(next) ? current : next
			);
		});
		tracker.setElements([contentElement, triggerElement, parentElement]);
		tracker.setContinuousTracking(true);
		tracker.schedule();
		return tracker.disconnect;
	}, [isOpen, contentElement, triggerElement]);
	const hide = useCallback(() => setMeasurement(null), []);
	const progress = useLiquidProgress({
		closeDurationMs: context.motion.submenuCloseDurationMs,
		hasMeasurement: !!measurement,
		isActive: isOpen,
		onHidden: hide,
		onPresenceChange: noop,
		openDurationMs: context.motion.submenuOpenDurationMs,
	});
	useLayoutEffect(() => {
		context.updateBranch(
			id,
			measurement && progress > 0 ? { ...measurement, progress } : null
		);
	}, [context.updateBranch, id, measurement, progress]);
	useEffect(
		() => () => context.updateBranch(id, null),
		[context.updateBranch, id]
	);
	const subContext = useMemo<LiquidMenuSubContextValue>(
		() => ({
			isOpen,
			isPresent: progress > 0,
			setContentElement,
			setTriggerElement,
		}),
		[isOpen, progress]
	);
	return (
		<LiquidMenuSubContext value={subContext}>
			<Menu.SubmenuRoot {...props} onOpenChange={changeOpen} open={isOpen} />
		</LiquidMenuSubContext>
	);
}

export function LiquidMenuSubTrigger({
	closeDelay = LIQUID_SUBMENU_CLOSE_DELAY_MS,
	openOnHover = true,
	ref,
	...props
}: ComponentProps<typeof Menu.SubmenuTrigger>): ReactElement {
	const context = useLiquidMenuSubContext();
	const triggerRef = useMergedElementRef(ref, context.setTriggerElement);
	return (
		<Menu.SubmenuTrigger
			{...props}
			closeDelay={closeDelay}
			data-liquid-item=""
			data-liquid-sub-trigger=""
			openOnHover={openOnHover}
			ref={triggerRef}
		/>
	);
}

export function LiquidMenuSubContent({
	side = "right",
	sideOffset = 4,
	ref,
	...props
}: LiquidMenuContentProps): ReactElement {
	const submenuContext = useLiquidMenuSubContext();
	const contentRef = useMergedElementRef(ref, submenuContext.setContentElement);
	return (
		<MenuContent
			{...props}
			data-liquid-surface={submenuContext.isPresent ? "true" : undefined}
			data-name="LiquidMenuSubContent"
			ref={contentRef}
			side={side}
			sideOffset={sideOffset}
		/>
	);
}

export function LiquidMenuItem(
	props: ComponentProps<typeof Menu.Item>
): ReactElement {
	return <Menu.Item {...props} data-liquid-item="" />;
}

export function LiquidMenuSeparator(
	props: ComponentProps<typeof Menu.Separator>
): ReactElement {
	return <Menu.Separator {...props} data-liquid-separator="" />;
}

export function LiquidMenuTriggerItem({
	children,
	ref,
	...props
}: ComponentProps<typeof Menu.SubmenuTrigger>): ReactElement {
	const context = useLiquidMenuContext();
	const triggerRef = useMergedElementRef(ref, context.setTriggerElement);
	return (
		<Menu.SubmenuTrigger
			{...props}
			data-liquid-item=""
			data-liquid-state={getLiquidTriggerState(context)}
			data-liquid-trigger-item=""
			openOnHover={false}
			ref={triggerRef}
		>
			<LiquidAutoSize duration={context.motion.openDurationMs}>
				{children}
			</LiquidAutoSize>
		</Menu.SubmenuTrigger>
	);
}
