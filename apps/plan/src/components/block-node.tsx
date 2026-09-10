import { Handle, type NodeProps, Position } from "@xyflow/react";
import { createTimeline } from "animejs";
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
import {
	type CSSProperties,
	memo,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { iconSource } from "../lib/icons";
import { BLOCK_SIZE, type BlockKind, type PlanNode } from "../lib/plan";
import { SERVICES } from "../lib/services";

export const BLOCKS = {
	api: {
		color: "#e56d3c",
		detail: "Requests and business logic",
		icon: Braces,
		label: "API",
	},
	app: {
		color: "#4a82d8",
		detail: "The interface people use",
		icon: AppWindow,
		label: "App",
	},
	database: {
		color: "#169f78",
		detail: "Structured, persistent data",
		icon: Database,
		label: "Database",
	},
	external: {
		color: "#5d86bb",
		detail: "Something outside your app",
		icon: Cloud,
		label: "External",
	},
	note: {
		color: "#aa8538",
		detail: "A thought worth keeping",
		icon: StickyNote,
		label: "Note",
	},
	queue: {
		color: "#b56b92",
		detail: "Messages waiting their turn",
		icon: Layers2,
		label: "Queue",
	},
	storage: {
		color: "#8061d8",
		detail: "Files, images, and objects",
		icon: HardDrive,
		label: "Storage",
	},
	worker: {
		color: "#bf7741",
		detail: "Work in the background",
		icon: Workflow,
		label: "Worker",
	},
} satisfies Record<
	BlockKind,
	{ label: string; icon: typeof AppWindow; detail: string; color: string }
>;

const handles = [Position.Left, Position.Top, Position.Right, Position.Bottom];

export function blockColor(data: PlanNode["data"]): CSSProperties {
	return {
		"--block-color":
			data.icon?.color ??
			(data.service ? SERVICES[data.service].color : BLOCKS[data.kind].color),
	} as CSSProperties;
}

export function BlockIcon({
	data,
	loading = "lazy",
	size = 32,
}: {
	data: PlanNode["data"];
	loading?: "eager" | "lazy";
	size?: number;
}) {
	const [failedSource, setFailedSource] = useState("");
	const catalogSource = data.icon ? iconSource(data.icon) : "";
	const handleIconError = useCallback(
		() => setFailedSource(catalogSource),
		[catalogSource]
	);
	if (catalogSource && catalogSource !== failedSource) {
		return (
			// biome-ignore lint/a11y/noNoninteractiveElementInteractions: onError handles an image load failure, not user interaction.
			<img
				alt=""
				className="service-icon"
				draggable={false}
				height={size}
				loading={loading}
				onError={handleIconError}
				src={catalogSource}
				width={size}
			/>
		);
	}
	if (data.service) {
		const src = `/icons/services/${data.service}.svg`;
		if (SERVICES[data.service].mask) {
			return (
				<span
					aria-hidden="true"
					className="service-icon service-icon-mask"
					style={{ height: size, maskImage: `url(${src})`, width: size }}
				/>
			);
		}
		return (
			<img
				alt=""
				className="service-icon"
				draggable={false}
				height={size}
				src={src}
				width={size}
			/>
		);
	}
	const Icon = BLOCKS[data.kind].icon;
	return <Icon aria-hidden="true" size={size} />;
}

export const BlockNode = memo(function BlockCard({
	data,
	isConnectable,
	selected,
}: NodeProps<PlanNode>) {
	const blockRef = useRef<HTMLDivElement>(null);
	const [revealing, setRevealing] = useState(Boolean(data.aiReveal));
	useEffect(() => {
		const block = blockRef.current;
		if (!(revealing && block)) {
			return;
		}
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			setRevealing(false);
			return;
		}
		const motion = createTimeline({
			defaults: { ease: "out(3)" },
			onComplete: () => setRevealing(false),
		})
			.add(
				block.querySelectorAll(".block-arrival"),
				{ duration: 180, opacity: [0, 1] },
				0
			)
			.add(
				block.querySelectorAll(".block-arrival-fill"),
				{
					clipPath: ["inset(100% 0% 0% 0%)", "inset(0% 0% 0% 0%)"],
					duration: 560,
				},
				140
			)
			.add(
				block.querySelectorAll(".block-tile"),
				{
					clipPath: [
						"inset(100% 0% 0% 0% round 18px)",
						"inset(0% 0% 0% 0% round 18px)",
					],
					duration: 540,
					opacity: [0, 1],
				},
				320
			)
			.add(
				block.querySelectorAll(".block-label"),
				{ duration: 200, opacity: [0, 1] },
				650
			)
			.add(
				block.querySelectorAll(".block-arrival"),
				{ duration: 240, opacity: 0 },
				780
			);
		return () => {
			motion.revert();
		};
	}, [revealing]);
	return (
		<div
			className={`plan-block ${selected ? "is-selected" : ""}`}
			data-appearance={data.appearance ?? "bare"}
			data-revealing={revealing}
			ref={blockRef}
			style={{ ...blockColor(data), height: BLOCK_SIZE, width: BLOCK_SIZE }}
			title={data.detail || data.label}
		>
			<div className="block-tile">
				<BlockIcon
					data={data}
					loading={revealing ? "eager" : "lazy"}
					size={data.service || data.icon ? 42 : 32}
				/>
			</div>
			{revealing ? (
				<div aria-hidden="true" className="block-arrival">
					<div className="block-arrival-fill" />
				</div>
			) : null}
			<div className="block-label">{data.label}</div>
			{handles.map((position) => (
				<Handle
					aria-label={`Connect from ${position} edge`}
					id={position}
					isConnectable={isConnectable}
					key={position}
					position={position}
					type="source"
				/>
			))}
		</div>
	);
});
