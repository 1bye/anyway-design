// biome-ignore-all lint/performance/noJsxPropsBind: Small palette controls capture the current item and filter.
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
	type CatalogEntry,
	ICON_FILTERS,
	type IconFilter,
	loadIconCatalog,
	matchesIconSearch,
	searchIcons,
} from "../lib/icons";
import { BLOCK_KINDS, type PlanNode } from "../lib/plan";
import { BLOCKS, BlockIcon, blockColor } from "./block-node";

export const BLOCK_DRAG_TYPE = "application/x-anyway-plan-block";
const PAGE_SIZE = 32;
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
	// biome-ignore lint/correctness/useExhaustiveDependencies: retry explicitly reruns a failed catalog request.
	useEffect(() => {
		if (!active) {
			return;
		}
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
		load();
		return () => {
			cancelled = true;
		};
	}, [active, retry]);
	const items = useMemo(() => {
		const local = filter === "All" ? basics : [];
		const filtered = local.filter((item) =>
			matchesIconSearch(
				`${item.label} ${BLOCKS[item.kind].detail}`.toLowerCase(),
				query
			)
		);
		if (
			(filter === "All" || filter === "Cloudflare") &&
			matchesIconSearch("cloudflare r2 object storage bucket", query)
		) {
			filtered.push(r2);
		}
		return [
			...filtered,
			...searchIcons(catalog, query, filter).map(catalogBlock),
		];
	}, [catalog, query, filter]);
	const pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
	const currentPage = Math.min(page, pageCount - 1);
	const visible = items.slice(
		currentPage * PAGE_SIZE,
		(currentPage + 1) * PAGE_SIZE
	);
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
			<div className="block-palette" id="block-palette">
				<div className="palette-search">
					<Search aria-hidden="true" size={15} />
					<input
						aria-label="Search icons"
						autoComplete="off"
						onChange={(event) => {
							setQuery(event.target.value);
							setPage(0);
						}}
						placeholder="Search services, brands, icons…"
						type="search"
						value={query}
					/>
					<button
						aria-label="Close icon library"
						className="palette-close"
						onClick={dismiss}
						type="button"
					>
						<X aria-hidden="true" size={14} />
					</button>
				</div>
				<fieldset aria-label="Icon providers" className="palette-filters">
					{ICON_FILTERS.map((group) => (
						<button
							aria-pressed={filter === group}
							key={group}
							onClick={() => {
								setFilter(group);
								setPage(0);
							}}
							type="button"
						>
							{group}
						</button>
					))}
				</fieldset>
				<fieldset
					aria-label="Icon results"
					className="palette-results"
					key={`${query}:${filter}:${currentPage}`}
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
							<BlockIcon data={data} size={26} />
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
				<div className="palette-footer">
					<span aria-live="polite">
						{catalog.length || error
							? `${items.length.toLocaleString()} icons`
							: "Loading library…"}
					</span>
					{error ? (
						<button onClick={() => setRetry(retry + 1)} type="button">
							Couldn't load icons. Retry
						</button>
					) : (
						<a
							href="https://github.com/glincker/thesvg"
							rel="noopener noreferrer"
							target="_blank"
						>
							Icons by theSVG
						</a>
					)}
					<div className="palette-pages">
						<button
							aria-label="Previous icons"
							disabled={currentPage === 0}
							onClick={() => setPage(currentPage - 1)}
							type="button"
						>
							<ChevronLeft aria-hidden="true" size={14} />
						</button>
						<span>
							{currentPage + 1} / {pageCount}
						</span>
						<button
							aria-label="Next icons"
							disabled={currentPage + 1 === pageCount}
							onClick={() => setPage(currentPage + 1)}
							type="button"
						>
							<ChevronRight aria-hidden="true" size={14} />
						</button>
					</div>
				</div>
			</div>
		</aside>
	);
}
