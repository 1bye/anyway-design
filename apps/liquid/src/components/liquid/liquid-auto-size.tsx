"use client";

import { type ReactNode, useLayoutEffect, useRef, useState } from "react";
import { useReducedMotion } from "./use-reduced-motion";

export function LiquidAutoSize({
	children,
	duration = 240,
	block = false,
}: {
	children: ReactNode;
	duration?: number;
	block?: boolean;
}) {
	const content = useRef<HTMLSpanElement>(null);
	const [size, setSize] = useState<{ width: number; height: number } | null>(
		null
	);
	const reduced = useReducedMotion();
	useLayoutEffect(() => {
		const element = content.current;
		if (element === null) {
			return;
		}
		const measure = () => {
			const { width, height } = element.getBoundingClientRect();
			if (!(width && height)) {
				return;
			}
			setSize((current) =>
				current?.width === width && current.height === height
					? current
					: { height, width }
			);
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(element);
		return () => observer.disconnect();
	}, []);
	return (
		<span
			data-liquid-size=""
			style={{
				display: block ? "block" : "inline-flex",
				height: size?.height,
				overflow: "clip",
				transition: reduced
					? "none"
					: `width ${duration}ms cubic-bezier(.2,.8,.2,1), height ${duration}ms cubic-bezier(.2,.8,.2,1)`,
				verticalAlign: "middle",
				width: block ? "100%" : size?.width,
			}}
		>
			<span
				ref={content}
				style={{
					alignItems: "center",
					display: block ? "block" : "inline-flex",
					flexShrink: 0,
					gap: "inherit",
					justifyContent: "center",
					whiteSpace: block ? undefined : "nowrap",
					width: block ? "100%" : "max-content",
				}}
			>
				{children}
			</span>
		</span>
	);
}
