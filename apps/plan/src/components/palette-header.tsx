// biome-ignore-all lint/performance/noJsxPropsBind: These controls capture the current provider or input value.
import { animate } from "animejs";
import {
	ArrowLeft,
	ArrowUpRight,
	ChevronLeft,
	ChevronRight,
	Info,
	Search,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ICON_FILTERS, ICON_REVISION, type IconFilter } from "../lib/icons";
import { BLOCK_KINDS } from "../lib/plan";

function duration(milliseconds: number): number {
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches
		? 0
		: milliseconds;
}

function IconLibraryInfo({
	catalogCount,
	error,
	onRetry,
}: {
	catalogCount: number;
	error: boolean;
	onRetry: () => void;
}) {
	const [infoOpen, setInfoOpen] = useState(false);
	const dialogRef = useRef<HTMLDialogElement>(null);
	const infoButtonRef = useRef<HTMLButtonElement>(null);
	const motion = useRef<ReturnType<typeof animate> | null>(null);
	useEffect(
		() => () => {
			motion.current?.cancel();
		},
		[]
	);
	function open() {
		const dialog = dialogRef.current;
		// biome-ignore lint/suspicious/noUnnecessaryConditions: React assigns this nullable DOM ref after rendering.
		if (!dialog) {
			return;
		}
		motion.current?.cancel();
		setInfoOpen(true);
		dialog.showModal();
		motion.current = animate(dialog, {
			duration: duration(220),
			ease: "out(3)",
			opacity: [0, 1],
			scale: [0.98, 1],
			translateY: [12, 0],
		});
	}
	function close() {
		const dialog = dialogRef.current;
		// biome-ignore lint/suspicious/noUnnecessaryConditions: React assigns this nullable DOM ref after rendering.
		if (!dialog) {
			return;
		}
		motion.current?.cancel();
		motion.current = animate(dialog, {
			duration: duration(140),
			ease: "out(2)",
			onComplete: () => {
				dialog.close();
				infoButtonRef.current?.focus({ preventScroll: true });
				setInfoOpen(false);
			},
			opacity: 0,
			scale: 0.98,
			translateY: 8,
		});
	}
	return (
		<>
			<button
				aria-haspopup="dialog"
				aria-label="About the icon library"
				className="palette-icon-button"
				onClick={open}
				ref={infoButtonRef}
				title="About the icon library"
				type="button"
			>
				<Info aria-hidden="true" size={16} />
			</button>
			{/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: The native dialog isolates keyboard events from canvas shortcuts and supports backdrop dismissal. */}
			<dialog
				aria-labelledby="icon-library-title"
				className="palette-info"
				data-active={infoOpen}
				onCancel={(event) => {
					event.preventDefault();
					close();
				}}
				onClick={(event) => {
					if (event.target !== event.currentTarget) {
						return;
					}
					const bounds = event.currentTarget.getBoundingClientRect();
					if (
						event.clientX < bounds.left ||
						event.clientX > bounds.right ||
						event.clientY < bounds.top ||
						event.clientY > bounds.bottom
					) {
						close();
					}
				}}
				onKeyDown={(event) => event.stopPropagation()}
				ref={dialogRef}
			>
				<h2 id="icon-library-title">Icon library</h2>
				<p className="palette-info-count">
					{catalogCount || error
						? (catalogCount + BLOCK_KINDS.length + 1).toLocaleString()
						: "…"}
					<span> icons</span>
				</p>
				<p className="palette-info-description">
					Service icons, brand marks, and the basics for your next plan.
				</p>
				<div className="palette-info-sources">
					<a
						href="https://github.com/glincker/thesvg"
						rel="noopener noreferrer"
						target="_blank"
					>
						<span>
							theSVG
							<small>
								{catalogCount
									? `${catalogCount.toLocaleString()} service & brand icons`
									: "Service & brand icon catalog"}
							</small>
						</span>
						<ArrowUpRight aria-hidden="true" size={16} />
					</a>
					<a
						href="https://lucide.dev/icons/"
						rel="noopener noreferrer"
						target="_blank"
					>
						<span>
							Lucide<small>{BLOCK_KINDS.length} basic blocks</small>
						</span>
						<ArrowUpRight aria-hidden="true" size={16} />
					</a>
					<a
						href="https://github.com/cloudflare/cloudflare-docs/blob/356ad209f77739171478e7633584ad20cb3f5552/src/icons/r2.svg"
						rel="noopener noreferrer"
						target="_blank"
					>
						<span>
							Cloudflare<small>R2 storage icon</small>
						</span>
						<ArrowUpRight aria-hidden="true" size={16} />
					</a>
				</div>
				{error ? (
					<div className="palette-info-error" role="status">
						<p>The icon catalog couldn’t be loaded.</p>
						<button onClick={onRetry} type="button">
							Retry loading
						</button>
					</div>
				) : null}
				<p className="palette-info-note">
					Artwork belongs to its respective owners.{" "}
					<a
						href={`https://github.com/glincker/thesvg/blob/${ICON_REVISION}/LICENSING.md`}
						rel="noopener noreferrer"
						target="_blank"
					>
						Source licenses
					</a>
				</p>
				<button className="palette-info-done" onClick={close} type="button">
					Done
				</button>
			</dialog>
		</>
	);
}

