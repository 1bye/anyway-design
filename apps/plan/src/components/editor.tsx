// biome-ignore-all lint/performance/noJsxPropsBind: Small editor controls capture the current selection; memoizing each handler adds no benefit.
import {
	addEdge,
	applyEdgeChanges,
	applyNodeChanges,
	Background,
	Controls,
	type Edge,
	MarkerType,
	type OnConnect,
	type OnEdgesChange,
	type OnNodesChange,
	ReactFlow,
	ReactFlowProvider,
	useReactFlow,
	type XYPosition,
} from "@xyflow/react";
import {
	ArrowDownToLine,
	ArrowUpRight,
	CircleHelp,
	FolderOpen,
	MousePointer2,
	Plus,
	Trash2,
	X,
	Zap,
} from "lucide-react";
import {
	type ChangeEvent,
	type DragEvent,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import {
	addToPlan,
	BLOCK_KINDS,
	type BlockKind,
	errorMessage,
	INITIAL_PLAN,
	type Plan,
	type PlanNode,
	planSchema,
} from "../lib/plan";
import { getModelContext, registerPlanTools } from "../lib/webmcp";
import { BLOCKS, BlockNode } from "./block-node";

const STORAGE_KEY = "anyway-plan:v1";
const BLOCK_DRAG_TYPE = "application/x-anyway-plan-block";
const nodeTypes = { block: BlockNode };
const defaultEdgeOptions = {
	markerEnd: { height: 16, type: MarkerType.ArrowClosed, width: 16 },
	type: "smoothstep",
};
const fitViewOptions = { maxZoom: 1, padding: 0.2 };
const deleteKeyCode = ["Backspace", "Delete"];

function readDraft(): { plan: Plan; error: string } {
	try {
		const saved = localStorage.getItem(STORAGE_KEY);
		return {
			error: "",
			plan: saved ? planSchema.parse(JSON.parse(saved)) : INITIAL_PLAN,
		};
	} catch {
		return {
			error:
				"The local draft could not be opened. Download your work to keep it.",
			plan: INITIAL_PLAN,
		};
	}
}

export function PlanEditor() {
	return (
		<ReactFlowProvider>
			<Editor />
		</ReactFlowProvider>
	);
}

function Editor() {
	const [draft] = useState(readDraft);
	const [plan, setPlan] = useState(draft.plan);
	const planRef = useRef(plan);
	const [notice, setNotice] = useState(draft.error);
	const [help, setHelp] = useState(false);
	const [aiEnabled, setAiEnabled] = useState(false);
	const [aiStatus, setAiStatus] = useState("disabled");
	const [aiAvailable] = useState(() =>
		Boolean(getModelContext()?.registerTool)
	);
	const importRef = useRef<HTMLInputElement>(null);
	const canvasRef = useRef<HTMLDivElement>(null);
	const preserveViewport = useRef(false);
	const { screenToFlowPosition, fitView } = useReactFlow<PlanNode>();
	const selectedNode = plan.nodes.find((node) => node.selected);
	const selectedEdge = plan.edges.find((edge) => edge.selected);

	const update = useCallback((change: (current: Plan) => Plan) => {
		const next = change(planRef.current);
		planRef.current = next;
		setPlan(next);
		return next;
	}, []);
	const read = useCallback(() => planRef.current, []);
	const add = useCallback(
		(input: unknown) => update((current) => addToPlan(current, input)),
		[update]
	);
	useEffect(() => {
		// biome-ignore lint/suspicious/noUnnecessaryConditions: A drop sets this mutable ref before the next effect runs.
		if (preserveViewport.current) {
			preserveViewport.current = false;
			return;
		}
		if (plan.nodes.length > 0) {
			fitView(fitViewOptions).catch(() =>
				setNotice("Use Fit view to center your blocks.")
			);
		}
	}, [plan.nodes.length, fitView]);

	useEffect(() => {
		if (draft.error) {
			return;
		}
		const timer = setTimeout(() => {
			try {
				localStorage.setItem(
					STORAGE_KEY,
					JSON.stringify(planSchema.parse(plan))
				);
			} catch {
				setNotice(
					"Couldn't save locally. Download your plan to keep your changes."
				);
			}
		}, 300);
		return () => clearTimeout(timer);
	}, [plan, draft.error]);

	useEffect(() => {
		const context = getModelContext();
		if (!(aiEnabled && context)) {
			setAiStatus("disabled");
			return;
		}
		const controller = new AbortController();
		let active = true;
		setAiStatus("enabling");
		async function enable() {
			try {
				if (!context) {
					return;
				}
				await registerPlanTools(context, controller, read, add);
				if (!controller.signal.aborted) {
					setAiStatus("enabled");
				}
			} catch (error) {
				if (active) {
					setAiStatus("error");
					setNotice(`AI tools couldn't start. ${errorMessage(error)}`);
				}
			}
		}
		enable().catch(() => setAiStatus("error"));
		return () => {
			active = false;
			controller.abort();
		};
	}, [aiEnabled, read, add]);

	const onNodesChange: OnNodesChange<PlanNode> = useCallback(
		(changes) => {
			update((current) => {
				const nodes = applyNodeChanges(changes, current.nodes);
				const ids = new Set(nodes.map((node) => node.id));
				return {
					...current,
					edges: current.edges.filter(
						(edge) => ids.has(edge.source) && ids.has(edge.target)
					),
					nodes,
				};
			});
		},
		[update]
	);
	const onEdgesChange: OnEdgesChange = useCallback(
		(changes) => {
			update((current) => ({
				...current,
				edges: applyEdgeChanges(changes, current.edges),
			}));
		},
		[update]
	);
	const onConnect: OnConnect = useCallback(
		(connection) => {
			update((current) => ({
				...current,
				edges: addEdge(connection, current.edges),
			}));
		},
		[update]
	);

	function addBlock(kind: BlockKind, dropPoint?: XYPosition) {
		const bounds = canvasRef.current?.getBoundingClientRect();
		if (!bounds) {
			return;
		}
		const center = screenToFlowPosition(
			dropPoint ?? {
				x: bounds.left + bounds.width / 2,
				y: bounds.top + bounds.height / 2,
			}
		);
		const position = { x: center.x - 112, y: center.y - 64 };
		while (
			!dropPoint &&
			planRef.current.nodes.some(
				(node) =>
					Math.abs(node.position.x - position.x) < 248 &&
					Math.abs(node.position.y - position.y) <
						(node.measured?.height ?? 128) + 24
			)
		) {
			position.y += 160;
		}
		// Keep a dropped block under the cursor at the current pan and zoom.
		preserveViewport.current = Boolean(dropPoint);
		update((current) => ({
			...current,
			edges: current.edges.map((edge) => ({ ...edge, selected: false })),
			nodes: [
				...current.nodes.map((node) => ({ ...node, selected: false })),
				{
					data: { detail: "", kind, label: BLOCKS[kind].label },
					id: crypto.randomUUID(),
					position,
					selected: true,
					type: "block",
				},
			],
		}));
	}

	function onDrop(event: DragEvent<HTMLDivElement>) {
		const draggedKind = event.dataTransfer.getData(BLOCK_DRAG_TYPE);
		const kind = BLOCK_KINDS.find((item) => item === draggedKind);
		if (!kind) {
			return;
		}
		event.preventDefault();
		addBlock(kind, { x: event.clientX, y: event.clientY });
	}

	function editNode(data: Partial<PlanNode["data"]>) {
		update((current) => ({
			...current,
			nodes: current.nodes.map((node) =>
				node.id === selectedNode?.id
					? { ...node, data: { ...node.data, ...data } }
					: node
			),
		}));
	}
	function editEdge(label: string) {
		update((current) => ({
			...current,
			edges: current.edges.map((edge) =>
				edge.id === selectedEdge?.id ? { ...edge, label } : edge
			),
		}));
	}
	function deleteSelection() {
		update((current) => {
			const ids = new Set(
				current.nodes.filter((node) => node.selected).map((node) => node.id)
			);
			return {
				...current,
				edges: current.edges.filter(
					(edge) =>
						!(edge.selected || ids.has(edge.source) || ids.has(edge.target))
				),
				nodes: current.nodes.filter((node) => !ids.has(node.id)),
			};
		});
	}
	function download() {
		const url = URL.createObjectURL(
			new Blob([JSON.stringify(planSchema.parse(plan), null, 2)], {
				type: "application/json",
			})
		);
		const link = document.createElement("a");
		link.href = url;
		link.download = "canvas.plan.json";
		link.click();
		setTimeout(() => URL.revokeObjectURL(url), 1000);
	}
	async function importPlan(event: ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file) {
			return;
		}
		try {
			if (file.size > 2 * 1024 * 1024) {
				throw new Error("Choose a plan smaller than 2 MB.");
			}
			const imported = planSchema.parse(JSON.parse(await file.text()));
			if (
				// biome-ignore lint/suspicious/noAlert: Native confirmation protects the current canvas before replacing it with a file.
				!window.confirm(
					"Open this plan? It will replace the current canvas. Download your current plan first if you want to keep it."
				)
			) {
				return;
			}
			setAiEnabled(false);
			update(() => imported);
			setNotice("");
			requestAnimationFrame(() => {
				fitView(fitViewOptions).catch(() =>
					setNotice("Use Fit view to center the imported plan.")
				);
			});
		} catch (error) {
			setNotice(errorMessage(error));
		}
	}

	return (
		<div className="app-shell">
			<header className="site-header">
				<a
					aria-label="Anyway design home"
					className="brand"
					href="https://anyway.design"
				>
					<img
						alt="Anyway"
						className="brand-wordmark"
						height={887}
						src="/brand/anyway-wordmark.png"
						width={1774}
					/>
					<span aria-hidden="true" className="brand-divider" />
					<span className="brand-plan">plan</span>
				</a>
				<div className="header-actions">
					<input
						accept=".json,application/json"
						aria-label="Open plan file"
						className="sr-only"
						onChange={importPlan}
						ref={importRef}
						tabIndex={-1}
						type="file"
					/>
					<button
						aria-label="Open plan"
						className="icon-button"
						onClick={() => importRef.current?.click()}
						title="Open plan"
						type="button"
					>
						<FolderOpen size={17} />
					</button>
					<button
						aria-label="Download plan"
						className="icon-button"
						onClick={download}
						title="Download plan"
						type="button"
					>
						<ArrowDownToLine size={17} />
					</button>
					<button
						aria-expanded={help}
						aria-label="Canvas help and AI tools"
						className="icon-button"
						onClick={() => setHelp(!help)}
						title="Help and AI tools"
						type="button"
					>
						<CircleHelp size={17} />
					</button>
					<button
						aria-label={aiStatus === "enabled" ? "Disable AI tools" : "Use AI"}
						aria-pressed={aiEnabled}
						className={`pill-button ${aiStatus === "enabled" ? "ai-active" : ""}`}
						onClick={() => {
							if (aiEnabled) {
								setAiEnabled(false);
							} else {
								setHelp(true);
							}
						}}
						type="button"
					>
						<Zap aria-hidden="true" size={14} />
						<span className="hidden sm:inline">
							{aiStatus === "enabled" ? "AI enabled" : "Use AI"}
						</span>
					</button>
				</div>
			</header>
			<main className="workspace">
				<h1 className="sr-only">Plan your next project</h1>

				{notice ? (
					<div className="notice" role="alert">
						<span>{notice}</span>
						<button
							aria-label="Dismiss message"
							onClick={() => setNotice("")}
							type="button"
						>
							<X size={14} />
						</button>
					</div>
				) : null}
				<div className="canvas" ref={canvasRef}>
					<ReactFlow
						defaultEdgeOptions={defaultEdgeOptions}
						deleteKeyCode={deleteKeyCode}
						edges={plan.edges}
						fitView
						fitViewOptions={fitViewOptions}
						maxZoom={1.75}
						minZoom={0.15}
						nodes={plan.nodes}
						nodeTypes={nodeTypes}
						onConnect={onConnect}
						onDragOver={(event) => {
							if (event.dataTransfer.types.includes(BLOCK_DRAG_TYPE)) {
								event.preventDefault();
								event.dataTransfer.dropEffect = "copy";
							}
						}}
						onDrop={onDrop}
						onEdgesChange={onEdgesChange}
						onNodesChange={onNodesChange}
					>
						<Background color="#d6d6d6" gap={20} size={1} />
						<Controls position="bottom-left" showInteractive={false} />
					</ReactFlow>
					{plan.nodes.length === 0 ? (
						<div className="empty-canvas">
							<MousePointer2 aria-hidden="true" className="mb-4" size={24} />
							<h2 className="text-[24px] tracking-[-0.03em]">
								Everything starts somewhere.
							</h2>
							<p className="mt-2 text-[13px] text-muted">
								Pick your first block. See where it goes.
							</p>
							<button
								className="pill-button pointer-events-auto mt-5"
								onClick={() => addBlock("app")}
								type="button"
							>
								<Plus size={14} />
								Add an app
							</button>
						</div>
					) : null}
					{selectedNode || selectedEdge ? (
						<Inspector
							deleteSelection={deleteSelection}
							edge={selectedEdge}
							editEdge={editEdge}
							editNode={editNode}
							node={selectedNode}
						/>
					) : null}
					{help ? (
						<div className="help-panel">
							<div className="mb-4 flex items-center justify-between">
								<h2 className="font-medium">Your canvas, your way.</h2>
								<button
									aria-label="Close help"
									className="icon-button"
									onClick={() => setHelp(false)}
									type="button"
								>
									<X size={16} />
								</button>
							</div>
							<p>
								Move to the bottom edge to reveal the blocks. Drag one onto the
								canvas, or click to add it. Connect the dots to join blocks.
							</p>
							<p className="mt-3">
								Select a block or connection to edit it. Press Delete to remove
								a selection. Tab and arrow keys work on the canvas, too.
							</p>
							<div className="mt-5 border-line border-t pt-4">
								<h3 className="mb-2 flex items-center gap-2 font-medium text-ink">
									<Zap size={14} />
									Build with your AI
								</h3>
								<p>
									{aiAvailable
										? "Enable WebMCP to let your browser agent read this canvas and add blocks and connections directly. Your agent may process this data in the cloud."
										: "WebMCP isn't available in this browser. Open Plan in a browser with WebMCP enabled to let your agent build on the canvas."}
								</p>
								{aiAvailable ? (
									<button
										className="pill-button mt-4"
										disabled={aiStatus === "enabling"}
										onClick={() => {
											setAiEnabled(!aiEnabled);
											setHelp(false);
										}}
										type="button"
									>
										{aiEnabled ? "Disable AI tools" : "Enable AI tools"}
										<ArrowUpRight size={14} />
									</button>
								) : null}
							</div>
						</div>
					) : null}
					<BlockDock addBlock={addBlock} />
				</div>
			</main>
		</div>
	);
}

