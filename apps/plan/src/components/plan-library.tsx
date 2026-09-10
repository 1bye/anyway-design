// biome-ignore-all lint/performance/noJsxPropsBind: Library actions capture the selected saved plan.
import { animate } from "animejs";
import { ArrowDownToLine, Copy, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { errorMessage, type Plan } from "../lib/plan";
import {
	deleteSavedPlan,
	exportPlan,
	readSavedPlans,
	SAVED_PLANS_KEY,
	type SavedPlan,
	savePlan,
} from "../lib/plan-storage";

export function PlanLibrary({
	plan,
	activeId,
	onSave,
	onOpen,
	onNew,
	onImport,
	onDelete,
	onClose,
}: {
	plan: Plan;
	activeId: string | null;
	onSave: (saved: SavedPlan) => void;
	onOpen: (saved: SavedPlan) => void;
	onNew: () => void;
	onImport: () => void;
	onDelete: (id: string) => void;
	onClose: () => void;
}) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const [name, setName] = useState(plan.name);
	const [plans, setPlans] = useState<SavedPlan[]>([]);
	const [error, setError] = useState("");
	const [message, setMessage] = useState("");
	const active = plans.some((entry) => entry.id === activeId);
	useEffect(() => {
		function load() {
			try {
				setPlans(readSavedPlans(localStorage));
				setError("");
			} catch {
				setError(
					"Saved plans couldn't be loaded. Your current canvas can still be exported."
				);
			}
		}
		load();
		const listener = (event: StorageEvent) => {
			if (event.key === SAVED_PLANS_KEY || event.key === null) {
				load();
			}
		};
		window.addEventListener("storage", listener);
		return () => window.removeEventListener("storage", listener);
	}, []);
	useEffect(() => {
		const dialog = dialogRef.current;
		// biome-ignore lint/suspicious/noUnnecessaryConditions: React assigns this nullable DOM ref after rendering.
		if (!dialog) {
			return;
		}
		const trigger = document.activeElement;
		dialog.showModal();
		dialog.querySelector("input")?.focus({ preventScroll: true });
		const motion = animate(dialog, {
			duration: matchMedia("(prefers-reduced-motion: reduce)").matches
				? 0
				: 220,
			ease: "out(3)",
			opacity: [0, 1],
			translateY: [10, 0],
		});
		return () => {
			motion.revert();
			dialog.close();
			if (trigger instanceof HTMLElement) {
				trigger.focus({ preventScroll: true });
			}
		};
	}, []);

	function save(copy = false) {
		if (!name.trim()) {
			return;
		}
		try {
			const saved = savePlan(
				localStorage,
				{ ...plan, name: name.trim() },
				copy ? undefined : (activeId ?? undefined)
			);
			setPlans(readSavedPlans(localStorage));
			onSave(saved);
			setName(saved.plan.name);
			setError("");
			setMessage("Saved in this browser.");
		} catch (failure) {
			setError(
				`Couldn't save this plan. Try exporting it instead. ${errorMessage(failure)}`
			);
			setMessage("");
		}
	}
	function remove(saved: SavedPlan) {
		if (
			// biome-ignore lint/suspicious/noAlert: Confirm deletion of a user-saved plan before removing its only local copy.
			!window.confirm(
				`Delete “${saved.plan.name}” from saved plans? The current canvas will stay open.`
			)
		) {
			return;
		}
		try {
			deleteSavedPlan(localStorage, saved.id);
			setPlans(readSavedPlans(localStorage));
			onDelete(saved.id);
			setError("");
			setMessage("Plan deleted.");
		} catch (failure) {
			setError(`Couldn't delete this plan. ${errorMessage(failure)}`);
		}
	}
	return (
		// biome-ignore lint/a11y/noNoninteractiveElementInteractions: The native dialog isolates keyboard shortcuts and supports backdrop dismissal.
		<dialog
			aria-labelledby="plan-library-title"
			className="plan-library"
			onCancel={(event) => {
				event.preventDefault();
				onClose();
			}}
			onClick={(event) => {
				if (event.target !== event.currentTarget) {
					return;
				}
				const bounds = event.currentTarget.getBoundingClientRect();
				if (
					event.clientX < bounds.left ||
					event.clientX > bounds.right ||
					event.clientY < bounds.top ||
					event.clientY > bounds.bottom
				) {
					onClose();
				}
			}}
			onKeyDown={(event) => event.stopPropagation()}
			ref={dialogRef}
		>
			<header className="plan-library-header">
				<h2 id="plan-library-title">Plans</h2>
				<div>
					<button className="plan-text-button" onClick={onNew} type="button">
						New
					</button>
					<button className="plan-text-button" onClick={onImport} type="button">
						Import
					</button>
				</div>
			</header>
			<form
				className="plan-save-form"
				onSubmit={(event) => {
					event.preventDefault();
					save();
				}}
			>
				<label className="sr-only" htmlFor="saved-plan-name">
					Plan name
				</label>
				<input
					className="text-field"
					id="saved-plan-name"
					maxLength={100}
					onChange={(event) => {
						setName(event.target.value);
						setMessage("");
					}}
					placeholder="Plan name"
					required
					value={name}
				/>
				<button
					className="plan-save-primary"
					disabled={!name.trim()}
					type="submit"
				>
					Save
				</button>
				{active ? (
					<button
						aria-label="Save a copy"
						className="icon-button"
						disabled={!name.trim()}
						onClick={() => save(true)}
						title="Save a copy"
						type="button"
					>
						<Copy aria-hidden="true" size={15} />
					</button>
				) : null}
				<button
					aria-label="Export current plan"
					className="icon-button"
					onClick={() =>
						exportPlan({ ...plan, name: name.trim() || plan.name })
					}
					title="Export current plan"
					type="button"
				>
					<ArrowDownToLine aria-hidden="true" size={15} />
				</button>
				{message ? (
					<p className="sr-only" role="status">
						{message}
					</p>
				) : null}
			</form>
			{error ? (
				<p className="plan-library-error" role="alert">
					{error}
				</p>
			) : null}
			{plans.length ? (
				<ul aria-label="Saved plans" className="saved-plan-list">
					{plans.map((saved) => (
						<li data-current={saved.id === activeId} key={saved.id}>
							<button
								aria-current={saved.id === activeId ? "true" : undefined}
								className="saved-plan-open"
								onClick={() => onOpen(saved)}
								type="button"
							>
								{saved.plan.name}
							</button>
							<button
								aria-label={`Export ${saved.plan.name}`}
								className="icon-button"
								onClick={() => exportPlan(saved.plan)}
								title="Export plan"
								type="button"
							>
								<ArrowDownToLine aria-hidden="true" size={15} />
							</button>
							<button
								aria-label={`Delete ${saved.plan.name}`}
								className="icon-button"
								onClick={() => remove(saved)}
								title="Delete saved plan"
								type="button"
							>
								<Trash2 aria-hidden="true" size={15} />
							</button>
						</li>
					))}
				</ul>
			) : (
				<p className="saved-plans-empty">No saved plans yet.</p>
			)}
		</dialog>
	);
}
