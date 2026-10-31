import { Link } from "@tanstack/react-router";
import { buttonVariants } from "fumadocs-ui/components/ui/button";
import { useSearchContext } from "fumadocs-ui/contexts/search";
import {
	ArrowRight,
	BookOpen,
	CircleAlert,
	FileQuestion,
	RotateCcw,
	Search,
} from "lucide-react";
import { type ReactNode, useCallback } from "react";
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

function GuideLink({ variant = "ghost" }: { variant?: "primary" | "ghost" }) {
	return (
		<Link
			className={buttonVariants({ variant })}
			params={{ _splat: "getting-started" }}
			to="/docs/$"
		>
			Back to the guide <ArrowRight aria-hidden="true" size={16} />
		</Link>
	);
}

export function DocsNotFound() {
	const { setOpenSearch } = useSearchContext();
	const openSearch = useCallback(() => setOpenSearch(true), [setOpenSearch]);
	return (
		<DocsState
			description="This link may have changed, or the page may have moved. Let’s find your way back."
			icon={<FileQuestion size={22} />}
			label="404 · Page not found"
			title="This page isn’t here."
		>
			<div className="docs-state-actions mt-8 flex flex-wrap items-center justify-center gap-2">
				<GuideLink variant="primary" />
				<button
					className={buttonVariants({ variant: "ghost" })}
					onClick={openSearch}
					type="button"
				>
					<Search aria-hidden="true" size={16} /> Search docs
				</button>
			</div>
		</DocsState>
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
