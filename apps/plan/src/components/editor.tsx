// biome-ignore-all lint/performance/noJsxPropsBind: Small editor controls capture the current selection; memoizing each handler adds no benefit.
import {
	addEdge,
	applyEdgeChanges,
	applyNodeChanges,
	Background,
	ConnectionMode,
	ControlButton,
	Controls,
	MarkerType,
	type OnConnect,
	type OnEdgesChange,
	type OnNodesChange,
	ReactFlow,
	ReactFlowProvider,
	useReactFlow,
	useStore,
	type XYPosition,
} from "@xyflow/react";
import {
	CircleHelp,
	FolderOpen,
	Maximize,
	Minus,
	MousePointer2,
	Plus,
	Save,
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
	BLOCK_SIZE,
	blockDataSchema,
	errorMessage,
	INITIAL_PLAN,
	type Plan,
	type PlanEdge,
	type PlanNode,
	planSchema,
} from "../lib/plan";
import {
	readDraft,
	readSavedPlans,
	type SavedPlan,
	writeDraft,
} from "../lib/plan-storage";
import { getModelContext, registerPlanTools } from "../lib/webmcp";
import { BLOCK_DRAG_TYPE, BlockDock } from "./block-dock";
import { BlockNode } from "./block-node";
import { PlanLibrary } from "./plan-library";
import { SelectionEditor } from "./selection-editor";

const nodeTypes = { block: BlockNode };
const defaultEdgeOptions = {
	markerEnd: { height: 16, type: MarkerType.ArrowClosed, width: 16 },
	type: "smoothstep",
};
const fitViewOptions = { maxZoom: 1, padding: 0.2 };
const deleteKeyCode = ["Backspace", "Delete"];

