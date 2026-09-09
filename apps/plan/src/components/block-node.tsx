import { Handle, type NodeProps, Position } from "@xyflow/react";
import {
	AppWindow,
	Braces,
	Cloud,
	Database,
	HardDrive,
	Layers2,
	StickyNote,
	Workflow,
} from "lucide-react";
import { memo } from "react";
import type { BlockKind, PlanNode } from "../lib/plan";

export const BLOCKS = {
	api: { detail: "Requests and business logic", icon: Braces, label: "API" },
	app: { detail: "The interface people use", icon: AppWindow, label: "App" },
	database: {
		detail: "Structured, persistent data",
		icon: Database,
		label: "Database",
	},
	external: {
		detail: "Something outside your app",
		icon: Cloud,
		label: "External",
	},
	note: { detail: "A thought worth keeping", icon: StickyNote, label: "Note" },
	queue: {
		detail: "Messages waiting their turn",
		icon: Layers2,
		label: "Queue",
	},
	storage: {
		detail: "Files, images, and objects",
		icon: HardDrive,
		label: "Storage",
	},
	worker: { detail: "Work in the background", icon: Workflow, label: "Worker" },
} satisfies Record<
	BlockKind,
	{ label: string; icon: typeof AppWindow; detail: string }
>;

export const BlockNode = memo(function BlockCard({
	data,
	selected,
}: NodeProps<PlanNode>) {
	const { icon: Icon, label } = BLOCKS[data.kind];
	return (
		<div className={`plan-block ${selected ? "is-selected" : ""}`}>
			<Handle
				aria-label="Incoming connection"
				position={Position.Left}
				type="target"
			/>
			<div className="mb-4 flex items-center gap-2 text-muted">
				<Icon aria-hidden="true" size={16} />
				<span className="font-mono text-[10px] uppercase tracking-[0.12em]">
					{label}
				</span>
			</div>
			<div className="break-words font-medium text-[15px] leading-5">
				{data.label}
			</div>
			{data.detail ? (
				<p className="mt-1.5 break-words text-[12px] text-muted leading-5">
					{data.detail}
				</p>
			) : null}
			<Handle
				aria-label="Outgoing connection"
				position={Position.Right}
				type="source"
			/>
		</div>
	);
});
