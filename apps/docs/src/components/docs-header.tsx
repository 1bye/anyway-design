import { Link } from "@tanstack/react-router";
import { buttonVariants } from "fumadocs-ui/components/ui/button";
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
			<div className="mx-auto flex h-16 max-w-(--fd-layout-width) items-center justify-between px-4 md:px-8">
				<Link aria-label="Anyway documentation home" to="/">
					<img
						alt="Anyway"
						className="h-12 w-24 object-contain dark:invert"
						height={887}
						src="/brand/anyway-wordmark.png"
						width={1774}
					/>
				</Link>
				<div className="flex items-center gap-3">
					<a
						aria-label="Anyway on GitHub"
						className="inline-flex items-center gap-2 rounded-md p-2 text-fd-muted-foreground text-xs hover:text-fd-foreground"
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
					<Link
						className={buttonVariants({
							className: "rounded-full",
							size: "sm",
							variant: "secondary",
						})}
						hash="work-in-the-workspace"
						params={{ _splat: "getting-started" }}
						to="/docs/$"
					>
						Get started <ArrowRight aria-hidden="true" size={13} />
					</Link>
				</div>
			</div>
			<div className="border-t">
				<nav
					aria-label="Documentation sections"
					className="mx-auto flex h-11 max-w-(--fd-layout-width) gap-7 px-4 md:px-8"
				>
					<Link
						activeOptions={{ exact: true }}
						className="inline-flex h-full items-center gap-2 border-transparent border-b-2 text-fd-muted-foreground text-sm hover:text-fd-foreground aria-[current=page]:border-fd-foreground aria-[current=page]:text-fd-foreground"
						params={{ _splat: "getting-started" }}
						to="/docs/$"
					>
						<BookOpen aria-hidden="true" size={15} /> Documentation
					</Link>
					<Link
						activeOptions={{ exact: true }}
						className="inline-flex h-full items-center gap-2 border-transparent border-b-2 text-fd-muted-foreground text-sm hover:text-fd-foreground aria-[current=page]:border-fd-foreground aria-[current=page]:text-fd-foreground"
						params={{ _splat: "components/switch" }}
						to="/docs/$"
					>
						<Component aria-hidden="true" size={15} /> Components
					</Link>
				</nav>
			</div>
		</header>
	);
}

export function DocsWelcomeBanner() {
	return (
		<section
			aria-label="Welcome to Anyway"
			className="border-b px-6 py-16 text-center md:py-20"
		>
			<p className="mb-6 text-fd-muted-foreground text-xs uppercase tracking-widest">
				The Anyway documentation
			</p>
			<p className="font-medium text-[clamp(2.75rem,6vw,5rem)] leading-[1.05] tracking-[-0.045em]">
				Build it the
				<br />
				Anyway way.
			</p>
			<p className="mx-auto mt-6 max-w-md text-fd-muted-foreground text-sm leading-relaxed">
				Guides, components, and the small decisions behind every Anyway project.
			</p>
			<div className="mt-8 flex flex-wrap items-center justify-center gap-4">
				<Link
					className={buttonVariants({ size: "sm", variant: "primary" })}
					hash="find-your-starting-point"
					params={{ _splat: "getting-started" }}
					to="/docs/$"
				>
					Read the guide <ArrowRight aria-hidden="true" size={14} />
				</Link>
				<Link
					className={buttonVariants({ size: "sm", variant: "ghost" })}
					params={{ _splat: "components/switch" }}
					to="/docs/$"
				>
					Explore components <ArrowUpRight aria-hidden="true" size={14} />
				</Link>
			</div>
		</section>
	);
}
