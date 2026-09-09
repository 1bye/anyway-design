// biome-ignore-all lint/suspicious/noUnnecessaryConditions: React populates DOM refs after rendering; their initial null value is not their runtime value.
// biome-ignore-all lint/complexity/noVoid: Event and effect tasks handle their own errors; void marks intentional asynchronous dispatch.
// biome-ignore-all lint/performance/noJsxPropsBind: These un-memoized form controls need the current draft state in their event handlers.
import {
	ArrowDownToLine,
	ArrowUpRight,
	BookOpen,
	Check,
	Copy,
	Download,
	FileText,
	FolderOpen,
	KeyRound,
	Plus,
	Trash2,
	Upload,
	X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
	conflicts,
	DEFAULT_PRESET,
	generateMarkdown,
	type Preset,
	presetSchema,
	type SavedPreset,
} from "../lib/preset";
import { Dialog } from "./dialog";
import { SetupPreview } from "./preview";
import { Rules } from "./rules";
import { Skills } from "./skills";
import { Turnstile } from "./turnstile";

interface Config {
	challengeRequired: boolean;
	savesAvailable: boolean;
	siteKey: string | null;
}
interface LibraryState {
	presets: SavedPreset[];
	ready: boolean;
}
type Modal =
	| "library"
	| "help"
	| "preview"
	| "recover"
	| "recovery"
	| "verify"
	| null;
const DRAFT_KEY = "anyway-md:draft:v1";
const errorMessage = (error: unknown) =>
	error instanceof Error
		? error.message
		: "Something went wrong. Please try again.";

async function api<T>(
	path: string,
	method = "GET",
	body?: unknown
): Promise<T> {
	const response = await fetch(path, {
		body: body === undefined ? undefined : JSON.stringify(body),
		headers:
			body === undefined ? undefined : { "Content-Type": "application/json" },
		method,
	});
	const data = (await response.json()) as T & { error?: string };
	if (!response.ok) {
		throw new Error(data.error ?? "Something went wrong. Please try again.");
	}
	return data;
}

