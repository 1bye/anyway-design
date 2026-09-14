import {
	ArrowDown,
	Check,
	ChevronDown,
	ChevronRight,
	Copy,
	MoreHorizontal,
	Plus,
} from "lucide-react";
import { LIQUID_MENU_CONNECTED_BUTTON_ANCHOR_GEOMETRY } from "./liquid/liquid-menu-config";
import { createLiquidMenuFrame } from "./liquid/liquid-menu-geometry";

const previewFrame = createLiquidMenuFrame(
	{
		anchor: { height: 36, left: 146, top: 12, width: 40 },
		menu: { height: 124, left: 16, top: 52, width: 170 },
		submenu: null,
	},
	{ menu: 1, submenu: 0 },
	LIQUID_MENU_CONNECTED_BUTTON_ANCHOR_GEOMETRY
);

const statusFrame = createLiquidMenuFrame(
	{
		anchor: { height: 36, left: 17, top: 0, width: 134 },
		menu: { height: 116, left: 0, top: 40, width: 168 },
		submenu: null,
	},
	{ menu: 1, submenu: 0 },
	LIQUID_MENU_CONNECTED_BUTTON_ANCHOR_GEOMETRY
);

export function LiquidHero() {
	return (
		<section
			aria-labelledby="liquid-title"
			className="liquid-hero"
			id="introduction"
		>
			<div aria-hidden="true" className="hero-fragment hero-menu">
				<svg className="hero-menu-surface" viewBox="0 0 204 192">
					<title>Connected menu preview</title>
					<path
						d={previewFrame.path}
						transform={`translate(${previewFrame.bounds.left} ${previewFrame.bounds.top})`}
					/>
				</svg>
				<MoreHorizontal className="hero-menu-trigger" size={18} />
				<div className="hero-menu-items">
					<span>
						<Copy size={14} />
						Duplicate<span className="hero-shortcut">⌘D</span>
					</span>
					<span className="hero-highlight">
						<Plus size={14} />
						Move to
						<ChevronRight className="item-trailing" size={14} />
					</span>
					<span>
						<Check size={14} />
						Make it yours
					</span>
				</div>
			</div>
			<div aria-hidden="true" className="hero-fragment hero-status">
				<svg className="hero-menu-surface" viewBox="0 0 168 156">
					<title>Connected status menu preview</title>
					<path
						d={statusFrame.path}
						transform={`translate(${statusFrame.bounds.left} ${statusFrame.bounds.top})`}
					/>
				</svg>
				<div className="hero-status-trigger">
					<span className="status-dot" />
					In progress
					<ChevronDown size={13} />
				</div>
				<div className="hero-status-options">
					<span>
						<span className="status-dot status-dot-outline" />
						To do
					</span>
					<span className="hero-highlight">
						<span className="status-dot" />
						In progress
						<Check className="item-trailing" size={13} />
					</span>
					<span>
						<Check size={13} />
						Done
					</span>
				</div>
			</div>
			<div aria-hidden="true" className="hero-fragment hero-pill">
				<span className="hero-pill-icon">
					<Plus size={15} />
				</span>
				Room for your next idea
			</div>
			<div aria-hidden="true" className="hero-fragment hero-keys">
				<kbd>⌘</kbd>
				<kbd>K</kbd>
				<span>A natural connection.</span>
			</div>
			<div className="hero-copy">
				<span className="eyebrow">A tiny toolkit for shadcn/ui</span>
				<h1 id="liquid-title">
					Interfaces
					<br />
					that flow.
				</h1>
				<p>
					Connected surfaces. Thoughtful motion.
					<br />A little more fluid. Still yours to shape.
				</p>
				<a className="hero-link" href="#examples">
					Explore the components
					<ArrowDown aria-hidden="true" size={14} />
				</a>
			</div>
		</section>
	);
}
