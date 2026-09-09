// biome-ignore-all lint/performance/noJsxPropsBind: Small palette controls capture the current item and filter.
import { useEffect, useMemo, useRef, useState } from "react";
import {
	type CatalogEntry,
	createIconMatcher,
	type IconFilter,
	loadIconCatalog,
	searchIcons,
} from "../lib/icons";
import { createPageScroll, PALETTE_ROWS, paletteColumns } from "../lib/palette";
import { BLOCK_KINDS, type PlanNode } from "../lib/plan";
import { BLOCKS, BlockIcon, blockColor } from "./block-node";
import { PaletteHeader } from "./palette-header";

export const BLOCK_DRAG_TYPE = "application/x-anyway-plan-block";
const basics: PlanNode["data"][] = BLOCK_KINDS.map((kind) => ({
	detail: "",
	kind,
	label: BLOCKS[kind].label,
}));
const r2: PlanNode["data"] = {
	detail: "",
	kind: "storage",
	label: "Cloudflare R2",
	service: "r2",
};

function catalogBlock(entry: CatalogEntry): PlanNode["data"] {
	return {
		detail: "",
		icon: {
			color: entry.color,
			label: entry.label,
			slug: entry.slug,
			variant: entry.variant,
		},
		kind: entry.groups.includes("Databases") ? "database" : "external",
		label: entry.label,
	};
}

export function BlockDock({
	addBlock,
}: {
	addBlock: (data: PlanNode["data"]) => void;
}) {
	const [active, setActive] = useState(
		() => window.matchMedia("(hover: none)").matches
	);
	const [dismissed, setDismissed] = useState(false);
	const [dragging, setDragging] = useState(false);
	const [query, setQuery] = useState("");
	const [filter, setFilter] = useState<IconFilter>("All");
	const [page, setPage] = useState(0);
	const [catalog, setCatalog] = useState<CatalogEntry[]>([]);
	const [error, setError] = useState(false);
	const [retry, setRetry] = useState(0);
	const [columns, setColumns] = useState(1);
	const resultsRef = useRef<HTMLFieldSetElement>(null);
	const paletteRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const results = resultsRef.current;
		// biome-ignore lint/suspicious/noUnnecessaryConditions: React populates this nullable DOM ref after rendering.
		if (!results) {
			return;
		}
		const observer = new ResizeObserver(([entry]) => {
			if (entry) {
				setColumns(paletteColumns(entry.contentRect.width));
			}
		});
		observer.observe(results);
		return () => observer.disconnect();
	}, []);
	// biome-ignore lint/correctness/useExhaustiveDependencies: retry explicitly reruns a failed catalog request.
	useEffect(() => {
		let cancelled = false;
		async function load() {
			setError(false);
			try {
				const entries = await loadIconCatalog();
				if (!cancelled) {
					setCatalog(entries);
				}
			} catch {
				if (!cancelled) {
					setError(true);
				}
			}
		}
		// Warm the library shortly after mount; opening the dock loads it immediately.
		const timer = window.setTimeout(load, active ? 0 : 200);
		return () => {
			cancelled = true;
			window.clearTimeout(timer);
		};
	}, [active, retry]);
	const items = useMemo(() => {
		const matchesQuery = createIconMatcher(query);
		const local = filter === "All" ? basics : [];
		const filtered = local.filter((item) =>
			matchesQuery(`${item.label} ${BLOCKS[item.kind].detail}`.toLowerCase())
		);
		if (
			(filter === "All" || filter === "Cloudflare") &&
			matchesQuery("cloudflare r2 object storage bucket")
		) {
			filtered.push(r2);
		}
		return [...filtered, ...searchIcons(catalog, query, filter)];
	}, [catalog, query, filter]);
	const pageSize = columns * PALETTE_ROWS;
	const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
	const currentPage = Math.min(page, pageCount - 1);
	const visible = useMemo(
		() =>
			items
				.slice(currentPage * pageSize, (currentPage + 1) * pageSize)
				.map((item) => ("slug" in item ? catalogBlock(item) : item)),
		[items, currentPage, pageSize]
	);
	useEffect(() => {
		const palette = paletteRef.current;
		// biome-ignore lint/suspicious/noUnnecessaryConditions: React populates this nullable DOM ref after rendering.
		if (!palette) {
			return;
		}
		const pageScroll = createPageScroll();
		function handleWheel(event: WheelEvent) {
			if (
				event.ctrlKey ||
				(event.target instanceof Element && event.target.closest("dialog")) ||
				(event.target instanceof Element &&
					event.target.closest(".palette-filters") &&
					Math.abs(event.deltaX) > Math.abs(event.deltaY))
			) {
				return;
			}
			event.preventDefault();
			event.stopPropagation();
			const direction = pageScroll(event);
			if (direction) {
				setPage((previous) =>
					Math.max(
						0,
						Math.min(
							pageCount - 1,
							Math.min(previous, pageCount - 1) + direction
						)
					)
				);
			}
		}
		palette.addEventListener("wheel", handleWheel, { passive: false });
		return () => palette.removeEventListener("wheel", handleWheel);
	}, [pageCount]);
	function activate() {
		setActive(true);
		setDismissed(false);
	}
	function dismiss() {
		setDismissed(true);
	}
	return (
		// biome-ignore lint/a11y/noNoninteractiveElementInteractions: The region delegates focus and Escape from its native controls and preloads on pointer entry.
		<aside
			aria-label="Block library"
			className="block-dock"
			data-dismissed={dismissed}
			data-dragging={dragging}
			onFocus={activate}
			onKeyDown={(event) => {
				if (event.key === "Escape") {
					event.currentTarget
						.querySelector<HTMLButtonElement>(".dock-trigger")
						?.focus();
					dismiss();
				}
			}}
			onPointerEnter={activate}
		>
			<button
				aria-controls="block-palette"
				aria-label="Show blocks"
				className="dock-trigger"
				onClick={activate}
				type="button"
			>
				<span />
			</button>
			<div className="block-palette" id="block-palette" ref={paletteRef}>
				<PaletteHeader
					catalogCount={catalog.length}
					error={error}
					filter={filter}
					onFilterChange={setFilter}
					onPageChange={setPage}
					onQueryChange={setQuery}
					onRetry={() => setRetry(retry + 1)}
					page={currentPage}
					pageCount={pageCount}
					query={query}
				/>
				<fieldset
					aria-label="Icon results"
					className="palette-results"
					ref={resultsRef}
					style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
				>
					{visible.map((data) => (
						<button
							aria-label={`Add ${data.label} block`}
							className="palette-item"
							draggable
							key={data.icon?.slug ?? data.service ?? data.kind}
							onClick={(event) => {
								addBlock(data);
								if (event.detail > 0) {
									event.currentTarget.blur();
								}
							}}
							onDragEnd={() => setDragging(false)}
							onDragStart={(event) => {
								event.dataTransfer.setData(
									BLOCK_DRAG_TYPE,
									JSON.stringify(data)
								);
								event.dataTransfer.effectAllowed = "copy";
								setDragging(true);
								event.currentTarget.blur();
							}}
							style={blockColor(data)}
							title={data.label}
							type="button"
						>
							<BlockIcon data={data} loading="eager" size={26} />
							<span className="sr-only">{data.label}</span>
						</button>
					))}
					{visible.length === 0 ? (
						<p className="palette-empty">
							{catalog.length || error
								? "No icons found. Try another name or filter."
								: "Loading icons…"}
						</p>
					) : null}
				</fieldset>
			</div>
		</aside>
	);
}
