import { Tabs } from "@base-ui/react/tabs";
import {
	type KeyboardEvent,
	type MouseEvent,
	type ReactNode,
	type RefObject,
	useCallback,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { MacMenuButton } from "./menu";
import { reorderTabs, tabAfterClose } from "./tab-order";
import { useTabDrag } from "./use-tab-drag";
import { WindowSymbol } from "./window-symbol";

export interface MacTab {
	closable?: boolean;
	content: ReactNode;
	disabled?: boolean;
	id: string;
	label: string;
}
export interface MacTabsProps {
	label?: string;
	onAdd?: () => void;
	onClose?: (id: string) => void;
	onReorder?: (ids: string[]) => void;
	onValueChange: (value: string) => void;
	tabs: MacTab[];
	value: string;
	variant?: "document" | "segmented";
}

function revealSelectedTab(element: HTMLDivElement | null) {
	const selected = element?.querySelector<HTMLButtonElement>(
		'[role="tab"][aria-selected="true"]'
	);
	const item = selected?.parentElement;
	if (element && item) {
		const left = item.offsetLeft;
		const right = left + item.offsetWidth;
		if (left < element.scrollLeft) {
			element.scrollLeft = left;
		} else if (right > element.scrollLeft + element.clientWidth) {
			element.scrollLeft = right - element.clientWidth;
		}
	}
	return selected;
}

function DocumentTabStrip({
	tabs,
	value,
	onValueChange,
	onAdd,
	onClose,
	onReorder,
	label,
}: MacTabsProps) {
	const list: RefObject<HTMLDivElement | null> = useRef(null);
	const add: RefObject<HTMLButtonElement | null> = useRef(null);
	const overflowControl: RefObject<HTMLDivElement | null> = useRef(null);
	const focusPending: RefObject<boolean> = useRef(false);
	const [overflow, setOverflow] = useState(false);
	const [announcement, setAnnouncement] = useState("");
	const commitOrder = useCallback(
		(ids: string[], id: string) => {
			focusPending.current = true;
			onReorder?.(ids);
			const tab = tabs.find((entry) => entry.id === id);
			setAnnouncement(
				`${tab?.label ?? "Tab"} moved to position ${ids.indexOf(id) + 1} of ${ids.length}.`
			);
		},
		[tabs, onReorder]
	);
	const drag = useTabDrag(list, tabs, onReorder ? commitOrder : undefined);

	// biome-ignore lint/correctness/useExhaustiveDependencies: Tab changes can alter scroll width without resizing the list.
	useLayoutEffect(() => {
		const element = list.current;
		if (!element) {
			return;
		}
		const measure = () => {
			// Measure the space available without the overflow control to avoid hysteresis.
			const available =
				element.clientWidth + (overflowControl.current?.offsetWidth ?? 0);
			setOverflow(element.scrollWidth > available + 1);
			if (!element.hasAttribute("data-dragging")) {
				revealSelectedTab(element);
			}
		};
		const observer = new ResizeObserver(measure);
		observer.observe(element);
		measure();
		return () => observer.disconnect();
	}, [tabs]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: Read the committed layout after selection, reordering, or an overflow control changes it.
	useLayoutEffect(() => {
		const element = list.current;
		const selected = revealSelectedTab(element);
		if (focusPending.current) {
			(selected ?? add.current ?? element)?.focus({ preventScroll: true });
			focusPending.current = false;
		}
	}, [tabs, value, overflow]);

	const closeTab = useCallback(
		(id: string) => {
			const tab = tabs.find((entry) => entry.id === id);
			if (!(onClose && tab) || tab.disabled || tab.closable === false) {
				return;
			}
			focusPending.current = true;
			onClose(id);
			if (value === id) {
				onValueChange(tabAfterClose(tabs, id));
			}
		},
		[tabs, value, onClose, onValueChange]
	);
	const closeClick = useCallback(
		(event: MouseEvent<HTMLButtonElement>) => {
			const { id } = event.currentTarget.dataset;
			if (id) {
				closeTab(id);
			}
		},
		[closeTab]
	);
	const addTab = useCallback(() => {
		focusPending.current = true;
		onAdd?.();
	}, [onAdd]);
	const moveTab = useCallback(
		(id: string, target: string, after: boolean) => {
			const ids = reorderTabs(
				tabs.map((entry) => entry.id),
				id,
				target,
				after
			);
			commitOrder(ids, id);
		},
		[tabs, commitOrder]
	);
	const keyDown = useCallback(
		(event: KeyboardEvent<HTMLButtonElement>) => {
			const { id } = event.currentTarget.dataset;
			if (!id || tabs.find((tab) => tab.id === id)?.disabled) {
				return;
			}
			if (event.key === "Delete" || event.key === "Backspace") {
				event.preventDefault();
				closeTab(id);
			}
			if (!(onReorder && event.altKey && event.shiftKey)) {
				return;
			}
			const direction =
				Number(event.key === "ArrowRight") - Number(event.key === "ArrowLeft");
			if (direction === 0) {
				return;
			}
			event.preventDefault();
			const target = tabs[tabs.findIndex((tab) => tab.id === id) + direction];
			if (target) {
				moveTab(id, target.id, direction > 0);
			}
		},
		[tabs, closeTab, moveTab, onReorder]
	);

	return (
		<div className="mac-tab-strip">
			<Tabs.List
				activateOnFocus
				aria-label={label}
				className="mac-tab-list"
				ref={list}
				tabIndex={-1}
			>
				{tabs.map((tab) => (
					<div
						className="mac-tab-item"
						data-selected={tab.id === value || undefined}
						data-tab-id={tab.id}
						key={tab.id}
						role="presentation"
					>
						<Tabs.Tab
							aria-keyshortcuts={
								[
									onClose &&
										tab.closable !== false &&
										!tab.disabled &&
										"Delete Backspace",
									onReorder &&
										!tab.disabled &&
										"Alt+Shift+ArrowLeft Alt+Shift+ArrowRight",
								]
									.filter(Boolean)
									.join(" ") || undefined
							}
							className="mac-tab"
							data-id={tab.id}
							data-reorderable={Boolean(onReorder) || undefined}
							disabled={tab.disabled}
							onKeyDown={keyDown}
							onLostPointerCapture={drag.cancel}
							onPointerCancel={drag.cancel}
							onPointerDown={drag.start}
							onPointerMove={drag.move}
							onPointerUp={drag.finish}
							value={tab.id}
						>
							<span className="mac-tab-label">{tab.label}</span>
						</Tabs.Tab>
						{onClose && tab.closable !== false && !tab.disabled ? (
							<button
								aria-label={`Close ${tab.label}`}
								className="mac-tab-close"
								data-id={tab.id}
								onClick={closeClick}
								tabIndex={-1}
								type="button"
							>
								<WindowSymbol name="close" size={12} />
							</button>
						) : null}
					</div>
				))}
			</Tabs.List>
			{overflow ? (
				<div className="mac-tab-overflow" ref={overflowControl}>
					<MacMenuButton
						items={tabs.map((tab) => ({
							checked: tab.id === value,
							closeOnClick: true,
							disabled: tab.disabled,
							id: tab.id,
							label: tab.label,
						}))}
						onAction={onValueChange}
						trigger={
							<button
								aria-label="All tabs"
								className="mac-tab-action"
								type="button"
							>
								<WindowSymbol name="chevron-down" size={12} />
							</button>
						}
					/>
				</div>
			) : null}
			{onAdd ? (
				<button
					aria-label="New tab"
					className="mac-tab-action"
					onClick={addTab}
					ref={add}
					type="button"
				>
					<WindowSymbol name="plus" size={14} />
				</button>
			) : null}
			<span aria-live="polite" className="mac-tab-announcement">
				{announcement}
			</span>
		</div>
	);
}

export function MacTabs({
	tabs,
	value,
	onValueChange,
	variant = "document",
	label = "Views",
	...actions
}: MacTabsProps) {
	const handleValueChange = useCallback(
		(next: unknown) => {
			if (typeof next === "string") {
				onValueChange(next);
			}
		},
		[onValueChange]
	);
	return (
		<Tabs.Root
			className="mac-tabs"
			data-variant={variant}
			onValueChange={handleValueChange}
			value={value || null}
		>
			{variant === "document" ? (
				<DocumentTabStrip
					{...actions}
					label={label}
					onValueChange={onValueChange}
					tabs={tabs}
					value={value}
				/>
			) : (
				<Tabs.List activateOnFocus aria-label={label} className="mac-tab-list">
					{tabs.map((tab) => (
						<Tabs.Tab
							className="mac-tab"
							disabled={tab.disabled}
							key={tab.id}
							value={tab.id}
						>
							{tab.label}
						</Tabs.Tab>
					))}
				</Tabs.List>
			)}
			{tabs.map((tab) => (
				<Tabs.Panel className="mac-tab-panel" key={tab.id} value={tab.id}>
					{tab.content}
				</Tabs.Panel>
			))}
		</Tabs.Root>
	);
}
