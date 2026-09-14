"use client";

import { type ChangeEvent, useCallback, useState } from "react";
import { LiquidProvider } from "../liquid/liquid-provider";
import {
	LiquidShortcut,
	LiquidShortcutToggle,
	type ShortcutSide,
} from "../liquid/liquid-shortcut";

export default function ShortcutPreviewExample() {
	const [side, setSide] = useState<ShortcutSide>("top");
	const [offset, setOffset] = useState(8);
	const changeSide = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
		const { value } = event.target;
		if (
			value === "top" ||
			value === "bottom" ||
			value === "left" ||
			value === "right"
		) {
			setSide(value);
		}
	}, []);
	const changeOffset = useCallback(
		(event: ChangeEvent<HTMLInputElement>) =>
			setOffset(event.target.valueAsNumber),
		[]
	);
	const [count, setCount] = useState(0);
	const [searching, setSearching] = useState(false);
	const create = useCallback(() => setCount((value) => value + 1), []);
	const search = useCallback(() => setSearching((value) => !value), []);
	return (
		<LiquidProvider>
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
				<div className="shortcut-placement">
					<label>
						Position{" "}
						<select onChange={changeSide} value={side}>
							<option value="top">Top</option>
							<option value="bottom">Bottom</option>
							<option value="left">Left</option>
							<option value="right">Right</option>
						</select>
					</label>
					<label>
						Spacing{" "}
						<input
							aria-label="Shortcut spacing"
							max={24}
							min={4}
							onChange={changeOffset}
							type="range"
							value={offset}
						/>{" "}
						<span>{offset}px</span>
					</label>
				</div>
				<output>
					{count ? `${count} ${count === 1 ? "idea" : "ideas"} created` : ""}
				</output>
			</div>
		</LiquidProvider>
	);
}
