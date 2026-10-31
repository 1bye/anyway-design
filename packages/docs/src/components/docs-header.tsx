import { usePathname } from "fumadocs-core/framework";
import Link from "fumadocs-core/link";
import { buttonVariants } from "fumadocs-ui/components/ui/button";
import {
	FullSearchTrigger,
	SearchTrigger,
} from "fumadocs-ui/layouts/shared/slots/search-trigger";
import { ThemeSwitch } from "fumadocs-ui/layouts/shared/slots/theme-switch";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Fragment } from "react";
import { getDocsHref, useDocsConfig } from "../config";
import { BannerInk } from "./banner-ink";

export function DocsHeader() {
	const docsConfig = useDocsConfig();
	return (
		<header className="anyway-docs-header">
			<a className="docs-skip-link" href="#nd-page">
				Skip to content
			</a>
			<div className="mx-auto grid h-16 max-w-(--fd-layout-width) grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 px-4 md:grid-cols-[minmax(0,1fr)_minmax(0,20rem)_minmax(0,1fr)] md:px-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,24rem)_minmax(0,1fr)]">
				<Link
					aria-label={`${docsConfig.name} documentation home`}
					className="inline-flex items-baseline justify-self-start text-fd-muted-foreground hover:text-fd-foreground"
					data-header-label={docsConfig.headerLabel}
					href={getDocsHref(docsConfig)}
				>
					{/* Align the letter baseline while letting the y descenders extend below it. */}
					<span
						aria-hidden="true"
						className="docs-brand-wordmark relative block w-18 shrink-0 max-[360px]:w-16 sm:w-22"
						style={{
							aspectRatio: `${docsConfig.logo.width} / ${docsConfig.logo.baseline}`,
						}}
					>
						<span
							className="mask-contain mask-center mask-no-repeat absolute top-0 left-0 block w-full bg-current"
							style={{
								aspectRatio: `${docsConfig.logo.width} / ${docsConfig.logo.height}`,
								maskImage: `url("${docsConfig.logo.src}")`,
							}}
						/>
					</span>
					<span
						aria-hidden="true"
						className="docs-brand-divider mx-2 h-6 w-px -skew-x-24 self-center bg-fd-muted-foreground/60"
					/>
					<span className="docs-brand-label -skew-x-10 font-light text-xl tracking-[-0.065em]">
						{docsConfig.headerLabel ?? "docs"}
					</span>
				</Link>
				<SearchTrigger className="docs-header-search h-11 w-11 justify-self-center md:hidden" />
				<FullSearchTrigger
					aria-label="Search documentation"
					className="docs-header-search hidden w-full md:inline-flex"
				/>
				<div className="flex items-center gap-1 justify-self-end">
					<a
						aria-label={`${docsConfig.name} on GitHub`}
						className="inline-flex items-center gap-2 rounded-md p-2 text-fd-muted-foreground text-sm hover:text-fd-foreground"
						href={docsConfig.repositoryUrl}
						rel="noopener noreferrer"
						target="_blank"
					>
						<svg
							aria-hidden="true"
							fill="currentColor"
							height={16}
							viewBox="0 0 16 16"
							width={16}
						>
							<path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
						</svg>
						<span className="hidden sm:inline">GitHub</span>
					</a>
					<ThemeSwitch className="shrink-0 border-0 p-1.5" />
				</div>
			</div>
		</header>
	);
}

export function DocsSectionTabs() {
	const docsConfig = useDocsConfig();
	const pathname = usePathname();
	return (
		<nav aria-label="Documentation sections" className="anyway-docs-sections">
			{docsConfig.navigation.map(({ label, slug, icon: Icon }) => (
				<Link
					aria-current={
						pathname === getDocsHref(docsConfig, slug) ? "page" : undefined
					}
					className={buttonVariants({
						className: "justify-start gap-2 font-normal text-sm",
						variant: "ghost",
					})}
					href={getDocsHref(docsConfig, slug)}
					key={slug}
				>
					<Icon aria-hidden="true" size={15} /> {label}
				</Link>
			))}
		</nav>
	);
}

export function DocsWelcomeBanner() {
	const docsConfig = useDocsConfig();
	return (
		<section
			aria-label={`Welcome to ${docsConfig.name}`}
			className="docs-welcome-banner relative isolate overflow-hidden border-b px-6 py-16 text-center md:py-20"
		>
			<BannerInk />
			<div className="relative z-10 mx-auto max-w-5xl" data-canvas-content>
				<p className="font-display font-normal text-[40px] italic leading-none sm:text-[56px] md:text-[68px]">
					{docsConfig.hero.lines.map((line, index) => (
						<Fragment key={line}>
							{index > 0 ? <br /> : null}
							<span data-canvas-text>{line}</span>
						</Fragment>
					))}
				</p>
				<div className="docs-hero-actions mt-8 flex flex-wrap items-center justify-center gap-4">
					{docsConfig.hero.actions.map((action) => (
						<Link
							className={buttonVariants({ variant: action.variant })}
							data-canvas-action={action.variant}
							href={`${getDocsHref(docsConfig, action.slug)}${action.hash ? `#${action.hash}` : ""}`}
							key={`${action.slug}#${action.hash ?? ""}`}
						>
							<span data-canvas-text>{action.label}</span>{" "}
							{action.variant === "primary" ? (
								<ArrowRight aria-hidden="true" size={16} />
							) : (
								<ArrowUpRight aria-hidden="true" size={16} />
							)}
						</Link>
					))}
				</div>
			</div>
		</section>
	);
}
