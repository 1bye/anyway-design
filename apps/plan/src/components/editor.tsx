// biome-ignore-all lint/performance/noJsxPropsBind: Small editor controls capture the current selection; memoizing each handler adds no benefit.
import {
	addEdge,
	applyEdgeChanges,
	applyNodeChanges,
	Background,
	ConnectionMode,
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
	useMemo,
	useRef,
	useState,
} from "react";
import {
	addToPlan,
	BLOCK_SIZE,
	blockDataSchema,
	errorMessage,
	INITIAL_PLAN,
	NODE_APPEARANCES,
	type Plan,
	type PlanNode,
	planSchema,
} from "../lib/plan";
import { SERVICE_IDS, SERVICES } from "../lib/services";
import { getModelContext, registerPlanTools } from "../lib/webmcp";
import { BLOCK_DRAG_TYPE, BlockDock } from "./block-dock";
import { BLOCKS, BlockIcon, BlockNode, blockColor } from "./block-node";

const STORAGE_KEY = "anyway-plan:v1";
const nodeTypes = { block: BlockNode };
const defaultEdgeOptions = {
	markerEnd: { height: 16, type: MarkerType.ArrowClosed, width: 16 },
	type: "smoothstep",
};
const fitViewOptions = { maxZoom: 1, padding: 0.2 };
const deleteKeyCode = ["Backspace", "Delete"];
const appearanceLabels = {
	bare: "A · Bare",
	tinted: "C · Tinted",
	white: "B · White",
};

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
	const [webmcpSupported] = useState(() =>
		Boolean(getModelContext()?.registerTool)
	);
	const importRef = useRef<HTMLInputElement>(null);
	const canvasRef = useRef<HTMLDivElement>(null);
	const preserveViewport = useRef(false);
	const { screenToFlowPosition, fitView } = useReactFlow<PlanNode>();
	const selectedNode = plan.nodes.find((node) => node.selected);
	const selectedEdge = plan.edges.find((edge) => edge.selected);
	const edges = useMemo(
		() =>
			plan.edges.map((edge) => ({
				...edge,
				sourceHandle: edge.sourceHandle ?? "right",
				targetHandle: edge.targetHandle ?? "left",
			})),
		[plan.edges]
	);

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
		// biome-ignore lint/suspicious/noUnnecessaryConditions: addBlock updates this ref before the effect runs.
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
		if (!context?.registerTool) {
			return;
		}
		const controller = new AbortController();
		let active = true;
		registerPlanTools(context, controller, read, add).catch((error) => {
			if (active) {
				setNotice(`WebMCP tools couldn't start. ${errorMessage(error)}`);
			}
		});
		return () => {
			active = false;
			controller.abort();
		};
	}, [read, add]);

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

	function addBlock(data: PlanNode["data"], dropPoint?: XYPosition) {
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
		const position = {
			x: center.x - BLOCK_SIZE / 2,
			y: center.y - BLOCK_SIZE / 2,
		};
		while (
			!dropPoint &&
			planRef.current.nodes.some(
				(node) =>
					Math.abs(node.position.x - position.x) < BLOCK_SIZE + 96 &&
					Math.abs(node.position.y - position.y) < BLOCK_SIZE + 48
			)
		) {
			position.y += BLOCK_SIZE + 64;
		}
		// Keep a dropped block under the cursor at the current pan and zoom.
		preserveViewport.current = Boolean(dropPoint);
		update((current) => ({
			...current,
			edges: current.edges.map((edge) => ({ ...edge, selected: false })),
			nodes: [
				...current.nodes.map((node) => ({ ...node, selected: false })),
				{
					data,
					id: crypto.randomUUID(),
					position,
					selected: true,
					type: "block",
				},
			],
		}));
	}

	function onDrop(event: DragEvent<HTMLDivElement>) {
		const raw = event.dataTransfer.getData(BLOCK_DRAG_TYPE);
		if (!raw || raw.length > 8192) {
			return;
		}
		try {
			const result = blockDataSchema.safeParse(JSON.parse(raw));
			if (!result.success) {
				return;
			}
			event.preventDefault();
			addBlock(result.data, { x: event.clientX, y: event.clientY });
		} catch {
			// Ignore unrelated or malformed drag payloads.
		}
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
					<span className="webmcp-status">
						{webmcpSupported
							? "WebMCP is supported"
							: "WebMCP is not supported"}
					</span>
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
						connectionMode={ConnectionMode.Loose}
						connectionRadius={40}
						defaultEdgeOptions={defaultEdgeOptions}
						deleteKeyCode={deleteKeyCode}
						edges={edges}
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
								onClick={() =>
									addBlock({ detail: "", kind: "app", label: "App" })
								}
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
								canvas, or click to add it. Drag from a block's highlighted edge
								to another block to connect them.
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
									{webmcpSupported
										? "WebMCP tools are available automatically. Ask your browser agent to read this canvas, find service icons, or add blocks and connections."
										: "WebMCP isn't available in this browser. Open Plan in a browser with WebMCP enabled to let your agent build on the canvas."}
								</p>
							</div>
						</div>
					) : null}
					<BlockDock addBlock={addBlock} />
				</div>
			</main>
		</div>
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
					<fieldset
						className="node-style-picker mb-4"
						style={blockColor(node.data)}
					>
						<legend className="field-label">Node style</legend>
						<div className="node-style-options">
							{NODE_APPEARANCES.map((appearance) => (
								<button
									aria-label={appearanceLabels[appearance]}
									aria-pressed={(node.data.appearance ?? "bare") === appearance}
									className="node-style-option"
									data-appearance={appearance}
									key={appearance}
									onClick={() => editNode({ appearance })}
									type="button"
								>
									<span className="block-tile style-preview">
										<BlockIcon data={node.data} size={22} />
									</span>
									<span>{appearanceLabels[appearance]}</span>
								</button>
							))}
						</div>
					</fieldset>
					<label className="field-label" htmlFor="block-service">
						Service icon
					</label>
					<select
						className="mb-4 text-field"
						id="block-service"
						onChange={(event) =>
							editNode({
								icon: undefined,
								service: SERVICE_IDS.find(
									(service) => service === event.target.value
								),
							})
						}
						value={node.data.icon ? "catalog" : (node.data.service ?? "")}
					>
						<option value="">{BLOCKS[node.data.kind].label} icon</option>
						{node.data.icon ? (
							<option value="catalog">{node.data.icon.label}</option>
						) : null}
						{SERVICE_IDS.map((service) => (
							<option key={service} value={service}>
								{SERVICES[service].label}
							</option>
						))}
					</select>
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
