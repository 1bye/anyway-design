import { AlertDialog } from "@base-ui/react/alert-dialog";
import {
	type CSSProperties,
	type KeyboardEvent,
	type MouseEvent,
	type ReactNode,
	type RefObject,
	useCallback,
	useId,
	useRef,
} from "react";
import {
	enabledAlertAction,
	type MacAlertAction,
	orderedAlertActions,
} from "./alert-actions";
import { MacCheckbox, type MacCheckboxProps } from "./checkbox";
import { MacButton } from "./controls";
import { useMacOSPortal } from "./environment";

export type { MacAlertAction } from "./alert-actions";

const APPLICATION_LIGHT = new URL(
	"./assets/native-alerts/application-light.png",
	import.meta.url
).href;
const APPLICATION_DARK = new URL(
	"./assets/native-alerts/application-dark.png",
	import.meta.url
).href;
const CRITICAL_LIGHT = new URL(
	"./assets/native-alerts/critical-light.png",
	import.meta.url
).href;
const CRITICAL_DARK = new URL(
	"./assets/native-alerts/critical-dark.png",
	import.meta.url
).href;

export interface MacAlertPanelProps {
	actions: readonly MacAlertAction[];
	cancelAction?: string;
	className?: string;
	defaultAction?: string;
	description?: string;
	descriptionId?: string;
	/** Replaces the complete native artwork, including the badge for critical alerts. */
	icon?: ReactNode;
	onAction: (id: string) => void;
	presentation?: "dialog" | "sheet";
	severity?: "informational" | "warning" | "critical";
	style?: CSSProperties;
	suppression?: Pick<
		MacCheckboxProps,
		"label" | "checked" | "defaultChecked" | "onCheckedChange" | "disabled"
	>;
	title: string;
	titleId?: string;
}

export function MacAlertPanel({
	actions,
	cancelAction,
	className = "",
	defaultAction,
	description,
	descriptionId,
	icon,
	onAction,
	presentation = "dialog",
	severity = "informational",
	style,
	suppression,
	title,
	titleId,
}: MacAlertPanelProps) {
	const id = useId();
	const headingId = titleId ?? `${id}-title`;
	const detailId = descriptionId ?? `${id}-description`;
	const initial =
		enabledAlertAction(actions, cancelAction) ??
		enabledAlertAction(actions, defaultAction) ??
		actions.find((action) => !action.disabled);
	const click = useCallback(
		(event: MouseEvent<HTMLButtonElement>) => {
			const action = enabledAlertAction(
				actions,
				event.currentTarget.dataset.alertAction
			);
			if (action) {
				onAction(action.id);
			}
		},
		[actions, onAction]
	);
	const keyDown = useCallback(
		(event: KeyboardEvent<HTMLElement>) => {
			if (
				event.defaultPrevented ||
				event.nativeEvent.isComposing ||
				event.repeat ||
				event.metaKey ||
				event.ctrlKey ||
				event.altKey
			) {
				return;
			}
			// Return invokes the default; Space invokes the focused button, as in AppKit.
			if (event.key === "Enter") {
				event.preventDefault();
				event.stopPropagation();
				const action = enabledAlertAction(actions, defaultAction);
				if (action) {
					onAction(action.id);
				}
			}
			if (event.key === "Escape") {
				event.preventDefault();
				event.stopPropagation();
				const action = enabledAlertAction(actions, cancelAction);
				if (action) {
					onAction(action.id);
				}
			}
		},
		[actions, defaultAction, cancelAction, onAction]
	);
	return (
		// biome-ignore lint/a11y/noNoninteractiveElementInteractions: Handles Return/Escape bubbling from the panel's focusable controls.
		<section
			aria-describedby={description ? detailId : undefined}
			aria-labelledby={headingId}
			className={`mac-alert-panel ${className}`}
			data-presentation={presentation}
			data-severity={severity}
			onKeyDown={keyDown}
			style={style}
		>
			<div className="mac-alert-content">
				{presentation === "dialog" ? (
					<div aria-hidden="true" className="mac-alert-icon">
						{icon ?? (
							<>
								<img
									alt=""
									className="mac-alert-icon-light"
									height={64}
									src={
										severity === "critical" ? CRITICAL_LIGHT : APPLICATION_LIGHT
									}
									width={64}
								/>
								<img
									alt=""
									className="mac-alert-icon-dark"
									height={64}
									src={
										severity === "critical" ? CRITICAL_DARK : APPLICATION_DARK
									}
									width={64}
								/>
							</>
						)}
					</div>
				) : null}
				<h2 id={headingId}>{title}</h2>
				{description ? <p id={detailId}>{description}</p> : null}
				{suppression ? (
					<MacCheckbox {...suppression} className="mac-alert-suppression" />
				) : null}
			</div>
			<div className="mac-alert-actions" data-stacked={actions.length > 2}>
				{orderedAlertActions(actions, defaultAction, cancelAction).map(
					(action) => (
						<MacButton
							data-alert-action={action.id}
							data-destructive={action.destructive ?? false}
							data-initial-focus={action.id === initial?.id}
							disabled={action.disabled}
							key={action.id}
							onClick={click}
							variant={
								action.id === defaultAction &&
								action.id !== cancelAction &&
								!action.destructive
									? "primary"
									: "default"
							}
						>
							{action.label}
						</MacButton>
					)
				)}
			</div>
		</section>
	);
}

export interface MacAlertProps
	extends Omit<MacAlertPanelProps, "titleId" | "descriptionId"> {
	onOpenChange: (open: boolean) => void;
	open: boolean;
	returnFocus?: RefObject<HTMLElement | null> | (() => HTMLElement | null);
}

export function MacAlert({
	open,
	onOpenChange,
	returnFocus,
	onAction,
	...props
}: MacAlertProps) {
	// shortcut: Sheets share browser modal ownership; independent document windows need a desktop window manager.
	const container = useMacOSPortal();
	const popup = useRef<HTMLDivElement>(null);
	const titleId = useId();
	const descriptionId = useId();
	const act = useCallback(
		(id: string) => {
			if (!enabledAlertAction(props.actions, id)) {
				return;
			}
			onAction(id);
			onOpenChange(false);
		},
		[props.actions, onAction, onOpenChange]
	);
	const change = useCallback(
		(next: boolean, details: AlertDialog.Root.ChangeEventDetails) => {
			if (!next && details.reason === "escape-key") {
				details.cancel();
				const action = enabledAlertAction(props.actions, props.cancelAction);
				if (action) {
					act(action.id);
				}
			}
		},
		[props.actions, props.cancelAction, act]
	);
	const focus = useCallback(
		() =>
			popup.current?.querySelector<HTMLButtonElement>(
				'[data-initial-focus="true"]'
			) ?? popup.current,
		[]
	);
	return (
		<AlertDialog.Root onOpenChange={change} open={open}>
			<AlertDialog.Portal container={container}>
				<AlertDialog.Backdrop
					className="mac-alert-backdrop"
					data-presentation={props.presentation ?? "dialog"}
				/>
				<AlertDialog.Popup
					aria-describedby={props.description ? descriptionId : undefined}
					aria-labelledby={titleId}
					aria-modal="true"
					className="mac-alert-popup"
					data-presentation={props.presentation ?? "dialog"}
					finalFocus={returnFocus}
					initialFocus={focus}
					ref={popup}
				>
					<MacAlertPanel
						{...props}
						descriptionId={descriptionId}
						onAction={act}
						titleId={titleId}
					/>
				</AlertDialog.Popup>
			</AlertDialog.Portal>
		</AlertDialog.Root>
	);
}
