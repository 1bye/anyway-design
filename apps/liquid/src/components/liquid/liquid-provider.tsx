"use client";

import type { ReactElement, ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";
import { addLiquidMenuLayer, removeLiquidMenuLayer } from "./liquid-menu-stack";
import {
	LiquidMenuStackContext,
	type LiquidMenuStackContextValue,
} from "./use-liquid-menu-stack";

interface LiquidProviderProps {
	readonly children: ReactNode;
}

export function LiquidProvider({
	children,
}: LiquidProviderProps): ReactElement {
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
		<LiquidMenuStackContext value={context}>{children}</LiquidMenuStackContext>
	);
}
