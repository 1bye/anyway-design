import { type RefObject, useLayoutEffect } from "react";
import { dockFitScale } from "./dock-math";

export function useDockFit(
	root: RefObject<HTMLElement | null>,
	area: RefObject<HTMLDivElement | null>,
	{
		adaptive,
		itemCount,
		magnification,
		size,
		vertical,
	}: {
		adaptive: boolean;
		itemCount: number;
		magnification: number;
		size: number;
		vertical: boolean;
	}
) {
	useLayoutEffect(() => {
		const node = root.current;
		const container = area.current;
		if (!(node && container)) {
			return;
		}
		const fit = () => {
			const style = getComputedStyle(node);
			const width = Number.parseFloat(style.width);
			const height = Number.parseFloat(style.height);
			const length = vertical ? height : width;
			const depth = vertical ? width : height;
			const edge = Number.parseFloat(style.getPropertyValue("--dock-edge-gap"));
			const scale = adaptive
				? dockFitScale({
						availableDepth:
							(vertical ? container.clientWidth : container.clientHeight) -
							edge -
							8,
						availableLength:
							(vertical ? container.clientHeight : container.clientWidth) - 16,
						depth,
						itemCount,
						length,
						magnification,
						size,
					})
				: 1;
			node.style.setProperty("--dock-fit", String(scale));
			node.style.setProperty(
				"--dock-hide-distance",
				`${depth * scale + edge + 8}px`
			);
			container.style.setProperty(
				"--dock-reveal-length",
				`${length * scale}px`
			);
		};
		const observer = new ResizeObserver(fit);
		observer.observe(container);
		observer.observe(node);
		fit();
		return () => observer.disconnect();
	}, [adaptive, area, itemCount, magnification, root, size, vertical]);
}

export function useDockAutoHide(
	root: RefObject<HTMLElement | null>,
	area: RefObject<HTMLDivElement | null>,
	reveal: RefObject<HTMLButtonElement | null>,
	{
		autoHide,
		hideDelay,
		revealDelay,
	}: {
		autoHide: boolean;
		hideDelay: number;
		revealDelay: number;
	}
) {
	useLayoutEffect(() => {
		const node = root.current;
		const container = area.current;
		const trigger = reveal.current;
		if (!(node && container)) {
			return;
		}
		const setHidden = (hidden: boolean) => {
			node.toggleAttribute("data-hidden", hidden);
			node.inert = hidden;
			trigger?.setAttribute("aria-expanded", String(!hidden));
		};
		if (!(autoHide && trigger)) {
			setHidden(false);
			return;
		}
		let timer = 0;
		const cancel = () => window.clearTimeout(timer);
		const hasKeyboardFocus = () =>
			Boolean(container.querySelector(":focus-visible"));
		const show = () => {
			cancel();
			setHidden(false);
		};
		const enterEdge = (event: PointerEvent) => {
			if (event.pointerType !== "touch") {
				cancel();
				timer = window.setTimeout(show, revealDelay);
			}
		};
		const hide = () => {
			cancel();
			timer = window.setTimeout(() => {
				if (
					!(
						node.matches(":hover") ||
						trigger.matches(":hover") ||
						hasKeyboardFocus()
					)
				) {
					setHidden(true);
				}
			}, hideDelay);
		};
		const blur = (event: FocusEvent) => {
			if (
				!(
					event.relatedTarget instanceof Node &&
					container.contains(event.relatedTarget)
				)
			) {
				hide();
			}
		};
		setHidden(!hasKeyboardFocus());
		node.addEventListener("pointerenter", show);
		node.addEventListener("pointerleave", hide);
		node.addEventListener("pointercancel", hide);
		trigger.addEventListener("pointerenter", enterEdge);
		trigger.addEventListener("pointerleave", hide);
		trigger.addEventListener("click", show);
		container.addEventListener("focusin", show);
		container.addEventListener("focusout", blur);
		return () => {
			cancel();
			node.removeEventListener("pointerenter", show);
			node.removeEventListener("pointerleave", hide);
			node.removeEventListener("pointercancel", hide);
			trigger.removeEventListener("pointerenter", enterEdge);
			trigger.removeEventListener("pointerleave", hide);
			trigger.removeEventListener("click", show);
			container.removeEventListener("focusin", show);
			container.removeEventListener("focusout", blur);
		};
	}, [area, autoHide, hideDelay, reveal, revealDelay, root]);
}