function BlockDock({ addBlock }: { addBlock: (kind: BlockKind) => void }) {
	const [dragging, setDragging] = useState(false);
	return (
		<aside
			aria-label="Block library"
			className="block-dock"
			data-dragging={dragging}
		>
			<button
				aria-controls="block-palette"
				aria-label="Show blocks"
				className="dock-trigger"
				type="button"
			>
				<span />
			</button>
			<div className="block-palette" id="block-palette">
				{BLOCK_KINDS.map((kind) => {
					const { icon: Icon, label, detail } = BLOCKS[kind];
					return (
						<button
							aria-label={`Add ${label} block`}
							className="palette-item"
							draggable
							key={kind}
							onClick={(event) => {
								addBlock(kind);
								if (event.detail > 0) {
									event.currentTarget.blur();
								}
							}}
							onDragEnd={() => setDragging(false)}
							onDragStart={(event) => {
								event.dataTransfer.setData(BLOCK_DRAG_TYPE, kind);
								event.dataTransfer.effectAllowed = "copy";
								setDragging(true);
								event.currentTarget.blur();
							}}
							title={detail}
							type="button"
						>
							<Icon aria-hidden="true" size={20} />
							<span>{label}</span>
						</button>
					);
				})}
			</div>
		</aside>
	);
}

