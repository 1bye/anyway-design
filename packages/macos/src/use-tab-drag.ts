import {
	type PointerEvent,
	type RefObject,
	useCallback,
	useLayoutEffect,
	useRef,
} from "react";
import { type TabSlot, tabDragLayout } from "./tab-order";

interface DragSlot extends TabSlot {
	element: HTMLElement;
}
interface TabDrag {
	id: string;
	moved: boolean;
	order: string[];
	originOffset: number;
	scale: number;
	scroll: number;
	slots: DragSlot[];
	x: number;
}

const SETTLE_DURATION = 180;
const SETTLE_EASING = "cubic-bezier(0.2, 0.8, 0.2, 1)";

function reducedMotion(element: HTMLElement) {
	return (
		element.closest("[data-reduce-motion]") !== null ||
		window.matchMedia("(prefers-reduced-motion: reduce)").matches
	);
}

function settleTab(element: HTMLElement, from: number) {
	if (Math.abs(from) < 0.5 || reducedMotion(element)) {
		return;
	}
	element.animate(
		[{ transform: `translateX(${from}px)` }, { transform: "translateX(0)" }],
		{
			duration: SETTLE_DURATION,
			easing: SETTLE_EASING,
		}
	);
}

function settlePositions(list: HTMLDivElement, positions: Map<string, number>) {
	const scale = list.getBoundingClientRect().width / list.offsetWidth;
	const elements = [...list.querySelectorAll<HTMLElement>(".mac-tab-item")];
	list.removeAttribute("data-dragging");
	for (const element of elements) {
		for (const animation of element.getAnimations()) {
			animation.cancel();
		}
		element.style.removeProperty("transform");
		element.removeAttribute("data-dragging");
	}
	for (const element of elements) {
		const previous = positions.get(element.dataset.tabId ?? "");
		if (previous !== undefined) {
			settleTab(
				element,
				(previous - element.getBoundingClientRect().left) / scale
			);
		}
	}
}

export function useTabDrag(
	list: RefObject<HTMLDivElement | null>,
	tabs: readonly { id: string }[],
	onReorder: ((order: string[], id: string) => void) | undefined
) {
	const drag: RefObject<TabDrag | null> = useRef(null);
	const pending: RefObject<Map<string, number> | null> = useRef(null);
	const frame: RefObject<number | null> = useRef(null);
	const cancel = useCallback(() => {
		const { current } = drag;
		if (!current) {
			return;
		}
		drag.current = null;
		if (list.current) {
			const positions = new Map(
				current.slots.map((slot) => [
					slot.id,
					slot.element.getBoundingClientRect().left,
				])
			);
			settlePositions(list.current, positions);
		}
	}, [list]);

	// Committing the controlled order changes layout; animate from the last visible drag position.
	// biome-ignore lint/correctness/useExhaustiveDependencies: The controlled tab order must be committed before measuring its final layout.
	useLayoutEffect(() => {
		const positions = pending.current;
		pending.current = null;
		if (positions && list.current) {
			settlePositions(list.current, positions);
		} else {
			cancel();
		}
	}, [tabs, list, cancel]);

	useLayoutEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape" && drag.current) {
				event.preventDefault();
				cancel();
			}
		};
		const document = list.current?.ownerDocument;
		document?.addEventListener("keydown", handleEscape);
		return () => {
			document?.removeEventListener("keydown", handleEscape);
			if (frame.current !== null) {
				cancelAnimationFrame(frame.current);
			}
		};
	}, [cancel, list]);

	const start = useCallback(
		(event: PointerEvent<HTMLButtonElement>) => {
			const element = list.current;
			const { id } = event.currentTarget.dataset;
			if (
				!(element && id && onReorder) ||
				event.button !== 0 ||
				event.currentTarget.getAttribute("aria-disabled") === "true"
			) {
				return;
			}
			const viewport = element.getBoundingClientRect();
			const scale = viewport.width / element.offsetWidth;
			const items = [...element.querySelectorAll<HTMLElement>(".mac-tab-item")];
			const visible = new Map(
				items.map((item) => [
					item.dataset.tabId,
					item.getBoundingClientRect().left,
				])
			);
			for (const item of items) {
				for (const animation of item.getAnimations()) {
					animation.cancel();
				}
			}
			const slots = items.map((item) => {
				const rect = item.getBoundingClientRect();
				return {
					element: item,
					id: item.dataset.tabId ?? "",
					left: (rect.left - viewport.left) / scale + element.scrollLeft,
					width: rect.width / scale,
				};
			});
			let originOffset = 0;
			for (const slot of slots) {
				const offset =
					((visible.get(slot.id) ?? slot.element.getBoundingClientRect().left) -
						slot.element.getBoundingClientRect().left) /
					scale;
				slot.element.style.transform = `translateX(${offset}px)`;
				if (slot.id === id) {
					originOffset = offset;
				}
			}
			drag.current = {
				id,
				moved: false,
				order: slots.map((slot) => slot.id),
				originOffset,
				scale,
				scroll: element.scrollLeft,
				slots,
				x: event.clientX,
			};
			event.currentTarget.setPointerCapture(event.pointerId);
		},
		[list, onReorder]
	);
	const move = useCallback(
		(event: PointerEvent<HTMLButtonElement>) => {
			const { current } = drag;
			const element = list.current;
			if (
				!(current && element) ||
				(!current.moved && Math.abs(event.clientX - current.x) < 4)
			) {
				return;
			}
			event.preventDefault();
			current.moved = true;
			element.setAttribute("data-dragging", "");
			const viewport = element.getBoundingClientRect();
			if (event.clientX < viewport.left + 24) {
				element.scrollLeft -= 12;
			} else if (event.clientX > viewport.right - 24) {
				element.scrollLeft += 12;
			}
			const layout = tabDragLayout(
				current.slots,
				current.id,
				(event.clientX - current.x) / current.scale +
					current.originOffset +
					element.scrollLeft -
					current.scroll
			);
			current.order = layout.order;
			for (const slot of current.slots) {
				slot.element.toggleAttribute("data-dragging", slot.id === current.id);
				slot.element.style.transform = `translateX(${layout.offsets.get(slot.id) ?? 0}px)`;
			}
		},
		[list]
	);
	const finish = useCallback(
		(event: PointerEvent<HTMLButtonElement>) => {
			move(event);
			const { current } = drag;
			const viewport = list.current?.getBoundingClientRect();
			if (
				!(current?.moved && viewport) ||
				event.clientY < viewport.top ||
				event.clientY > viewport.bottom
			) {
				cancel();
				return;
			}
			if (current.order.every((id, index) => id === current.slots[index]?.id)) {
				cancel();
				return;
			}
			const positions = new Map(
				current.slots.map((slot) => [
					slot.id,
					slot.element.getBoundingClientRect().left,
				])
			);
			pending.current = positions;
			drag.current = null;
			onReorder?.(current.order, current.id);
			// A controlled parent may decline the reorder; restore its current layout before the next paint.
			frame.current = requestAnimationFrame(() => {
				if (pending.current === positions && list.current) {
					pending.current = null;
					settlePositions(list.current, positions);
				}
				frame.current = null;
			});
		},
		[cancel, list, move, onReorder]
	);
	return { cancel, finish, move, start };
}
