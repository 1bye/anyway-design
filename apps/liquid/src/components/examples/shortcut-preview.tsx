"use client";

import { useCallback, useState } from "react";
import { LiquidProvider } from "../liquid/liquid-provider";
import {
	LiquidShortcut,
	LiquidShortcutToggle,
	type ShortcutSide,
} from "../liquid/liquid-shortcut";

export default function ShortcutPreviewExample({
	side = "top",
	offset = 8,
	delay = 300,
}: {
	side?: ShortcutSide;
	offset?: number;
	delay?: number;
}) {
	const [count, setCount] = useState(0);
	const [searching, setSearching] = useState(false);
	const create = useCallback(() => setCount((value) => value + 1), []);
	const search = useCallback(() => setSearching((value) => !value), []);
	return (
		<LiquidProvider shortcuts={{ delay }}>
			<div className="shortcut-demo">
				<LiquidShortcutToggle />
				<div className="shortcut-actions">
					<LiquidShortcut keys="mod+alt+n" offset={offset} side={side}>
						<button className="liquid-card" onClick={create} type="button">
							New idea
						</button>
					</LiquidShortcut>
					<LiquidShortcut keys="mod+alt+f" offset={offset} side={side}>
						<button className="liquid-card" onClick={search} type="button">
							Search
						</button>
					</LiquidShortcut>
				</div>
				{searching ? (
					<input aria-label="Search ideas" placeholder="Search ideas…" />
				) : null}
				<p className="shortcut-instruction">Hold ⌘ on Mac or Ctrl on Windows</p>
				<output>
					{count ? `${count} ${count === 1 ? "idea" : "ideas"} created` : ""}
				</output>
			</div>
		</LiquidProvider>
	);
}
