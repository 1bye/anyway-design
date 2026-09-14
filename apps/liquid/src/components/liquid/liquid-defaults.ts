import { createContext } from "react";
import type {
	LiquidMenuGeometry,
	LiquidMenuMotion,
} from "./liquid-menu-config";

export const LiquidDefaults = createContext<{
	geometry: Partial<LiquidMenuGeometry>;
	motion: Partial<LiquidMenuMotion>;
}>({ geometry: {}, motion: {} });

export function liquidTiming(duration: number): Partial<LiquidMenuMotion> {
	return {
		closeDurationMs: duration * 0.75,
		contentDelayMs: duration / 2,
		contentDurationMs: duration / 2,
		openDurationMs: duration,
		submenuCloseDurationMs: (duration * 2) / 3,
		submenuContentDelayMs: duration * 0.375,
		submenuOpenDurationMs: (duration * 5) / 6,
	};
}
