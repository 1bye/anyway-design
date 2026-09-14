"use client";

import { useCallback, useState } from "react";
import {
	LiquidContextMenu,
	LiquidContextMenuContent,
	LiquidContextMenuTrigger,
} from "../liquid/liquid-context-menu";
import { LiquidMenuItem } from "../liquid/liquid-menu";
import { LiquidProvider } from "../liquid/liquid-provider";

export default function ContextMenuExample() {
	const [copies, setCopies] = useState(0);
	const duplicate = useCallback(() => setCopies((count) => count + 1), []);
	return (
		<LiquidProvider>
			<LiquidContextMenu>
				<LiquidContextMenuTrigger>
					<button className="liquid-card" type="button">
						Untitled idea
						{copies ? ` · ${copies} ${copies === 1 ? "copy" : "copies"}` : ""}
					</button>
				</LiquidContextMenuTrigger>
				<LiquidContextMenuContent>
					<LiquidMenuItem onClick={duplicate}>Duplicate</LiquidMenuItem>
				</LiquidContextMenuContent>
			</LiquidContextMenu>
		</LiquidProvider>
	);
}
