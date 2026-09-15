// biome-ignore-all lint/performance/noJsxPropsBind: These small controls act on the current selection.
import { useViewport } from "@xyflow/react";
import { animate } from "animejs";
import {
	ArrowLeft,
	ArrowLeftRight,
	ArrowRight,
	Check,
	Minus,
	MoveUpRight,
	Trash2,
} from "lucide-react";
import {
	type RefObject,
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { editorPosition } from "../lib/editor-position";
import {
	ARROW_DIRECTIONS,
	BLOCK_SIZE,
	LINE_STYLES,
	NODE_APPEARANCES,
	type PlanEdge,
	type PlanNode,
} from "../lib/plan";
import { BlockDock } from "./block-dock";
import { BLOCKS, BlockIcon, blockColor } from "./block-node";

const appearanceLabels = {
	bare: "Bare",
	tinted: "Tinted tile",
	white: "White tile",
};
const arrowIcons = {
	both: ArrowLeftRight,
	forward: ArrowRight,
	none: Minus,
	reverse: ArrowLeft,
};
const arrowLabels = {
	both: "Arrows at both ends",
	forward: "Forward arrow",
	none: "No arrows",
	reverse: "Reverse arrow",
};

interface Props {
	canvasRef: RefObject<HTMLDivElement | null>;
	deleteSelection: () => void;
	dismiss: () => void;
	edge?: PlanEdge;
	edgeAnchor: { id: string; x: number; y: number } | null;
	editEdge: (patch: Partial<PlanEdge>) => void;
	editNode: (data: Partial<PlanNode["data"]>) => void;
	node?: PlanNode;
	nodes: PlanNode[];
}

export function SelectionEditor({
	canvasRef,
	node,
	edge,
	nodes,
	edgeAnchor,
	editNode,
	editEdge,
	deleteSelection,
	dismiss,
}: Props) {
	const ref = useRef<HTMLElement>(null);
	const titleRef = useRef<HTMLInputElement>(null);
	const [iconsOpen, setIconsOpen] = useState(false);
	const [size, setSize] = useState({
		canvasHeight: 0,
		canvasWidth: 0,
		height: 240,
		width: 300,
	});
	const viewport = useViewport();
	const note = node?.data.kind === "note";
	const closeIcons = useCallback(() => {
		setIconsOpen(false);
		requestAnimationFrame(() =>
			ref.current
				?.querySelector<HTMLButtonElement>(".selection-icon")
				?.focus({ preventScroll: true })
		);
	}, []);
	const finishEditing = useCallback(() => {
		canvasRef.current
			?.querySelector<HTMLElement>(
				".react-flow__node.selected, .react-flow__edge.selected"
			)
			?.focus({ preventScroll: true });
		dismiss();
	}, [canvasRef, dismiss]);

	useLayoutEffect(() => {
		const canvas = canvasRef.current;
		const panel = ref.current;
		if (!(canvas && panel)) {
			return;
		}
		const measure = () =>
			setSize({
				canvasHeight: canvas.clientHeight,
				canvasWidth: canvas.clientWidth,
				height: panel.offsetHeight,
				width: panel.offsetWidth,
			});
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(canvas);
		observer.observe(panel);
		return () => observer.disconnect();
	}, [canvasRef]);
	useEffect(() => {
		// biome-ignore lint/suspicious/noUnnecessaryConditions: React populates this nullable DOM ref after rendering.
		if (!ref.current) {
			return;
		}
		const motion = animate(ref.current, {
			duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches
				? 0
				: 180,
			ease: "out(3)",
			opacity: [0, 1],
			scale: [0.97, 1],
			translateY: [4, 0],
		});
		return () => {
			motion.revert();
		};
	}, []);
	useEffect(() => {
		function handleKey(event: KeyboardEvent) {
			if (event.defaultPrevented || document.querySelector("dialog[open]")) {
				return;
			}
			if (event.key === "Escape") {
				event.preventDefault();
				if (iconsOpen) {
					closeIcons();
					return;
				}
				finishEditing();
			}
			if (
				event.key === "Enter" &&
				event.target instanceof Element &&
				event.target.matches(".react-flow__node, .react-flow__edge")
			) {
				event.preventDefault();
				titleRef.current?.select();
			}
		}
		window.addEventListener("keydown", handleKey);
		return () => window.removeEventListener("keydown", handleKey);
	}, [closeIcons, finishEditing, iconsOpen]);

	const position = selectionPosition(
		node,
		edge,
		nodes,
		edgeAnchor,
		viewport,
		size
	);
	const className = note ? "selection-editor note-editor" : "selection-editor";
	return (
		<section
			aria-label={note ? "Edit note" : "Selection details"}
			className={`${className} nowheel nodrag nopan`}
			data-icon-picker={iconsOpen}
			ref={ref}
			style={{
				...(node && blockColor(node.data)),
				left: position.x,
				top: position.y,
				visibility: size.canvasWidth && !node?.dragging ? "visible" : "hidden",
			}}
		>
			{iconsOpen && node ? (
				<>
					<div className="selection-picker-heading">
						<button
							aria-label="Back to properties"
							className="icon-button"
							onClick={closeIcons}
							type="button"
						>
							<ArrowLeft size={16} />
						</button>
						<span>Choose an icon</span>
					</div>
					<BlockDock
						addBlock={(data) => {
							editNode({
								icon: data.icon,
								kind:
									data.icon || data.service || note
										? node.data.kind
										: data.kind,
								service: data.service,
							});
							closeIcons();
						}}
						embedded
					/>
				</>
			) : null}
			{!iconsOpen && node ? (
				<NodeProperties
					deleteSelection={deleteSelection}
					dismiss={finishEditing}
					editNode={editNode}
					node={node}
					openIcons={() => setIconsOpen(true)}
					titleRef={titleRef}
				/>
			) : null}
			{node ? null : (
				<ConnectionProperties
					deleteSelection={deleteSelection}
					dismiss={finishEditing}
					edge={edge}
					editEdge={editEdge}
					titleRef={titleRef}
				/>
			)}
		</section>
	);
}

function selectionPosition(
	node: Props["node"],
	edge: Props["edge"],
	nodes: Props["nodes"],
	edgeAnchor: Props["edgeAnchor"],
	viewport: { x: number; y: number; zoom: number },
	size: {
		canvasWidth: number;
		canvasHeight: number;
		width: number;
		height: number;
	}
) {
	const source = nodes.find((item) => item.id === edge?.source);
	const target = nodes.find((item) => item.id === edge?.target);
	const edgePoint =
		edgeAnchor?.id === edge?.id && edgeAnchor
			? edgeAnchor
			: {
					x:
						((source?.position.x ?? 0) +
							(target?.position.x ?? 0) +
							BLOCK_SIZE) /
						2,
					y:
						((source?.position.y ?? 0) +
							(target?.position.y ?? 0) +
							BLOCK_SIZE) /
						2,
				};
	const point = node?.position ?? edgePoint;
	return editorPosition(
		{
			height: node ? BLOCK_SIZE * viewport.zoom : 0,
			width: node ? BLOCK_SIZE * viewport.zoom : 0,
			x: point.x * viewport.zoom + viewport.x,
			y: point.y * viewport.zoom + viewport.y,
		},
		size,
		{ height: size.canvasHeight, width: size.canvasWidth },
		node?.data.kind === "note"
	);
}

function NodeProperties({
	node,
	editNode,
	deleteSelection,
	dismiss,
	titleRef,
	openIcons,
}: Pick<Props, "editNode" | "deleteSelection" | "dismiss"> & {
	node: PlanNode;
	titleRef: RefObject<HTMLInputElement | null>;
	openIcons: () => void;
}) {
	const note = node.data.kind === "note";
	return (
		<>
			<div className="selection-heading">
				<button
					aria-label="Change icon"
					className="selection-icon"
					onClick={openIcons}
					title="Change icon"
					type="button"
				>
					<BlockIcon data={node.data} size={24} />
				</button>
				<span>
					{note
						? "Note"
						: (node.data.icon?.label ?? BLOCKS[node.data.kind].label)}
				</span>
			</div>
			<NodeName editNode={editNode} node={node} titleRef={titleRef} />
			<textarea
				aria-label={note ? "Note text" : "Node description"}
				className="selection-description"
				maxLength={500}
				onChange={(event) => editNode({ detail: event.target.value })}
				placeholder={note ? "A thought worth keeping…" : "What does this do?"}
				rows={note ? 7 : 3}
				value={node.data.detail}
			/>
			<div className="selection-footer">
				<fieldset aria-label="Node style" className="selection-styles">
					{NODE_APPEARANCES.map((appearance) => (
						<button
							aria-label={appearanceLabels[appearance]}
							aria-pressed={(node.data.appearance ?? "bare") === appearance}
							className="selection-style"
							data-appearance={appearance}
							key={appearance}
							onClick={() => editNode({ appearance })}
							title={appearanceLabels[appearance]}
							type="button"
						>
							<span className="block-tile">
								<BlockIcon data={node.data} size={16} />
							</span>
						</button>
					))}
				</fieldset>
				<div className="selection-footer-actions">
					<button
						aria-label="Delete node"
						className="icon-button selection-delete"
						onClick={deleteSelection}
						title="Delete node"
						type="button"
					>
						<Trash2 size={15} />
					</button>
					<button
						aria-label={note ? "Collapse note" : "Done editing"}
						className="icon-button"
						onClick={dismiss}
						title="Done (Esc)"
						type="button"
					>
						<Check size={16} />
					</button>
				</div>
			</div>
		</>
	);
}
function ConnectionProperties({
	edge,
	editEdge,
	deleteSelection,
	dismiss,
	titleRef,
}: Pick<Props, "edge" | "editEdge" | "deleteSelection" | "dismiss"> & {
	titleRef: RefObject<HTMLInputElement | null>;
}) {
	return (
		<>
			<div className="selection-heading">
				<MoveUpRight size={14} />
				<span>Connection</span>
			</div>
			<input
				aria-label="Connection label"
				className="selection-title"
				maxLength={100}
				onChange={(event) => editEdge({ label: event.target.value })}
				placeholder="Add a label…"
				ref={titleRef}
				value={typeof edge?.label === "string" ? edge.label : ""}
			/>
			<div className="connection-options">
				<fieldset aria-label="Line style" className="selection-styles">
					{LINE_STYLES.map((lineStyle) => (
						<button
							aria-label={`${lineStyle} line`}
							aria-pressed={(edge?.data?.lineStyle ?? "solid") === lineStyle}
							className="selection-choice"
							key={lineStyle}
							onClick={() => editEdge({ data: { ...edge?.data, lineStyle } })}
							title={`${lineStyle} line`}
							type="button"
						>
							<Minus
								size={19}
								strokeDasharray={
									{ dashed: "5 4", dotted: "1 4", solid: undefined }[lineStyle]
								}
							/>
						</button>
					))}
				</fieldset>
				<fieldset aria-label="Arrow direction" className="selection-styles">
					{ARROW_DIRECTIONS.map((arrow) => {
						const Icon = arrowIcons[arrow];
						return (
							<button
								aria-label={arrowLabels[arrow]}
								aria-pressed={(edge?.data?.arrow ?? "forward") === arrow}
								className="selection-choice"
								key={arrow}
								onClick={() => editEdge({ data: { ...edge?.data, arrow } })}
								title={arrowLabels[arrow]}
								type="button"
							>
								<Icon size={16} />
							</button>
						);
					})}
				</fieldset>
			</div>
			<div className="selection-footer connection-footer">
				<button
					aria-label="Delete connection"
					className="icon-button selection-delete"
					onClick={deleteSelection}
					title="Delete connection"
					type="button"
				>
					<Trash2 size={15} />
				</button>
				<button
					aria-label="Done editing"
					className="icon-button"
					onClick={dismiss}
					title="Done (Esc)"
					type="button"
				>
					<Check size={16} />
				</button>
			</div>
		</>
	);
}

function NodeName({
	node,
	editNode,
	titleRef,
}: {
	node: PlanNode;
	editNode: Props["editNode"];
	titleRef: RefObject<HTMLInputElement | null>;
}) {
	const [name, setName] = useState(node.data.label);
	useEffect(() => setName(node.data.label), [node.data.label]);
	return (
		<input
			aria-label={node.data.kind === "note" ? "Note title" : "Node name"}
			className="selection-title"
			maxLength={100}
			onBlur={() => {
				if (!name.trim()) {
					setName(node.data.label);
				}
			}}
			onChange={(event) => {
				const { value } = event.target;
				setName(value);
				if (value.trim()) {
					editNode({ label: value });
				}
			}}
			placeholder={BLOCKS[node.data.kind].label}
			ref={titleRef}
			value={name}
		/>
	);
}