function Inspector({
	node,
	edge,
	editNode,
	editEdge,
	deleteSelection,
}: {
	node?: PlanNode;
	edge?: Edge;
	editNode: (data: Partial<PlanNode["data"]>) => void;
	editEdge: (label: string) => void;
	deleteSelection: () => void;
}) {
	return (
		<section aria-label="Selection details" className="inspector">
			<div className="mb-4 flex items-center justify-between">
				<h2 className="font-mono text-[10px] text-muted uppercase tracking-wider">
					{node ? BLOCKS[node.data.kind].label : "Connection"}
				</h2>
				<button
					aria-label="Delete selection"
					className="icon-button"
					onClick={deleteSelection}
					title="Delete selection"
					type="button"
				>
					<Trash2 size={15} />
				</button>
			</div>
			{node ? (
				<>
					<label className="field-label" htmlFor="block-name">
						Name
					</label>
					<input
						className="text-field"
						id="block-name"
						maxLength={100}
						onChange={(event) =>
							editNode({
								label: event.target.value || BLOCKS[node.data.kind].label,
							})
						}
						value={node.data.label}
					/>
					<label className="field-label mt-4" htmlFor="block-detail">
						A little context
					</label>
					<textarea
						className="resize-none text-field"
						id="block-detail"
						maxLength={500}
						onChange={(event) => editNode({ detail: event.target.value })}
						placeholder="What does this do?"
						rows={3}
						value={node.data.detail}
					/>
				</>
			) : (
				<>
					<label className="field-label" htmlFor="connection-label">
						Label
					</label>
					<input
						className="text-field"
						id="connection-label"
						maxLength={100}
						onChange={(event) => editEdge(event.target.value)}
						placeholder="e.g. HTTPS"
						value={typeof edge?.label === "string" ? edge.label : ""}
					/>
				</>
			)}
		</section>
	);
}
