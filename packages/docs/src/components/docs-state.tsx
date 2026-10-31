import Link from "fumadocs-core/link";
import { buttonVariants } from "fumadocs-ui/components/ui/button";
import { ArrowRight, BookOpen, CircleAlert, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";
import { getDocsHref, useDocsConfig } from "../config";
import { BannerInk } from "./banner-ink";
import { DocsHeader } from "./docs-header";

function DocsState({
	label,
	title,
	description,
	icon,
	loading = false,
	children,
}: {
	label: string;
	title: string;
	description: string;
	icon: ReactNode;
	loading?: boolean;
	children?: ReactNode;
}) {
	return (
		<div className="anyway-docs-shell docs-system-state">
			<DocsHeader />
			{loading ? (
				<p className="sr-only" role="status">
					Loading documentation
				</p>
			) : null}
			<main
				aria-busy={loading}
				className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-6 py-16"
				id="nd-page"
				tabIndex={-1}
			>
				<div className="w-full max-w-md text-center">
					<div
						aria-hidden="true"
						className="mx-auto mb-6 grid size-12 place-items-center rounded-2xl bg-fd-muted/60 text-fd-muted-foreground"
					>
						{icon}
					</div>
					<p className="mb-3 text-fd-muted-foreground text-xs">{label}</p>
					<h1 className="font-[560] text-base leading-[1.4]">{title}</h1>
					<p className="mx-auto mt-3 max-w-sm font-[475] text-fd-muted-foreground text-sm leading-relaxed">
						{description}
					</p>
					{children}
				</div>
			</main>
		</div>
	);
}

function GuideLink() {
	const docsConfig = useDocsConfig();
	return (
		<Link
			className={buttonVariants({ variant: "ghost" })}
			href={getDocsHref(docsConfig)}
		>
			Back to the guide <ArrowRight aria-hidden="true" size={16} />
		</Link>
	);
}

export function DocsNotFound() {
	return (
		<div className="anyway-docs-shell docs-system-state">
			<DocsHeader />
			<main
				className="docs-not-found relative isolate flex min-h-[calc(100dvh-4rem)] items-center justify-center overflow-hidden px-6 py-10 text-center"
				id="nd-page"
				tabIndex={-1}
			>
				<BannerInk />
				<div className="relative z-10 w-full max-w-4xl">
					<h1
						aria-label="404 — Page not found"
						className="docs-not-found-number font-display font-normal italic"
						data-canvas-content
					>
						<span data-canvas-text>404</span>
					</h1>
				</div>
			</main>
		</div>
	);
}

export function DocsLoading() {
	return (
		<DocsState
			description="Getting the documentation ready."
			icon={<BookOpen size={22} />}
			label="Loading"
			loading
			title="Opening the page…"
		>
			<div aria-hidden="true" className="mx-auto mt-8 grid max-w-64 gap-3">
				<div className="h-2 rounded-full bg-fd-muted" />
				<div className="mx-auto h-2 w-5/6 rounded-full bg-fd-muted" />
				<div className="mx-auto h-2 w-2/3 rounded-full bg-fd-muted" />
			</div>
		</DocsState>
	);
}

function reloadPage() {
	window.location.reload();
}

export function DocsError() {
	return (
		<DocsState
			description="We couldn’t open this page. Try reloading, or return to the guide to find your place."
			icon={<CircleAlert size={22} />}
			label="Something went wrong"
			title="Let’s try that again."
		>
			<div className="docs-state-actions mt-8 flex flex-wrap items-center justify-center gap-2">
				<button
					className={buttonVariants({ variant: "primary" })}
					onClick={reloadPage}
					type="button"
				>
					<RotateCcw aria-hidden="true" size={16} /> Reload page
				</button>
				<GuideLink />
			</div>
		</DocsState>
	);
}
