import type { CSSProperties } from "react";

const TOKENS = [
	"--liquid-surface",
	"--liquid-outline",
	"--liquid-dim",
	"--popover",
	"--popover-foreground",
	"--border",
	"--accent",
	"--ring",
] as const;

export function readLiquidTheme(element: Element | null): CSSProperties {
	if (!element || typeof getComputedStyle === "undefined") {
		return {};
	}
	const computed = getComputedStyle(element);
	const tokens: Record<string, string> = {};
	for (const token of TOKENS) {
		const value = computed.getPropertyValue(token).trim();
		if (value) {
			tokens[token] = value;
		}
	}
	return tokens;
}
