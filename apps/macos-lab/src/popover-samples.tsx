/** biome-ignore-all lint/performance/noJsxPropsBind: Local native fixture controls. */
import { MacCheckbox } from "@anyway-design/macos/checkbox";
import { MacButton } from "@anyway-design/macos/controls";
import { MacPopover, MacPopoverClose } from "@anyway-design/macos/popover";
import { useState } from "react";

export const POPOVER_SIDES = ["bottom", "top", "right", "left"] as const;
export type PopoverSide = (typeof POPOVER_SIDES)[number];
export const POPOVER_FRAMES = {
	bottom: { top: 308, x: 207 },
	left: { top: 197, x: 14 },
	right: { top: 197, x: 400 },
	top: { top: 86, x: 207 },
} as const;

export function PopoverOptions({ onDone }: { onDone?: () => void }) {
	return (
		<>
			<MacCheckbox
				className="popover-options-checkbox"
				label="Show hidden items"
			/>
			<div className="popover-options-footer">
				<MacPopoverClose onClick={onDone}>Done</MacPopoverClose>
			</div>
		</>
	);
}

export function PopoverCanvas({
	side,
	onSideChange,
}: {
	side: PopoverSide;
	onSideChange: (side: PopoverSide) => void;
}) {
	const [open, setOpen] = useState(true);
	return (
		<div className="popover-study-canvas">
			<strong className="popover-study-title">TAHOE / NATIVE APPKIT</strong>
			<p className="popover-study-description">
				NSPopover · bottom, top, right, and left anchors
			</p>
			<div className="popover-study-anchor">
				<MacPopover
					description="Choose how this folder is displayed."
					initialFocus={false}
					onOpenChange={setOpen}
					open={open}
					positionerProps={{
						collisionAvoidance: { align: "none", side: "none" },
						side,
					}}
					title="View Options"
					trigger={<MacButton>Options</MacButton>}
				>
					<PopoverOptions />
				</MacPopover>
			</div>
			{POPOVER_SIDES.map((entry, index) => (
				<MacButton
					className="popover-study-direction"
					key={entry}
					onClick={() => onSideChange(entry)}
					style={{ left: 24 + index * 144 }}
				>
					{entry[0].toUpperCase() + entry.slice(1)}
				</MacButton>
			))}
		</div>
	);
}
