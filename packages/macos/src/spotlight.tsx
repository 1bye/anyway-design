/** biome-ignore-all lint/performance/noJsxPropsBind: Search results bind caller-owned item IDs. */
import { Dialog } from "@base-ui/react/dialog";
import { useId, useRef, useState } from "react";
import { useMacOSPortal } from "./environment";
import {
	type MacSpotlightCategory,
	type MacSpotlightItem,
	spotlightMatches,
} from "./menu-bar-status-model";
import { WindowSymbol, type WindowSymbolName } from "./window-symbol";

export type { MacSpotlightItem } from "./menu-bar-status-model";

const CATEGORIES: {
	id: MacSpotlightCategory;
	label: string;
	symbol: WindowSymbolName;
}[] = [
	{ id: "applications", label: "Applications", symbol: "applications" },
	{ id: "files", label: "Files", symbol: "folder" },
	{ id: "actions", label: "Actions", symbol: "layers" },
	{ id: "clipboard", label: "Clipboard", symbol: "copy" },
];
export interface MacSpotlightProps {
	items: readonly MacSpotlightItem[];
	onOpenChange: (open: boolean) => void;
	onSelect?: (item: MacSpotlightItem) => void;
	open: boolean;
}
function SpotlightSearch({
	items,
	onSelect,
}: {
	items: readonly MacSpotlightItem[];
	onSelect: (item: MacSpotlightItem) => void;
}) {
	const [query, setQuery] = useState("");
	const [category, setCategory] = useState<MacSpotlightCategory | "all">("all");
	const [index, setIndex] = useState(0);
	const id = useId();
	const input = useRef<HTMLInputElement>(null);
	const results = spotlightMatches(items, query, category);
	const expanded = Boolean(query.trim() || category !== "all");
	const selected = Math.min(index, Math.max(0, results.length - 1));
	return (
		<>
			<div className="mac-spotlight-bar">
				<div className="mac-spotlight-search">
					<WindowSymbol name="search" size={26} />
					<input
						aria-activedescendant={
							expanded && results.length ? `${id}-${selected}` : undefined
						}
						aria-autocomplete="list"
						aria-controls={`${id}-results`}
						aria-expanded={expanded}
						aria-label="Spotlight Search"
						autoComplete="off"
						onChange={(event) => {
							setQuery(event.target.value);
							setIndex(0);
						}}
						onKeyDown={(event) => {
							if (event.nativeEvent.isComposing) {
								return;
							}
							if (event.key === "ArrowDown" || event.key === "ArrowUp") {
								event.preventDefault();
								setIndex((current) =>
									Math.max(
										0,
										Math.min(
											results.length - 1,
											current + (event.key === "ArrowDown" ? 1 : -1)
										)
									)
								);
							}
							if (event.key === "Enter" && expanded && results[selected]) {
								event.preventDefault();
								onSelect(results[selected]);
							}
						}}
						placeholder="Spotlight Search"
						ref={input}
						role="combobox"
						value={query}
					/>
				</div>
				{CATEGORIES.map((entry) => (
					<button
						aria-label={entry.label}
						aria-pressed={category === entry.id}
						className="mac-spotlight-category"
						key={entry.id}
						onClick={() => {
							setCategory(category === entry.id ? "all" : entry.id);
							input.current?.focus();
							setIndex(0);
						}}
						type="button"
					>
						<WindowSymbol name={entry.symbol} size={26} />
					</button>
				))}
			</div>
			<div
				aria-label="Search results"
				className="mac-spotlight-results"
				hidden={!expanded}
				id={`${id}-results`}
				role="listbox"
			>
				{results.length ? (
					results.map((item, position) => (
						<button
							aria-selected={selected === position}
							className="mac-spotlight-result"
							id={`${id}-${position}`}
							key={item.id}
							onClick={() => onSelect(item)}
							role="option"
							tabIndex={-1}
							type="button"
						>
							<span className="mac-spotlight-result-icon">
								{item.icon ?? (
									<WindowSymbol
										name={
											CATEGORIES.find((entry) => entry.id === item.category)
												?.symbol ?? "document"
										}
										size={24}
									/>
								)}
							</span>
							<span>
								<strong>{item.label}</strong>
								{item.subtitle ? <small>{item.subtitle}</small> : null}
							</span>
							<span aria-hidden className="mac-spotlight-return">
								↩
							</span>
						</button>
					))
				) : (
					<p>No results</p>
				)}
			</div>
		</>
	);
}
export function MacSpotlight({
	items,
	open,
	onOpenChange,
	onSelect,
}: MacSpotlightProps) {
	const container = useMacOSPortal();
	return (
		<Dialog.Root onOpenChange={onOpenChange} open={open}>
			<Dialog.Portal container={container}>
				<Dialog.Backdrop className="mac-spotlight-backdrop" />
				<Dialog.Popup
					aria-label="Spotlight"
					className="mac-spotlight"
					initialFocus={() =>
						container?.current?.querySelector<HTMLInputElement>(
							".mac-spotlight input"
						) ?? null
					}
				>
					<SpotlightSearch
						items={items}
						onSelect={(item) => {
							onSelect?.(item);
							onOpenChange(false);
						}}
					/>
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
