"use client";

import { ContextMenu } from "@base-ui/react/context-menu";
import {
	type ComponentProps,
	cloneElement,
	createContext,
	type KeyboardEvent,
	type ReactElement,
	type ReactNode,
	use,
	useCallback,
} from "react";
import { LiquidAutoSize } from "./liquid-auto-size";
import {
	LiquidMenuContent,
	type LiquidMenuProps,
	useLiquidMenuRoot,
} from "./liquid-menu";
import { LIQUID_MENU_CONNECTED_BUTTON_ANCHOR_GEOMETRY } from "./liquid-menu-config";
import { LiquidMenuSurface } from "./liquid-menu-surface";
import {
	LiquidMenuContext,
	useLiquidMenuContext,
} from "./use-liquid-menu-context";

const OpenContext = createContext<(() => void) | null>(null);

export function LiquidContextMenu({
	children,
	open,
	defaultOpen,
	onOpenChange,
	geometry,
	motion,
	outlineWidth = 1,
}: ComponentProps<typeof ContextMenu.Root> &
	Pick<LiquidMenuProps, "geometry" | "motion" | "outlineWidth">) {
	const state = useLiquidMenuRoot({
		anchor: undefined,
		anchorClip: undefined,
		anchorGeometry: LIQUID_MENU_CONNECTED_BUTTON_ANCHOR_GEOMETRY,
		defaultOpen,
		geometry,
		motion,
		open,
		outlineWidth,
	});
	const changeOpen = useCallback<
		NonNullable<ComponentProps<typeof ContextMenu.Root>["onOpenChange"]>
	>(
		(next, details) => {
			onOpenChange?.(next, details);
			if (!details.isCanceled) {
				state.changeOpen(next);
			}
		},
		[onOpenChange, state.changeOpen]
	);
	const show = useCallback(() => state.changeOpen(true), [state.changeOpen]);
	return (
		<OpenContext value={show}>
			<LiquidMenuContext value={state.context}>
				<LiquidMenuSurface />
				<ContextMenu.Root onOpenChange={changeOpen} open={state.isOpen}>
					{children}
				</ContextMenu.Root>
			</LiquidMenuContext>
		</OpenContext>
	);
}

export function LiquidContextMenuTrigger({
	children,
}: {
	children: ReactElement<{ children?: ReactNode }>;
}) {
	const context = useLiquidMenuContext();
	const show = use(OpenContext);
	const keyboard = useCallback(
		(event: KeyboardEvent<HTMLElement>) => {
			if (
				event.key === "ContextMenu" ||
				(event.shiftKey && event.key === "F10") ||
				event.key === "Enter" ||
				event.key === " "
			) {
				event.preventDefault();
				show?.();
			}
		},
		[show]
	);
	const closedState = context.hasSurface ? "closing" : "idle";
	return (
		<ContextMenu.Trigger
			data-liquid-state={context.isOpen ? "open" : closedState}
			data-liquid-target=""
			onKeyDown={keyboard}
			ref={context.setTriggerElement}
			render={cloneElement(
				children,
				undefined,
				<LiquidAutoSize duration={context.motion.openDurationMs}>
					{children.props.children}
				</LiquidAutoSize>
			)}
		/>
	);
}

export function LiquidContextMenuContent(
	props: ComponentProps<typeof LiquidMenuContent>
) {
	const context = useLiquidMenuContext();
	const focusTarget = useCallback(() => {
		const element = context.anchor();
		return element instanceof HTMLElement ? element : null;
	}, [context.anchor]);
	return <LiquidMenuContent finalFocus={focusTarget} {...props} />;
}
