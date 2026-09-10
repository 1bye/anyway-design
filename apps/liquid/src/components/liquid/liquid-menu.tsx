"use client";

import { Menu } from "@base-ui/react/menu";
import type {
	ComponentProps,
	CSSProperties,
	ReactElement,
	Ref,
	RefCallback,
} from "react";
import {
	useCallback,
	useEffect,
	useId,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	getLiquidMenuStyle,
	LIQUID_MENU_CONNECTED_BUTTON_ANCHOR_GEOMETRY,
	LIQUID_MENU_GEOMETRY,
	LIQUID_MENU_MOTION,
	LIQUID_SUBMENU_CLOSE_DELAY_MS,
	type LiquidMenuGeometry,
	type LiquidMenuMotion,
} from "./liquid-menu-config";
import type { LiquidMenuAnchorGeometry } from "./liquid-menu-geometry";
import { getLiquidMenuLayerZIndices } from "./liquid-menu-stack";
import { LiquidMenuSurface } from "./liquid-menu-surface";
import {
	LiquidMenuContext,
	type LiquidMenuContextValue,
	LiquidMenuSubContext,
	type LiquidMenuSubContextValue,
	useLiquidMenuContext,
	useLiquidMenuSubContext,
} from "./use-liquid-menu-context";
import { useLiquidMenuStack } from "./use-liquid-menu-stack";
import "./liquid.css";

export interface LiquidMenuProps extends Menu.Root.Props {
	readonly anchor?: () => Element | null;
	readonly anchorClip?: () => Element | null;
	readonly anchorGeometry?: LiquidMenuAnchorGeometry;
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

const useLiquidMenuRoot = ({
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
	const layerId = useId();
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
	const resolvedGeometry = useMemo<LiquidMenuGeometry>(
		() => ({ ...LIQUID_MENU_GEOMETRY, ...geometry }),
		[geometry]
	);
	const resolvedMotion = useMemo<LiquidMenuMotion>(
		() => ({ ...LIQUID_MENU_MOTION, ...motion }),
		[motion]
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
			anchorGeometry,
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
		}),
		[
			activeSubmenuId,
			anchorClip,
			anchorGeometry,
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
			<Menu.Root {...props} onOpenChange={changeOpen} open={state.isOpen} />
		</LiquidMenuContext>
	);
}

export function LiquidMenuTrigger({
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
		/>
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
		...getLiquidMenuStyle(context.motion),
		"--liquid-radius": `${context.geometry.menuRadius}px`,
		...style,
	};
	return (
		<Menu.Portal>
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
				/>
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

export function LiquidMenuSub({
	onOpenChange,
	defaultOpen = false,
	open,
	...props
}: Menu.SubmenuRoot.Props): ReactElement {
	const context = useLiquidMenuContext();
	const submenuId = useId();
	const [internalOpen, setInternalOpen] = useState(defaultOpen);
	const [contentElement, setContentElement] = useState<HTMLElement | null>(
		null
	);
	const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(
		null
	);
	const isOpen = (open ?? internalOpen) && context.isOpen;
	const changeOpen = useCallback<
		NonNullable<Menu.SubmenuRoot.Props["onOpenChange"]>
	>(
		(nextOpen, details) => {
			onOpenChange?.(nextOpen, details);
			if (!details.isCanceled && open === undefined) {
				setInternalOpen(nextOpen);
			}
		},
		[onOpenChange, open]
	);
	useEffect(() => {
		context.onSubmenuOpenChange(submenuId, isOpen);
	}, [context.onSubmenuOpenChange, isOpen, submenuId]);
	useEffect(() => {
		if (!isOpen || context.activeSubmenuId !== submenuId) {
			return;
		}
		context.setSubmenuElement(contentElement);
		context.setSubmenuTriggerElement(triggerElement);
	}, [
		isOpen,
		context.activeSubmenuId,
		context.setSubmenuElement,
		context.setSubmenuTriggerElement,
		contentElement,
		triggerElement,
		submenuId,
	]);
	useEffect(
		() => () => context.onSubmenuOpenChange(submenuId, false),
		[context.onSubmenuOpenChange, submenuId]
	);
	const submenuContext = useMemo<LiquidMenuSubContextValue>(
		() => ({ setContentElement, setTriggerElement }),
		[]
	);
	return (
		<LiquidMenuSubContext value={submenuContext}>
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
	const context = useLiquidMenuContext();
	const submenuContext = useLiquidMenuSubContext();
	const contentRef = useMergedElementRef(ref, submenuContext.setContentElement);
	return (
		<MenuContent
			{...props}
			data-liquid-surface={context.hasSubmenuSurface ? "true" : undefined}
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