function download(name: string, text: string) {
	const url = URL.createObjectURL(
		new Blob([text], { type: "text/plain;charset=utf-8" })
	);
	const link = document.createElement("a");
	link.href = url;
	link.download = name;
	link.click();
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: This view keeps its declarative dialog states together; actions below remain separate.
export function Builder({ sharedId }: { sharedId?: string }) {
	const [preset, setPreset] = useState<Preset>(DEFAULT_PRESET);
	const [savedId, setSavedId] = useState<string | null>(null);
	const [snapshot, setSnapshot] = useState("");
	const [mode, setMode] = useState<"skills" | "rules">("rules");
	const [modal, setModal] = useState<Modal>(null);
	const [library, setLibrary] = useState<LibraryState>({
		presets: [],
		ready: false,
	});
	const [config, setConfig] = useState<Config | null>(null);
	const [origin, setOrigin] = useState("");
	const [hydrated, setHydrated] = useState(false);
	const [busy, setBusy] = useState(false);
	const [notice, setNotice] = useState<{ text: string; error: boolean } | null>(
		null
	);
	const [recoveryKey, setRecoveryKey] = useState("");
	const [recoverInput, setRecoverInput] = useState("");
	const [turnstileToken, setTurnstileToken] = useState("");
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const importRef = useRef<HTMLInputElement>(null);
	const dirty = JSON.stringify(preset) !== snapshot;
	const owned = library.presets.some((item) => item.id === savedId);
	const problems = conflicts(preset);

	useEffect(() => {
		let active = true;
		setOrigin(window.location.origin);
		if (!sharedId) {
			try {
				const value = localStorage.getItem(DRAFT_KEY);
				if (value) {
					const draft = JSON.parse(value) as {
						preset: unknown;
						id: string | null;
						snapshot: string;
					};
					setPreset(presetSchema.parse(draft.preset));
					setSavedId(typeof draft.id === "string" ? draft.id : null);
					setSnapshot(typeof draft.snapshot === "string" ? draft.snapshot : "");
				}
			} catch {
				setNotice({
					error: true,
					text: "Your previous draft could not be restored. You can import a saved preset file.",
				});
			}
		}
		async function initialize() {
			try {
				const [settings, collection, shared] = await Promise.all([
					api<Config>("/api/config"),
					api<LibraryState>("/api/library"),
					sharedId
						? api<SavedPreset>(`/api/presets/${encodeURIComponent(sharedId)}`)
						: null,
				]);
				if (!active) {
					return;
				}
				setConfig(settings);
				setLibrary(collection);
				if (shared) {
					const parsed = presetSchema.parse(shared.preset);
					setPreset(parsed);
					setSavedId(shared.id);
					setSnapshot(JSON.stringify(parsed));
					setNotice({
						error: false,
						text: "Shared setup loaded. Install it as-is, or save your own copy.",
					});
				}
			} catch (error) {
				if (active) {
					setNotice({
						error: true,
						text: errorMessage(error),
					});
				}
			} finally {
				if (active) {
					setHydrated(true);
				}
			}
		}
		void initialize();
		return () => {
			active = false;
		};
	}, [sharedId]);

	useEffect(() => {
		if (!notice || notice.error) {
			return;
		}
		const timer = setTimeout(() => setNotice(null), 5000);
		return () => clearTimeout(timer);
	}, [notice]);

	useEffect(() => {
		if (!hydrated || (sharedId && !dirty)) {
			return;
		}
		const timer = setTimeout(() => {
			try {
				localStorage.setItem(
					DRAFT_KEY,
					JSON.stringify({ id: savedId, preset, snapshot })
				);
			} catch {
				setNotice({
					error: true,
					text: "Browser storage is unavailable. Save or export your setup to keep it.",
				});
			}
		}, 350);
		return () => clearTimeout(timer);
	}, [preset, savedId, snapshot, hydrated, sharedId, dirty]);

	function report(error: unknown) {
		setNotice({
			error: true,
			text:
				error instanceof Error
					? error.message
					: "Something went wrong. Please try again.",
		});
	}
	async function copy(text: string) {
		try {
			await navigator.clipboard.writeText(text);
			setNotice({ error: false, text: "Copied to clipboard." });
		} catch {
			setNotice({
				error: true,
				text: "Clipboard access is unavailable. Select and copy the text, or use Download.",
			});
		}
	}
	async function refreshLibrary() {
		const collection = await api<LibraryState>("/api/library");
		setLibrary(collection);
		return collection;
	}
	async function save() {
		if (!config) {
			report(
				new Error(
					"The save service is still loading. Please try again shortly."
				)
			);
			return;
		}
		if (!config.savesAvailable) {
			report(
				new Error(
					"Cloud saves are not configured yet. Download your preset JSON to keep it."
				)
			);
			return;
		}
		if (!library.ready && config.challengeRequired && !turnstileToken) {
			setModal("verify");
			return;
		}
		setBusy(true);
		try {
			const parsed = presetSchema.parse(preset);
			if (!library.ready) {
				const created = await api<{ recoveryKey?: string }>(
					"/api/library",
					"POST",
					{ turnstileToken }
				);
				if (created.recoveryKey) {
					setRecoveryKey(created.recoveryKey);
					setModal("recovery");
				}
				await refreshLibrary();
			}
			const result = await api<SavedPreset>(
				owned && savedId ? `/api/presets/${savedId}` : "/api/presets",
				owned ? "PUT" : "POST",
				parsed
			);
			setPreset(result.preset);
			setSavedId(result.id);
			setSnapshot(JSON.stringify(result.preset));
			await refreshLibrary();
			setNotice({
				error: false,
				text: "Setup saved. Your install command is ready.",
			});
		} catch (error) {
			report(error);
		} finally {
			setBusy(false);
			setTurnstileToken("");
		}
	}
	function load(item: SavedPreset) {
		setPreset(presetSchema.parse(item.preset));
		setSavedId(item.id);
		setSnapshot(JSON.stringify(item.preset));
		setModal(null);
		setNotice({ error: false, text: `Opened ${item.preset.name}.` });
	}
	async function remove(id: string) {
		setBusy(true);
		try {
			await api(`/api/presets/${id}`, "DELETE");
			await refreshLibrary();
			if (savedId === id) {
				setSavedId(null);
				setSnapshot("");
			}
			setDeleteId(null);
			setNotice({
				error: false,
				text: "Setup deleted. Its shared link is now disabled.",
			});
		} catch (error) {
			report(error);
		} finally {
			setBusy(false);
		}
	}
	async function restore() {
		setBusy(true);
		try {
			await api("/api/recover", "POST", { key: recoverInput.trim() });
			await refreshLibrary();
			setRecoverInput("");
			setModal("library");
			setNotice({
				error: false,
				text: "Library restored. The previous browser session has been signed out.",
			});
		} catch (error) {
			report(error);
		} finally {
			setBusy(false);
		}
	}
	async function newRecoveryKey() {
		setBusy(true);
		try {
			const result = await api<{ recoveryKey: string }>(
				"/api/recovery",
				"POST",
				{}
			);
			setRecoveryKey(result.recoveryKey);
			setModal("recovery");
		} catch (error) {
			report(error);
		} finally {
			setBusy(false);
		}
	}
	async function importFile(file?: File) {
		if (!file) {
			return;
		}
		try {
			if (file.size > 1_048_576) {
				throw new Error("Preset files must be smaller than 1 MB.");
			}
			const parsed = presetSchema.parse(JSON.parse(await file.text()));
			setPreset(parsed);
			setSavedId(null);
			setSnapshot("");
			setModal(null);
			setNotice({
				error: false,
				text: "Preset imported. Save it to get an install command.",
			});
		} catch (error) {
			report(error);
		} finally {
			if (importRef.current) {
				importRef.current.value = "";
			}
		}
	}
	function newSetup() {
		setPreset({ ...DEFAULT_PRESET, name: "Untitled setup", skills: [] });
		setSavedId(null);
		setSnapshot("");
		setModal(null);
	}

	return (
		<>
			<a className="skip-link" href="#builder">
				Skip to builder
			</a>
			<header className="site-header">
				<a aria-label="Anyway MD home" className="brand" href="/">
					<img
						alt="Anyway"
						className="brand-wordmark"
						height={887}
						src="/brand/anyway-wordmark.png"
						width={1774}
					/>
					<span aria-hidden="true" className="brand-divider" />
					<span className="brand-md">md</span>
				</a>
				<nav aria-label="Main navigation" className="header-nav">
					<a aria-current="page" className="nav-pill" href="#builder">
						Builder
					</a>
					<button onClick={() => setModal("help")} type="button">
						How it works <ArrowUpRight size={12} />
					</button>
				</nav>
				<button
					className="library-button"
					onClick={() => setModal("library")}
					type="button"
				>
					<FolderOpen size={16} />
					<span>Saved setups</span>
					<span className="count-badge">{library.presets.length}</span>
				</button>
			</header>
			<main className="page-shell">
				<section className="hero">
					<h1>
						Start with <span>your standards.</span>
					</h1>
					<p>
						The skills you trust. The rules you work by.
						<br />
						One setup, ready for every new project.
					</p>
					<div className="hero-meta">
						<span>No account needed</span>
						<span>
							Built by{" "}
							<a
								href="https://1bye.dev"
								rel="noopener noreferrer"
								target="_blank"
							>
								Yurii Hulyk <ArrowUpRight size={10} />
							</a>
						</span>
					</div>
				</section>
				<div className="workspace" id="builder">
					<div className="builder-main">
						<div className="mode-bar">
							<fieldset aria-label="Builder mode" className="mode-switch">
								<button
									aria-pressed={mode === "rules"}
									onClick={() => setMode("rules")}
									type="button"
								>
									<span className="step-number">01</span> Rules{" "}
									<span className="mode-count">{preset.rules.length}</span>
								</button>
								<button
									aria-pressed={mode === "skills"}
									onClick={() => setMode("skills")}
									type="button"
								>
									<span className="step-number">02</span> Skills{" "}
									<span className="mode-count">{preset.skills.length}</span>
								</button>
							</fieldset>
							<button
								className="import-button text-button"
								onClick={() => importRef.current?.click()}
								type="button"
							>
								<Upload size={14} /> Import preset
							</button>
						</div>
						{mode === "skills" ? (
							<Skills
								onToggle={(id) =>
									setPreset((current) => ({
										...current,
										skills: current.skills.includes(id)
											? current.skills.filter((item) => item !== id)
											: [...current.skills, id],
									}))
								}
								selected={preset.skills}
							/>
						) : (
							<Rules onChange={setPreset} preset={preset} />
						)}
					</div>
					<SetupPreview
						dirty={dirty}
						onChange={setPreset}
						onCopy={(text) => {
							void copy(text);
						}}
						onDownload={download}
						onInspect={() => setModal("preview")}
						onSave={() => {
							void save();
						}}
						origin={origin}
						owned={owned}
						preset={preset}
						problems={problems}
						savedId={savedId}
						saving={busy}
					/>
				</div>
			</main>
			<footer className="site-footer">
				<div>
					<a className="footer-brand" href="https://anyway.design">
						<img
							alt="Anyway"
							className="brand-wordmark"
							height={887}
							src="/brand/anyway-wordmark.png"
							width={1774}
						/>
					</a>
					<span>Small interfaces, overthought.</span>
				</div>
			</footer>
			<a className="mobile-setup-link" href="#your-setup">
				Your setup{" "}
				<span>
					{preset.skills.length} skills · {preset.rules.length} rules
				</span>
				<ArrowDownToLine size={16} />
			</a>
			{notice ? (
				<div
					className={`notice ${notice.error ? "notice-error" : ""}`}
					role={notice.error ? "alert" : "status"}
				>
					{notice.error ? <span>!</span> : <Check size={16} />}
					<p>{notice.text}</p>
					<button
						aria-label="Dismiss message"
						onClick={() => setNotice(null)}
						type="button"
					>
						<X size={16} />
					</button>
				</div>
			) : null}
			<input
				accept=".json,application/json"
				aria-label="Import preset JSON"
				className="sr-only"
				onChange={(event) => {
					void importFile(event.target.files?.[0]);
				}}
				ref={importRef}
				tabIndex={-1}
				type="file"
			/>
			{modal === "preview" ? (
				<Dialog
					message={notice}
					onClose={() => setModal(null)}
					title="Your AGENTS.md"
					wide
				>
					<p className="dialog-description">
						The exact instructions your setup will install.
					</p>
					<pre className="skill-document">{generateMarkdown(preset)}</pre>
					<div className="dialog-actions">
						<button
							className="secondary-button"
							onClick={() => {
								void copy(generateMarkdown(preset));
							}}
							type="button"
						>
							<Copy size={15} /> Copy Markdown
						</button>
						<button
							className="primary-button"
							onClick={() => download("AGENTS.md", generateMarkdown(preset))}
							type="button"
						>
							<Download size={15} /> Download
						</button>
					</div>
				</Dialog>
			) : null}
			{modal === "help" ? (
				<Dialog
					message={notice}
					onClose={() => setModal(null)}
					title="A better second command."
				>
					<ol className="guide-steps">
						<li>
							<span>01</span>
							<div>
								<h3>Make your setup</h3>
								<p>
									Pick useful skills, choose coding rules, and select your
									agent. Inspect the exact instructions at any time.
								</p>
							</div>
						</li>
						<li>
							<span>02</span>
							<div>
								<h3>Save it once</h3>
								<p>
									Your browser remembers your library. Keep the private recovery
									key to restore access on another device. Five setups, no
									signup.
								</p>
							</div>
						</li>
						<li>
							<span>03</span>
							<div>
								<h3>Bring it to your next project</h3>
								<p>
									After creating your project, run the saved install command in
									its folder. The installer requires Node.js 22+ and Git, and
									refuses to overwrite existing files unless you explicitly
									request a backup and replacement.
								</p>
							</div>
						</li>
					</ol>
					<div className="info-box">
						<BookOpen size={17} />
						<p>
							Shared setups are unlisted. Anyone with the link can view and
							install them. Editing requires your browser session or private
							recovery key. Keep secrets out of shared rules.
						</p>
					</div>
					<p className="field-hint">
						This first catalog is curated from public repositories. Each skill
						retains its upstream license and may have its own tool requirements.
					</p>
				</Dialog>
			) : null}
			{modal === "library" ? (
				<Dialog
					message={notice}
					onClose={() => setModal(null)}
					sheet
					title="Your saved setups"
				>
					<p className="dialog-description">
						{library.presets.length} of 5 setups · Remembered by this browser.
					</p>
					<div className="saved-list">
						{library.presets.map((item) => (
							<div className="saved-item" key={item.id}>
								<button
									className="saved-open"
									onClick={() => load(item)}
									type="button"
								>
									<FileText size={19} />
									<span>
										<span>{item.preset.name}</span>
										<small>
											{item.preset.skills.length} skills ·{" "}
											{item.preset.rules.length} rules
										</small>
									</span>
								</button>
								{deleteId === item.id ? (
									<button
										className="delete-confirm"
										disabled={busy}
										onClick={() => {
											void remove(item.id);
										}}
										type="button"
									>
										Delete setup?
									</button>
								) : (
									<button
										aria-label={`Delete ${item.preset.name}`}
										className="icon-button"
										onClick={() => setDeleteId(item.id)}
										type="button"
									>
										<Trash2 size={15} />
									</button>
								)}
							</div>
						))}
					</div>
					{library.presets.length === 0 ? (
						<div className="empty-state">
							<FolderOpen size={28} />
							<h3>A place for your go-to setups.</h3>
							<p>Save your first one from the builder.</p>
						</div>
					) : null}
					<div className="library-actions">
						<button
							className="secondary-button"
							onClick={newSetup}
							type="button"
						>
							<Plus size={15} /> New setup
						</button>
						<button
							className="secondary-button"
							onClick={() => setModal("recover")}
							type="button"
						>
							<KeyRound size={15} /> Restore library
						</button>
					</div>
					{library.ready ? (
						<button
							className="recovery-reset text-button"
							disabled={busy}
							onClick={() => {
								void newRecoveryKey();
							}}
							type="button"
						>
							Create a new recovery key (replaces the old one)
						</button>
					) : null}
				</Dialog>
			) : null}
			{modal === "recover" ? (
				<Dialog
					message={notice}
					onClose={() => setModal(null)}
					sheet
					title="Bring your library back"
				>
					<p className="dialog-description">
						Paste your private recovery key. This restores your saved setups
						here and signs out the previous browser session.
					</p>
					<form
						onSubmit={(event) => {
							event.preventDefault();
							void restore();
						}}
					>
						<label className="field-label" htmlFor="recovery-input">
							Recovery key
						</label>
						<input
							autoComplete="off"
							className="mono text-input"
							id="recovery-input"
							maxLength={64}
							minLength={64}
							onChange={(event) => setRecoverInput(event.target.value)}
							required
							type="password"
							value={recoverInput}
						/>
						<button
							className="primary-button full-width"
							disabled={busy || recoverInput.trim().length !== 64}
							type="submit"
						>
							{busy ? "Restoring…" : "Restore library"}
							<KeyRound size={15} />
						</button>
					</form>
				</Dialog>
			) : null}
			{modal === "recovery" ? (
				<Dialog
					message={notice}
					onClose={() => {
						setModal(null);
						setRecoveryKey("");
					}}
					sheet
					title="Keep the key to your library"
				>
					<p className="dialog-description">
						This private key restores editing access if you switch devices or
						clear your browser. It is separate from your share links.
					</p>
					<code className="recovery-key">{recoveryKey}</code>
					<div className="dialog-actions">
						<button
							className="secondary-button"
							onClick={() => {
								void copy(recoveryKey);
							}}
							type="button"
						>
							<Copy size={15} /> Copy key
						</button>
						<button
							className="primary-button"
							onClick={() =>
								download(
									"anyway-md-recovery.txt",
									`Anyway MD private recovery key\n\n${recoveryKey}\n\nRestore at ${origin}. Anyone with this key can edit your saved setups.\n`
								)
							}
							type="button"
						>
							<Download size={15} /> Download key
						</button>
					</div>
					<p className="field-hint">
						Keep it somewhere private. Losing both this key and your browser
						session means losing editing access.
					</p>
				</Dialog>
			) : null}
			{modal === "verify" && config?.siteKey ? (
				<Dialog
					message={notice}
					onClose={() => {
						setModal(null);
						setTurnstileToken("");
					}}
					title="One quick check"
				>
					<p className="dialog-description">
						Help keep anonymous saves available for everyone.
					</p>
					<Turnstile onToken={setTurnstileToken} siteKey={config.siteKey} />
					<button
						className="primary-button full-width"
						disabled={!turnstileToken || busy}
						onClick={() => {
							void save();
						}}
						type="button"
					>
						{busy ? "Saving…" : "Verify & save setup"}
					</button>
				</Dialog>
			) : null}
		</>
	);
}