export function PaletteHeader({
	catalogCount,
	error,
	onRetry,
	query,
	onQueryChange,
	filter,
	onFilterChange,
	page,
	pageCount,
	onPageChange,
}: {
	catalogCount: number;
	error: boolean;
	onRetry: () => void;
	query: string;
	onQueryChange: (query: string) => void;
	filter: IconFilter;
	onFilterChange: (filter: IconFilter) => void;
	page: number;
	pageCount: number;
	onPageChange: (page: number) => void;
}) {
	const [searchOpen, setSearchOpen] = useState(false);
	const searchRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const filtersRef = useRef<HTMLFieldSetElement>(null);
	const toggleRef = useRef<HTMLButtonElement>(null);
	useEffect(() => {
		const search = searchRef.current;
		const tabs = filtersRef.current;
		// biome-ignore lint/suspicious/noUnnecessaryConditions: React assigns these nullable DOM refs after rendering.
		if (!(search && tabs)) {
			return;
		}
		const searchMotion = animate(search, {
			clipPath: searchOpen
				? "inset(0% 0% 0% 0% round 9px)"
				: "inset(0% 100% 0% 0% round 9px)",
			duration: duration(240),
			ease: "out(3)",
			opacity: searchOpen ? 1 : 0,
		});
		const tabsMotion = animate(tabs, {
			duration: duration(180),
			ease: "out(3)",
			opacity: searchOpen ? 0 : 1,
			translateY: searchOpen ? -4 : 0,
		});
		if (searchOpen) {
			inputRef.current?.focus({ preventScroll: true });
		}
		return () => {
			searchMotion.cancel();
			tabsMotion.cancel();
		};
	}, [searchOpen]);
	function closeSearch() {
		toggleRef.current?.focus({ preventScroll: true });
		setSearchOpen(false);
		onQueryChange("");
		onPageChange(0);
	}
	function toggleSearch() {
		if (searchOpen) {
			closeSearch();
		} else {
			setSearchOpen(true);
		}
	}
	return (
		<div className="palette-header">
			<button
				aria-controls="palette-search-input"
				aria-expanded={searchOpen}
				aria-label={searchOpen ? "Back to providers" : "Search icon library"}
				className="palette-icon-button palette-search-toggle"
				onClick={toggleSearch}
				ref={toggleRef}
				title={searchOpen ? "Back to providers (Esc)" : "Search icons"}
				type="button"
			>
				{searchOpen ? (
					<ArrowLeft aria-hidden="true" size={16} />
				) : (
					<Search aria-hidden="true" size={16} />
				)}
			</button>
			<div className="palette-header-content">
				<fieldset
					aria-hidden={searchOpen}
					aria-label="Icon providers"
					className="palette-filters"
					inert={searchOpen}
					ref={filtersRef}
				>
					{ICON_FILTERS.map((group) => (
						<button
							aria-pressed={filter === group}
							key={group}
							onClick={() => {
								onFilterChange(group);
								onPageChange(0);
							}}
							type="button"
						>
							{group}
						</button>
					))}
				</fieldset>
				<div
					aria-hidden={!searchOpen}
					className="palette-search"
					data-open={searchOpen}
					inert={!searchOpen}
					ref={searchRef}
				>
					<input
						aria-label="Search icons"
						autoComplete="off"
						id="palette-search-input"
						onChange={(event) => {
							onQueryChange(event.target.value);
							onPageChange(0);
						}}
						onKeyDown={(event) => {
							if (event.key === "Escape") {
								event.preventDefault();
								event.stopPropagation();
								closeSearch();
							}
						}}
						placeholder={
							filter === "All"
								? "Search services, brands, icons…"
								: `Search ${filter} icons…`
						}
						ref={inputRef}
						type="search"
						value={query}
					/>
				</div>
			</div>
			<div className="palette-header-actions">
				<IconLibraryInfo
					catalogCount={catalogCount}
					error={error}
					onRetry={onRetry}
				/>
				<div className="palette-pages">
					<button
						aria-label="Previous icons"
						disabled={page === 0}
						onClick={() => onPageChange(page - 1)}
						type="button"
					>
						<ChevronLeft aria-hidden="true" size={14} />
					</button>
					<span aria-atomic="true" aria-live="polite">
						{page + 1} / {pageCount}
					</span>
					<button
						aria-label="Next icons"
						disabled={page + 1 === pageCount}
						onClick={() => onPageChange(page + 1)}
						type="button"
					>
						<ChevronRight aria-hidden="true" size={14} />
					</button>
				</div>
			</div>
		</div>
	);
}
