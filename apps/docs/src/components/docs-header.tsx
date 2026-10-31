import { Link } from "@tanstack/react-router";
import { buttonVariants } from "fumadocs-ui/components/ui/button";
import {
	FullSearchTrigger,
	SearchTrigger,
} from "fumadocs-ui/layouts/shared/slots/search-trigger";
import {
	ArrowRight,
	ArrowUpRight,
	BookOpen,
	Component,
	GitFork,
} from "lucide-react";

export function DocsHeader() {
	return (
		<header className="anyway-docs-header">
			<div className="mx-auto grid h-16 max-w-(--fd-layout-width) grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 px-4 md:grid-cols-[minmax(0,1fr)_minmax(0,20rem)_minmax(0,1fr)] md:px-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,24rem)_minmax(0,1fr)]">
				<Link
					aria-label="Anyway documentation home"
					className="inline-flex items-center justify-self-start"
					to="/"
				>
					<img
						alt="Anyway"
						className="h-10 w-20 object-contain max-[360px]:h-8 max-[360px]:w-16 sm:h-12 sm:w-24 dark:invert"
						height={887}
						src="/brand/anyway-wordmark.png"
						width={1774}
					/>
					<span
						aria-hidden="true"
						className="mx-2 h-6 w-px -skew-x-24 bg-fd-muted-foreground/60"
					/>
					<span className="-skew-x-10 font-light text-xl tracking-[-0.065em]">
						docs
					</span>
				</Link>
				<SearchTrigger className="docs-header-search h-11 w-11 justify-self-center md:hidden" />
				<FullSearchTrigger
					aria-label="Search documentation"
					className="docs-header-search hidden w-full md:inline-flex"
				/>
				<a
					aria-label="Anyway on GitHub"
					className="inline-flex items-center gap-2 justify-self-end rounded-md p-2 text-fd-muted-foreground text-sm hover:text-fd-foreground"
					href="https://github.com/1bye/anyway-design"
					rel="noopener noreferrer"
					target="_blank"
				>
					<GitFork aria-hidden="true" size={16} />
					<span className="hidden sm:inline">GitHub</span>
					<ArrowUpRight
						aria-hidden="true"
						className="hidden sm:inline"
						size={12}
					/>
				</a>
			</div>
		</header>
	);
}

export function DocsSectionTabs() {
	return (
		<nav aria-label="Documentation sections" className="anyway-docs-sections">
			<Link
				activeOptions={{ exact: true }}
				className={buttonVariants({
					className: "justify-start gap-2 font-normal text-sm",
					variant: "ghost",
				})}
				params={{ _splat: "getting-started" }}
				to="/docs/$"
			>
				<BookOpen aria-hidden="true" size={15} /> Documentation
			</Link>
			<Link
				activeOptions={{ exact: true }}
				className={buttonVariants({
					className: "justify-start gap-2 font-normal text-sm",
					variant: "ghost",
				})}
				params={{ _splat: "components/switch" }}
				to="/docs/$"
			>
				<Component aria-hidden="true" size={15} /> Components
			</Link>
		</nav>
	);
}

export function DocsWelcomeBanner() {
	return (
		<section
			aria-label="Welcome to Anyway"
			className="border-b px-6 py-16 text-center md:py-20"
		>
			<div className="mx-auto max-w-5xl">
				<p className="font-display font-normal text-[40px] italic leading-none sm:text-[56px] md:text-[68px]">
					Build it the
					<br />
					Anyway way.
				</p>
				<div className="docs-hero-actions mt-8 flex flex-wrap items-center justify-center gap-4">
					<Link
						className={buttonVariants({ variant: "primary" })}
						hash="find-your-starting-point"
						params={{ _splat: "getting-started" }}
						to="/docs/$"
					>
						Read the guide <ArrowRight aria-hidden="true" size={16} />
					</Link>
					<Link
						className={buttonVariants({ variant: "ghost" })}
						params={{ _splat: "components/switch" }}
						to="/docs/$"
					>
						Explore components <ArrowUpRight aria-hidden="true" size={16} />
					</Link>
				</div>
			</div>
		</section>
	);
}