function readInitialDraft(): {
	plan: Plan;
	savedPlanId: string | null;
	error: string;
} {
	try {
		const saved = readDraft(localStorage);
		return {
			error: "",
			plan: saved?.plan ?? INITIAL_PLAN,
			savedPlanId: saved?.savedPlanId ?? null,
		};
	} catch {
		return {
			error:
				"The local draft could not be opened. Download your work to keep it.",
			plan: INITIAL_PLAN,
			savedPlanId: null,
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
	const [draft] = useState(readInitialDraft);
	const [draftError, setDraftError] = useState(draft.error);
	const [savedPlanId, setSavedPlanId] = useState(draft.savedPlanId);
	const [libraryOpen, setLibraryOpen] = useState(false);
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
	const [edgeAnchor, setEdgeAnchor] = useState<{
		id: string;
		x: number;
		y: number;
	} | null>(null);
	const selectedNode = plan.nodes.find((node) => node.selected);
	const selectedEdge = plan.edges.find((edge) => edge.selected);
	const edges = useMemo(
		() =>
			plan.edges.map((edge) => ({
				...edge,
				markerEnd: ["forward", "both"].includes(edge.data?.arrow ?? "forward")
					? defaultEdgeOptions.markerEnd
					: undefined,
				markerStart: ["reverse", "both"].includes(edge.data?.arrow ?? "forward")
					? defaultEdgeOptions.markerEnd
					: undefined,
				sourceHandle: edge.sourceHandle ?? "right",
				style: {
					strokeDasharray: { dashed: "7 5", dotted: "2 5", solid: undefined }[
						edge.data?.lineStyle ?? "solid"
					],
				},
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
		if (draftError) {
			return;
		}
		const timer = setTimeout(() => {
			try {
				writeDraft(localStorage, plan, savedPlanId);
			} catch {
				setNotice(
					"Couldn't save locally. Download your plan to keep your changes."
				);
			}
		}, 300);
		return () => clearTimeout(timer);
	}, [plan, savedPlanId, draftError]);

	useEffect(() => {
		const context = getModelContext();
		if (!context?.registerTool) {
			return;
		}
		const controller = new AbortController();
		let active = true;
		registerPlanTools(context, controller, read, update).catch((error) => {
			if (active) {
				setNotice(`WebMCP tools couldn't start. ${errorMessage(error)}`);
			}
		});
		return () => {
			active = false;
			controller.abort();
		};
	}, [read, update]);

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
	const onEdgesChange: OnEdgesChange<PlanEdge> = useCallback(
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
	function editEdge(patch: Partial<PlanEdge>) {
		update((current) => ({
			...current,
			edges: current.edges.map((edge) =>
				edge.id === selectedEdge?.id ? { ...edge, ...patch } : edge
			),
		}));
	}
	const dismissSelection = useCallback(() => {
		update((current) => ({
			...current,
			edges: current.edges.map((edge) =>
				edge.selected ? { ...edge, selected: false } : edge
			),
			nodes: current.nodes.map((node) =>
				node.selected ? { ...node, selected: false } : node
			),
		}));
	}, [update]);

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
	function openCanvas(next: Plan, id: string | null = null) {
		try {
			const current = planSchema.parse(planRef.current);
			const saved = savedPlanId
				? readSavedPlans(localStorage).find((entry) => entry.id === savedPlanId)
				: undefined;
			const hasUnsavedChanges =
				(savedPlanId !== null ||
					current.nodes.length > 0 ||
					current.edges.length > 0 ||
					current.name !== "Untitled plan") &&
				JSON.stringify(current) !== JSON.stringify(saved?.plan);
			if (
				hasUnsavedChanges &&
				// biome-ignore lint/suspicious/noAlert: Protect unsaved work before replacing the active draft.
				!window.confirm(
					"Replace the current canvas? Save it here or export it first to keep unsaved changes."
				)
			) {
				return;
			}
			update(() => planSchema.parse(next));
			setSavedPlanId(id);
			setDraftError("");
			setLibraryOpen(false);
			setHelp(false);
			setNotice("");
			requestAnimationFrame(() => {
				fitView(fitViewOptions).catch(() =>
					setNotice("Use Fit view to center your plan.")
				);
			});
		} catch (failure) {
			setLibraryOpen(false);
			setNotice(`Couldn't open this plan. ${errorMessage(failure)}`);
		}
	}
	function onPlanSaved(saved: SavedPlan) {
		update((current) => ({ ...current, name: saved.plan.name }));
		setSavedPlanId(saved.id);
		setDraftError("");
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
			openCanvas(imported);
		} catch (error) {
			setLibraryOpen(false);
			setNotice(errorMessage(error));
		}
	}

	return (
		<div className="app-shell">
			{libraryOpen ? (
				<PlanLibrary
					activeId={savedPlanId}
					onClose={() => setLibraryOpen(false)}
					onDelete={(id) => {
						if (savedPlanId === id) {
							setSavedPlanId(null);
						}
					}}
					onImport={() => importRef.current?.click()}
					onNew={() =>
						openCanvas({
							edges: [],
							name: "Untitled plan",
							nodes: [],
							version: 1,
						})
					}
					onOpen={(saved) => openCanvas(saved.plan, saved.id)}
					onSave={onPlanSaved}
					plan={plan}
				/>
			) : null}
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
						aria-haspopup="dialog"
						aria-label="Saved plans"
						className="icon-button"
						onClick={() => setLibraryOpen(true)}
						title="Saved plans"
						type="button"
					>
						<FolderOpen size={17} />
					</button>
					<button
						aria-haspopup="dialog"
						aria-label="Save or export plan"
						className="icon-button"
						onClick={() => setLibraryOpen(true)}
						title="Save or export plan"
						type="button"
					>
						<Save size={17} />
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
						onEdgeClick={(event, edge) =>
							setEdgeAnchor({
								id: edge.id,
								...screenToFlowPosition({ x: event.clientX, y: event.clientY }),
							})
						}
						onEdgesChange={onEdgesChange}
						onNodeDoubleClick={() =>
							requestAnimationFrame(() =>
								document
									.querySelector<HTMLInputElement>(".selection-title")
									?.select()
							)
						}
						onNodesChange={onNodesChange}
						onPaneClick={dismissSelection}
					>
						<Background color="#d6d6d6" gap={20} size={1} />
						<CanvasControls onError={setNotice} />
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
						<SelectionEditor
							canvasRef={canvasRef}
							deleteSelection={deleteSelection}
							dismiss={dismissSelection}
							edge={selectedEdge}
							edgeAnchor={edgeAnchor}
							editEdge={editEdge}
							editNode={editNode}
							key={
								selectedNode
									? `node-${selectedNode.id}`
									: `edge-${selectedEdge?.id}`
							}
							node={selectedNode}
							nodes={plan.nodes}
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
										? "WebMCP tools are available automatically. Ask your browser agent to read this canvas, find service icons, or add, edit, and remove blocks and connections."
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

function CanvasControls({ onError }: { onError: (message: string) => void }) {
	const { zoomIn, zoomOut, fitView } = useReactFlow();
	const atMaxZoom = useStore((state) => state.transform[2] >= state.maxZoom);
	const atMinZoom = useStore((state) => state.transform[2] <= state.minZoom);
	return (
		<Controls
			position="bottom-left"
			showFitView={false}
			showInteractive={false}
			showZoom={false}
		>
			<ControlButton
				aria-label="Zoom In"
				disabled={atMaxZoom}
				onClick={() =>
					zoomIn().catch(() => onError("Couldn't zoom in. Please try again."))
				}
				title="Zoom in"
			>
				<Plus aria-hidden="true" size={17} />
			</ControlButton>
			<ControlButton
				aria-label="Zoom Out"
				disabled={atMinZoom}
				onClick={() =>
					zoomOut().catch(() => onError("Couldn't zoom out. Please try again."))
				}
				title="Zoom out"
			>
				<Minus aria-hidden="true" size={17} />
			</ControlButton>
			<ControlButton
				aria-label="Fit View"
				onClick={() =>
					fitView().catch(() =>
						onError("Couldn't fit the canvas. Please try again.")
					)
				}
				title="Fit view"
			>
				<Maximize aria-hidden="true" size={17} />
			</ControlButton>
		</Controls>
	);
}
