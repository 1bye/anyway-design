/** biome-ignore-all lint/performance/noJsxPropsBind: Settings bind stable caller-owned section and row IDs. */
/** biome-ignore-all lint/suspicious/noUnnecessaryConditions: Pending navigation refs change between independent UI events. */
import {
	type CSSProperties,
	type KeyboardEvent,
	type ReactNode,
	useId,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { MacSearchField } from "./controls";
import {
	type MacSettingsItem,
	type MacSettingsMatch,
	type MacSettingsSection,
	normalizeSettingsQuery,
	type SettingsHistory,
	searchSettings,
	settingsItemKey,
	stepSettingsHistory,
} from "./settings-model";
import { MacWindow, type TrafficLightsProps } from "./window";
import { WindowSidebar } from "./window-sidebar";
import { WindowSymbol } from "./window-symbol";

export type {
	MacSettingsGroup,
	MacSettingsItem,
	MacSettingsSection,
} from "./settings-model";

export interface MacSettingsProps extends TrafficLightsProps {
	className?: string;
	defaultSearchQuery?: string;
	defaultSection?: string;
	emptySearchMessage?: ReactNode;
	onSearchQueryChange?: (query: string) => void;
	onSectionChange?: (id: string) => void;
	open?: boolean;
	searchable?: boolean;
	searchPlaceholder?: string;
	searchQuery?: string;
	sections: readonly MacSettingsSection[];
	selectedSection?: string;
	sidebarFooter?: ReactNode;
	sidebarHeader?: ReactNode;
	sidebarWidth?: number;
	style?: CSSProperties;
	title?: string;
}
const FOCUSABLE =
	"input:not([type='hidden']):not(:disabled),button:not(:disabled):not([aria-disabled='true']),select:not(:disabled),textarea:not(:disabled),[tabindex='0']:not(:disabled):not([aria-disabled='true'])";

function sidebarTarget(
	event: KeyboardEvent<HTMLElement>,
	root: HTMLElement | null
) {
	if (
		!(
			event.target instanceof HTMLButtonElement &&
			event.target.matches(".mac-sidebar-item")
		) ||
		event.altKey ||
		event.ctrlKey ||
		event.metaKey ||
		event.shiftKey
	) {
		return;
	}
	const buttons = Array.from(
		root?.querySelectorAll<HTMLButtonElement>(".mac-sidebar-item") ?? []
	);
	const index = buttons.indexOf(event.target);
	if (index < 0) {
		return;
	}
	const positions: Record<string, number> = {
		ArrowDown: Math.min(buttons.length - 1, index + 1),
		ArrowUp: Math.max(0, index - 1),
		End: buttons.length - 1,
		Home: 0,
	};
	return buttons[positions[event.key]];
}

function SettingsRowContent({ item }: { item: MacSettingsItem }) {
	return (
		<>
			{item.icon ? (
				<span aria-hidden className="mac-settings-row-icon">
					{item.icon}
				</span>
			) : null}
			<div className="mac-settings-row-copy">
				<span>{item.label}</span>
				{item.description ? <p>{item.description}</p> : null}
			</div>
			{item.sectionId === undefined ? (
				<div className="mac-settings-row-control">{item.control}</div>
			) : (
				<WindowSymbol name="chevron-right" size={12} />
			)}
		</>
	);
}
function SettingsPage({
	section,
	visible,
	registerRow,
	onNavigate,
	sectionIds,
}: {
	section: MacSettingsSection;
	visible: boolean;
	registerRow: (key: string, node: HTMLElement | null) => void;
	onNavigate: (id: string) => void;
	sectionIds: readonly string[];
}) {
	const pageId = useId();
	return (
		<section
			aria-labelledby={pageId}
			className="mac-settings-page"
			data-header={section.header ?? "summary"}
			hidden={!visible}
		>
			<header className="mac-settings-page-header">
				{section.icon ? (
					<span aria-hidden className="mac-settings-page-icon">
						{section.icon}
					</span>
				) : null}
				<h2 id={pageId}>{section.title}</h2>
				{section.description ? <p>{section.description}</p> : null}
			</header>
			{section.groups.map((group) => (
				<section
					aria-label={group.title}
					className="mac-settings-group"
					key={group.id}
				>
					{group.title ? <h3>{group.title}</h3> : null}
					<div className="mac-settings-card">
						{group.items.map((item) => {
							const ref = (node: HTMLElement | null) =>
								registerRow(
									settingsItemKey(section.id, group.id, item.id),
									node
								);
							if (item.sectionId !== undefined) {
								const destination = item.sectionId;
								return (
									<button
										aria-label={item.label}
										className="mac-settings-row"
										data-navigation
										disabled={!sectionIds.includes(destination)}
										key={item.id}
										onClick={() => onNavigate(destination)}
										ref={ref}
										type="button"
									>
										<SettingsRowContent item={item} />
									</button>
								);
							}
							return (
								<fieldset
									aria-label={item.label}
									className="mac-settings-row"
									key={item.id}
									ref={ref}
									tabIndex={-1}
								>
									<SettingsRowContent item={item} />
								</fieldset>
							);
						})}
					</div>
					{group.description ? (
						<p className="mac-settings-group-note">{group.description}</p>
					) : null}
				</section>
			))}
		</section>
	);
}

function SettingsSearchResults({
	matches,
	query,
	emptySearchMessage,
	onSelect,
}: {
	matches: readonly MacSettingsMatch[];
	query: string;
	emptySearchMessage?: ReactNode;
	onSelect: (match: MacSettingsMatch) => void;
}) {
	return (
		<section
			aria-label="Settings search results"
			className="mac-settings-results"
		>
			<header className="mac-settings-results-header">
				<h2>Search results</h2>
				<p aria-live="polite">
					{matches.length} {matches.length === 1 ? "setting" : "settings"} found
					for “{query.trim()}”
				</p>
			</header>
			{matches.length ? (
				<div className="mac-settings-card">
					{matches.map((match) => (
						<button
							className="mac-settings-result"
							key={settingsItemKey(
								match.sectionId,
								match.groupId,
								match.item.id
							)}
							onClick={() => onSelect(match)}
							type="button"
						>
							<span>
								<strong>{match.item.label}</strong>
								<span className="mac-settings-result-path">
									{match.sectionTitle}
									{match.groupTitle ? ` › ${match.groupTitle}` : ""}
								</span>
								{match.item.description ? (
									<span className="mac-settings-result-description">
										{match.item.description}
									</span>
								) : null}
							</span>
							<WindowSymbol name="chevron-right" size={12} />
						</button>
					))}
				</div>
			) : (
				<div className="mac-settings-empty">
					<WindowSymbol name="search" size={32} />
					<h3>No settings found</h3>
					<p>{emptySearchMessage ?? "Try a different name or keyword."}</p>
				</div>
			)}
		</section>
	);
}

export function MacSettings({
	sections,
	title = "Settings",
	defaultSection,
	selectedSection,
	onSectionChange,
	searchable = true,
	searchQuery,
	defaultSearchQuery = "",
	onSearchQueryChange,
	searchPlaceholder = "Search",
	emptySearchMessage,
	sidebarHeader,
	sidebarFooter,
	sidebarWidth = 224,
	className = "",
	style,
	...windowActions
}: MacSettingsProps) {
	const [internalSection, setSection] = useState(defaultSection);
	const [internalQuery, setQuery] = useState(defaultSearchQuery);
	const [history, setHistory] = useState<SettingsHistory>({
		back: [],
		forward: [],
	});
	const currentId = selectedSection ?? internalSection;
	const current =
		sections.find((section) => section.id === currentId) ?? sections[0];
	const query = searchQuery ?? internalQuery;
	const searching = searchable && Boolean(normalizeSettingsQuery(query));
	const matches = searching ? searchSettings(sections, query) : [];
	const search = useRef<HTMLInputElement | null>(null);
	const navigation = useRef<HTMLDivElement | null>(null);
	const rows = useRef(new Map<string, HTMLElement>());
	const pending = useRef<MacSettingsMatch | null>(null);
	const updateQuery = (value: string) => {
		if (searchQuery === undefined) {
			setQuery(value);
		}
		onSearchQueryChange?.(value);
	};
	const sectionIds = sections.map((section) => section.id);
	const selectSection = (id: string, record = true) => {
		if (!sectionIds.includes(id) || id === current?.id) {
			return;
		}
		if (record && current) {
			setHistory((prior) => ({
				back: [...prior.back, current.id],
				forward: [],
			}));
		}
		if (selectedSection === undefined) {
			setSection(id);
		}
		onSectionChange?.(id);
	};
	const navigate = (id: string, record = true) => {
		pending.current = null;
		updateQuery("");
		selectSection(id, record);
	};
	const previous = stepSettingsHistory(
		history,
		"back",
		sectionIds,
		current?.id ?? ""
	);
	const next = stepSettingsHistory(
		history,
		"forward",
		sectionIds,
		current?.id ?? ""
	);
	const travel = (step: typeof previous) => {
		if (!step) {
			return;
		}
		setHistory(step.history);
		navigate(step.id, false);
	};
	const openResult = (match: MacSettingsMatch) => {
		pending.current = match;
		selectSection(match.sectionId);
		updateQuery("");
	};
	useLayoutEffect(() => {
		const match = pending.current;
		if (!match || searching || match.sectionId !== current?.id) {
			return;
		}
		const row = rows.current.get(
			settingsItemKey(match.sectionId, match.groupId, match.item.id)
		);
		if (!row) {
			pending.current = null;
			return;
		}
		row.scrollIntoView({ block: "nearest" });
		(row.querySelector<HTMLElement>(FOCUSABLE) ?? row).focus({
			preventScroll: true,
		});
		pending.current = null;
	}, [current?.id, searching]);
	const keyDown = (event: KeyboardEvent<HTMLElement>) => {
		if (event.defaultPrevented || event.nativeEvent.isComposing) {
			return;
		}
		if (
			searchable &&
			(event.metaKey || event.ctrlKey) &&
			!event.altKey &&
			!event.shiftKey &&
			event.key.toLowerCase() === "f"
		) {
			event.preventDefault();
			search.current?.focus();
			search.current?.select();
			return;
		}
		if (event.key === "Escape" && searching) {
			event.preventDefault();
			updateQuery("");
			search.current?.focus();
			return;
		}
		const button = sidebarTarget(event, navigation.current);
		if (button?.dataset.id) {
			event.preventDefault();
			navigate(button.dataset.id);
			button.focus();
		}
	};
	const safeWidth = Number.isFinite(sidebarWidth)
		? Math.max(150, Math.min(300, sidebarWidth))
		: 224;
	return (
		<section
			aria-hidden={windowActions.open === false ? true : undefined}
			aria-label={title}
			className={`mac-settings ${className}`}
			data-header={searching ? "toolbar" : (current?.header ?? "summary")}
			data-open={windowActions.open !== false}
			inert={windowActions.open === false}
			onKeyDown={keyDown}
			style={style}
		>
			<MacWindow
				{...windowActions}
				sidebar={
					<div className="mac-settings-sidebar">
						{searchable ? (
							<MacSearchField
								aria-label={searchPlaceholder}
								onSearch={() => matches[0] && openResult(matches[0])}
								onValueChange={updateQuery}
								placeholder={searchPlaceholder}
								ref={search}
								value={query}
							/>
						) : null}
						{sidebarHeader ? (
							<div className="mac-settings-sidebar-header">{sidebarHeader}</div>
						) : null}
						<div className="mac-settings-navigation" ref={navigation}>
							<WindowSidebar
								groups={[
									{
										id: "sections",
										items: sections.map((section) => ({
											icon: section.icon,
											id: section.id,
											label: section.title,
										})),
									},
								]}
								label={`${title} sections`}
								onSelect={navigate}
								selected={searching ? undefined : current?.id}
							/>
						</div>
						{sidebarFooter ? (
							<div className="mac-settings-sidebar-footer">{sidebarFooter}</div>
						) : null}
					</div>
				}
				sidebarWidth={safeWidth}
				style={
					{
						"--mac-window-sidebar-width": `min(${safeWidth}px, 40%)`,
					} as CSSProperties
				}
				title={searching ? "Search" : (current?.title ?? title)}
				toolbarLeading={
					<fieldset
						aria-label="Settings history"
						className="mac-settings-history"
					>
						<button
							aria-label="Back"
							disabled={!previous}
							onClick={() => travel(previous)}
							type="button"
						>
							<WindowSymbol name="chevron-left" size={20} />
						</button>
						<button
							aria-label="Forward"
							disabled={!next}
							onClick={() => travel(next)}
							type="button"
						>
							<WindowSymbol name="chevron-right" size={20} />
						</button>
					</fieldset>
				}
			>
				<div className="mac-settings-pages">
					{sections.map((section) => (
						<SettingsPage
							key={section.id}
							onNavigate={navigate}
							registerRow={(key, node) => {
								if (node) {
									rows.current.set(key, node);
								} else {
									rows.current.delete(key);
								}
							}}
							section={section}
							sectionIds={sectionIds}
							visible={!searching && current?.id === section.id}
						/>
					))}
					{searching ? (
						<SettingsSearchResults
							emptySearchMessage={emptySearchMessage}
							matches={matches}
							onSelect={openResult}
							query={query}
						/>
					) : null}
					{current ? null : (
						<div className="mac-settings-empty">
							<h2>No settings</h2>
							<p>Add a section to get started.</p>
						</div>
					)}
				</div>
			</MacWindow>
		</section>
	);
}
