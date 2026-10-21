/** biome-ignore-all lint/performance/noJsxPropsBind: Status controls bind their small, caller-owned state. */
import { Popover } from "@base-ui/react/popover";
import { type CSSProperties, type ReactNode, useState } from "react";
import { MacSwitch } from "./controls";
import { useMacOSPortal } from "./environment";
import {
	DEFAULT_SYSTEM_STATUS,
	type MacSpotlightItem,
	type MacSystemStatus,
	type MacWiFiNetwork,
	normalizeSystemStatus,
	statusPercent,
} from "./menu-bar-status-model";
import { MacSpotlight } from "./spotlight";
import { WindowSymbol, type WindowSymbolName } from "./window-symbol";

export type {
	MacSpotlightItem,
	MacSystemStatus,
	MacWiFiNetwork,
} from "./menu-bar-status-model";
export interface MacMenuBarStatusProps {
	clock?: string;
	defaultValue?: Partial<MacSystemStatus>;
	mediaTitle?: string;
	networks?: readonly MacWiFiNetwork[];
	onAction?: (id: string) => void;
	onSearchSelect?: (item: MacSpotlightItem) => void;
	onValueChange?: (value: MacSystemStatus) => void;
	searchItems?: readonly MacSpotlightItem[];
	showBatteryPercentage?: boolean;
	value?: MacSystemStatus;
}
type StatusPanel = "battery" | "wifi" | "control-center";
export function MacBatteryIcon({
	level,
	charging = false,
	lowPowerMode = false,
}: {
	charging?: boolean;
	level: number;
	lowPowerMode?: boolean;
}) {
	const charge = statusPercent(level);
	return (
		<span
			aria-hidden
			className="mac-battery-icon"
			data-charging={charging || undefined}
			data-low={charge <= 20 || undefined}
			data-power-saving={lowPowerMode || undefined}
		>
			<WindowSymbol
				name={charging ? "battery-charging" : "battery-empty"}
				size={26}
			/>
			{charging ? null : (
				<span
					className="mac-battery-charge"
					style={{ "--battery-charge": charge / 100 } as CSSProperties}
				>
					<WindowSymbol name="battery-fill" size={26} />
				</span>
			)}
		</span>
	);
}
function StatusPopover({
	id,
	label,
	trigger,
	children,
	panel,
	onPanelChange,
	className = "",
}: {
	children: ReactNode;
	className?: string;
	id: StatusPanel;
	label: string;
	onPanelChange: (value: StatusPanel | null) => void;
	panel: StatusPanel | null;
	trigger: ReactNode;
}) {
	const container = useMacOSPortal();
	return (
		<Popover.Root
			onOpenChange={(open) => {
				if (open) {
					onPanelChange(id);
				} else if (panel === id) {
					onPanelChange(null);
				}
			}}
			open={panel === id}
		>
			<Popover.Trigger aria-label={label} className="mac-menu-status-button">
				{trigger}
			</Popover.Trigger>
			<Popover.Portal container={container}>
				<Popover.Positioner
					align="end"
					alignOffset={id === "control-center" ? -137 : 0}
					className="mac-system-positioner"
					collisionAvoidance={{
						align: "shift",
						fallbackAxisSide: "none",
						side: "none",
					}}
					collisionPadding={8}
					side="bottom"
					sideOffset={5}
				>
					{id === "control-center" ? (
						<div aria-hidden className="mac-control-backdrop">
							<span />
							<span />
							<span />
							<span />
							<span />
						</div>
					) : null}
					<Popover.Popup
						aria-label={label}
						className={`mac-system-panel ${className}`}
					>
						{children}
					</Popover.Popup>
				</Popover.Positioner>
			</Popover.Portal>
		</Popover.Root>
	);
}
function ControlTile({
	symbol,
	title,
	subtitle,
	active,
	onClick,
	className = "",
}: {
	active?: boolean;
	className?: string;
	onClick: () => void;
	subtitle?: string;
	symbol: WindowSymbolName;
	title: string;
}) {
	return (
		<button
			aria-label={title}
			aria-pressed={active}
			className={`mac-control-tile ${className}`}
			data-enabled={active || undefined}
			onClick={onClick}
			type="button"
		>
			<span className="mac-control-tile-icon">
				<WindowSymbol name={symbol} size={25} />
			</span>
			<span>
				<strong>{title}</strong>
				{subtitle ? <small>{subtitle}</small> : null}
			</span>
		</button>
	);
}
function SystemSlider({
	label,
	symbol,
	value,
	onChange,
}: {
	label: string;
	onChange: (value: number) => void;
	symbol: WindowSymbolName;
	value: number;
}) {
	return (
		<label className="mac-control-slider">
			<strong>{label}</strong>
			<span>
				<WindowSymbol name={symbol} />
				<input
					aria-label={label}
					max={100}
					min={0}
					onChange={(event) => onChange(Number(event.target.value))}
					style={{ "--system-slider-value": `${value}%` } as CSSProperties}
					type="range"
					value={value}
				/>
				<WindowSymbol name={symbol} size={23} />
			</span>
		</label>
	);
}
function WiFiNetworkRow({
	item,
	selected,
	onSelect,
}: {
	item: MacWiFiNetwork;
	onSelect: (id: string | null) => void;
	selected: string | null;
}) {
	return (
		<button
			aria-pressed={selected === item.id}
			className="mac-network-row"
			onClick={() => onSelect(selected === item.id ? null : item.id)}
			type="button"
		>
			<span
				className="mac-network-symbol"
				data-connected={selected === item.id}
			>
				<WindowSymbol name="wifi" size={19} />
			</span>
			<span>{item.name}</span>
			{item.secured ? <WindowSymbol name="lock" size={15} /> : null}
		</button>
	);
}
function WiFiNetworks({
	networks,
	selected,
	onSelect,
}: {
	networks: readonly MacWiFiNetwork[];
	onSelect: (id: string | null) => void;
	selected: string | null;
}) {
	const [expanded, setExpanded] = useState(false);
	const known = networks.filter((network) => network.known !== false);
	const others = networks.filter((network) => network.known === false);
	return (
		<>
			<p className="mac-system-section">Known Networks</p>
			{known.length ? null : (
				<p className="mac-system-secondary">No known networks</p>
			)}
			{known.map((item) => (
				<WiFiNetworkRow
					item={item}
					key={item.id}
					onSelect={onSelect}
					selected={selected}
				/>
			))}
			<button
				aria-expanded={expanded}
				className="mac-system-settings"
				onClick={() => setExpanded(!expanded)}
				type="button"
			>
				<WindowSymbol
					name={expanded ? "chevron-down" : "chevron-right"}
					size={12}
				/>{" "}
				Other Networks
			</button>
			{expanded
				? others.map((item) => (
						<WiFiNetworkRow
							item={item}
							key={item.id}
							onSelect={onSelect}
							selected={selected}
						/>
					))
				: null}
			{expanded && !others.length ? (
				<p className="mac-system-secondary">No other networks found</p>
			) : null}
		</>
	);
}
const EMPTY_NETWORKS: readonly MacWiFiNetwork[] = [];
const EMPTY_SEARCH: readonly MacSpotlightItem[] = [];
export function MacMenuBarStatus({
	value,
	defaultValue,
	onValueChange,
	onAction,
	onSearchSelect,
	networks = EMPTY_NETWORKS,
	searchItems = EMPTY_SEARCH,
	showBatteryPercentage = false,
	clock = "Tue Apr 1  9:41 AM",
	mediaTitle,
}: MacMenuBarStatusProps) {
	const [internal, setInternal] = useState(() =>
		normalizeSystemStatus({ ...DEFAULT_SYSTEM_STATUS, ...defaultValue })
	);
	const [panel, setPanel] = useState<StatusPanel | null>(null);
	const [spotlight, setSpotlight] = useState(false);

	const state = normalizeSystemStatus(value ?? internal);
	const update = (changes: Partial<MacSystemStatus>) => {
		const next = normalizeSystemStatus({ ...state, ...changes });
		if (value === undefined) {
			setInternal(next);
		}
		onValueChange?.(next);
	};
	const action = (id: string) => {
		setPanel(null);
		onAction?.(id);
	};
	const network = networks.find((item) => item.id === state.networkId);
	return (
		<>
			{/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: Toolbar keyboard events move focus among its native buttons. */}
			<div
				aria-label="System status"
				className="mac-system-status"
				onKeyDown={(event) => {
					if (
						!(
							event.target instanceof Element &&
							event.target.closest(".mac-menu-status-button") &&
							["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
						)
					) {
						return;
					}
					const buttons = [
						...event.currentTarget.querySelectorAll<HTMLButtonElement>(
							".mac-menu-status-button"
						),
					];
					const current = buttons.indexOf(
						event.target.closest<HTMLButtonElement>("button") ?? buttons[0]
					);
					let next =
						(current + (event.key === "ArrowLeft" ? -1 : 1) + buttons.length) %
						buttons.length;
					if (event.key === "Home") {
						next = 0;
					}
					if (event.key === "End") {
						next = buttons.length - 1;
					}
					event.preventDefault();
					buttons[next]?.focus();
				}}
				role="toolbar"
			>
				{state.focus ? (
					<button
						aria-label="Do Not Disturb is on"
						className="mac-menu-status-button"
						onClick={() => setPanel("control-center")}
						type="button"
					>
						<WindowSymbol name="focus" size={17} />
					</button>
				) : null}
				<StatusPopover
					id="battery"
					label={`Battery: ${state.batteryLevel}%${state.batteryCharging ? ", charging" : ""}`}
					onPanelChange={setPanel}
					panel={panel}
					trigger={
						<>
							{showBatteryPercentage ? (
								<span>{state.batteryLevel}%</span>
							) : null}
							<MacBatteryIcon
								charging={state.batteryCharging}
								level={state.batteryLevel}
								lowPowerMode={state.lowPowerMode}
							/>
						</>
					}
				>
					<div className="mac-system-heading">
						<strong>Battery</strong>
						<span>{state.batteryLevel}%</span>
					</div>
					<p className="mac-system-secondary">
						Power Source: {state.batteryCharging ? "Power Adapter" : "Battery"}
					</p>
					<div className="mac-system-divider" />
					<MacSwitch
						checked={state.lowPowerMode}
						label="Low Power Mode"
						onCheckedChange={(checked) => update({ lowPowerMode: checked })}
						size="small"
					/>
					<button
						className="mac-system-settings"
						onClick={() => action("battery-settings")}
						type="button"
					>
						Battery Settings…
					</button>
				</StatusPopover>
				<StatusPopover
					id="wifi"
					label="Wi-Fi"
					onPanelChange={setPanel}
					panel={panel}
					trigger={
						<WindowSymbol name={state.wifi ? "wifi" : "wifi-off"} size={20} />
					}
				>
					<div className="mac-system-heading">
						<strong>Wi-Fi</strong>
						<MacSwitch
							checked={state.wifi}
							label="Wi-Fi"
							onCheckedChange={(checked) => update({ wifi: checked })}
							size="small"
						/>
					</div>
					{state.wifi ? (
						<WiFiNetworks
							networks={networks}
							onSelect={(networkId) => update({ networkId })}
							selected={state.networkId}
						/>
					) : (
						<p className="mac-system-secondary">Wi-Fi is off</p>
					)}
					<button
						className="mac-system-settings"
						onClick={() => action("wifi-settings")}
						type="button"
					>
						Wi-Fi Settings…
					</button>
				</StatusPopover>
				<button
					aria-haspopup="dialog"
					aria-label="Spotlight"
					className="mac-menu-status-button"
					onClick={() => {
						setPanel(null);
						setSpotlight(true);
					}}
					type="button"
				>
					<WindowSymbol name="search" size={18} />
				</button>
				<StatusPopover
					className="mac-control-center"
					id="control-center"
					label="Control Center"
					onPanelChange={setPanel}
					panel={panel}
					trigger={<WindowSymbol name="control-center" size={19} />}
				>
					<div className="mac-control-grid">
						<ControlTile
							active={state.wifi}
							onClick={() => setPanel("wifi")}
							subtitle={state.wifi ? (network?.name ?? "Not Connected") : "Off"}
							symbol="wifi"
							title="Wi-Fi"
						/>
						<div className="mac-control-playing">
							<span className="mac-control-album">
								<WindowSymbol name="speaker" size={24} />
							</span>
							<strong>{mediaTitle ?? "Not Playing"}</strong>
							<div>
								<button
									aria-label="Previous track"
									disabled={!mediaTitle}
									onClick={() => onAction?.("previous-track")}
									type="button"
								>
									<WindowSymbol name="backward" size={20} />
								</button>
								<button
									aria-label={state.playing ? "Pause" : "Play"}
									disabled={!mediaTitle}
									onClick={() => update({ playing: !state.playing })}
									type="button"
								>
									<WindowSymbol
										name={state.playing ? "pause" : "play"}
										size={26}
									/>
								</button>
								<button
									aria-label="Next track"
									disabled={!mediaTitle}
									onClick={() => onAction?.("next-track")}
									type="button"
								>
									<WindowSymbol name="forward" size={20} />
								</button>
							</div>
						</div>
						<ControlTile
							active={state.bluetooth}
							onClick={() => update({ bluetooth: !state.bluetooth })}
							subtitle={state.bluetooth ? "On" : "Off"}
							symbol="bluetooth"
							title="Bluetooth"
						/>
						<ControlTile
							active={state.airDrop}
							onClick={() => update({ airDrop: !state.airDrop })}
							subtitle={state.airDrop ? "Everyone" : "Receiving Off"}
							symbol="airdrop"
							title="AirDrop"
						/>
						<ControlTile
							className="mac-control-round"
							onClick={() => action("stage-manager")}
							symbol="stage-manager"
							title="Stage Manager"
						/>
						<ControlTile
							className="mac-control-round"
							onClick={() => action("screen-mirroring")}
							symbol="mirroring"
							title="Screen Mirroring"
						/>
						<ControlTile
							className="mac-control-round"
							onClick={() => action("appearance")}
							symbol="appearance"
							title="Appearance"
						/>
						<ControlTile
							className="mac-control-round"
							onClick={() => action("screenshot")}
							symbol="capture"
							title="Screenshot"
						/>
						<ControlTile
							active={state.focus}
							onClick={() => update({ focus: !state.focus })}
							subtitle={state.focus ? "On" : "Off"}
							symbol="focus"
							title="Do Not Disturb"
						/>
						<SystemSlider
							label="Display"
							onChange={(brightness) => update({ brightness })}
							symbol="brightness"
							value={state.brightness}
						/>
						<SystemSlider
							label="Sound"
							onChange={(volume) => update({ volume })}
							symbol="speaker"
							value={state.volume}
						/>
					</div>
					<button
						className="mac-system-settings mac-control-edit"
						onClick={() => action("edit-controls")}
						type="button"
					>
						Edit Controls
					</button>
				</StatusPopover>
				<button
					aria-label="Date and time"
					className="mac-menu-status-button"
					onClick={() => action("notification-center")}
					type="button"
				>
					<span className="mac-menu-clock">{clock}</span>
				</button>
			</div>
			<MacSpotlight
				items={searchItems}
				onOpenChange={setSpotlight}
				onSelect={onSearchSelect}
				open={spotlight}
			/>
		</>
	);
}
