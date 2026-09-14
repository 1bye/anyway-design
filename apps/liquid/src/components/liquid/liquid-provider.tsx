"use client";
import "./liquid.css";

import type { ReactElement, ReactNode } from "react";
import { use, useCallback, useMemo, useState } from "react";
import { LiquidDefaults, liquidTiming } from "./liquid-defaults";
import { addLiquidMenuLayer, removeLiquidMenuLayer } from "./liquid-menu-stack";
import { LiquidShortcutProvider } from "./liquid-shortcut";
import {
	LiquidMenuStackContext,
	type LiquidMenuStackContextValue,
} from "./use-liquid-menu-stack";

interface LiquidProviderProps {
	readonly children: ReactNode;
	readonly dim?: number;
	readonly duration?: number;
	readonly radius?: number;
	readonly shortcuts?: { delay?: number; reveal?: "hold-mod" };
	readonly softness?: number;
}

export function LiquidProvider({
	children,
	softness,
	radius,
	duration,
	dim,
	shortcuts,
}: LiquidProviderProps): ReactElement {
	const parent = use(LiquidDefaults);
	const defaults = useMemo(
		() => ({
			geometry: {
				...parent.geometry,
				...(softness === undefined ? {} : { blendRadius: softness }),
				...(radius === undefined ? {} : { menuRadius: radius }),
			},
			motion: {
				...parent.motion,
				...(duration === undefined ? {} : liquidTiming(duration)),
				...(dim === undefined ? {} : { backdropOpacity: dim }),
			},
		}),
		[parent, softness, radius, duration, dim]
	);
	const [layerIds, setLayerIds] = useState<readonly string[]>([]);
	const showLayer = useCallback((layerId: string): void => {
		setLayerIds((currentLayerIds) =>
			addLiquidMenuLayer(currentLayerIds, layerId)
		);
	}, []);
	const hideLayer = useCallback((layerId: string): void => {
		setLayerIds((currentLayerIds) =>
			removeLiquidMenuLayer(currentLayerIds, layerId)
		);
	}, []);
	const context = useMemo<LiquidMenuStackContextValue>(
		() => ({
			hideLayer,
			layerIds,
			showLayer,
		}),
		[hideLayer, layerIds, showLayer]
	);

	return (
		<LiquidMenuStackContext value={context}>
			<LiquidDefaults value={defaults}>
				<LiquidShortcutProvider delay={shortcuts?.delay}>
					{children}
				</LiquidShortcutProvider>
			</LiquidDefaults>
		</LiquidMenuStackContext>
	);
}
