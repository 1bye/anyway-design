import { type CSSProperties, lazy, Suspense } from "react";

const REPOSITORY_URL = "https://github.com/1bye/anyway-design";
const BRIEF_URL = "https://github.com/1bye/anyway-design/blob/master/design.md";

export const HERO_DEFAULTS = {
	actions: {
		fontSize: 22.5,
	},
	colors: {
		accent: "#323130",
		ink: "#171717",
		paper: "#f5f2ec",
	},
	copy: {
		description: "A design lab exploring how software",
		emphasis: "looks, behaves, and feels",
		primaryAction: "Follow the build",
		secondaryAction: "Read the brief",
	},
	layout: {
		alignment: "left",
		columnRatio: 1.5,
		contentMaxWidth: 1088,
		gap: 6,
		pagePadding: 1.5,
		verticalPadding: 6,
	},
	rhythm: {
		actionsGap: 11,
		actionsOffset: 3.5,
		logoTextGap: 1,
		mobileWordmarkWidth: 38,
		wordmarkWidth: 16,
	},
	type: {
		copyMaxWidth: 592,
		desktopSize: 2.2,
		letterSpacing: -0.035,
		lineHeight: 1.08,
		mobileSize: 4.25,
		unhighlightedTextOpacity: 0.45,
		weight: 400,
	},
	visibility: {
		actions: true,
		emptyColumn: true,
		wordmark: true,
	},
};

export type HeroDials = typeof HERO_DEFAULTS;
type HeroStyle = CSSProperties & Record<`--hero-${string}`, number | string>;

const DialedHomeHero = import.meta.env.DEV
	? lazy(() => import("./home-hero-dials"))
	: null;

const classNames = (...values: string[]): string => values.join(" ");

const TEXT_LINK_STYLES = classNames(
	"group inline-flex text-[var(--hero-ink)] no-underline",
	" [font-size:var(--hero-action-font-size)] tracking-[-0.02em]",
	"focus-visible:rounded-xs focus-visible:outline-2 focus-visible:outline-[var(--hero-ink)] focus-visible:outline-offset-4"
);

const TEXT_REVEAL_STYLES = classNames(
	"block transition-transform duration-500 ease-[cubic-bezier(0.34,1.3,0.64,1)]",
	"motion-safe:group-hover:-translate-y-1/2 motion-safe:group-focus:-translate-y-1/2",
	"motion-reduce:transition-none"
);

export function HomeHero() {
	if (!DialedHomeHero) {
		return <HomeHeroView dials={HERO_DEFAULTS} />;
	}

	return (
		<Suspense fallback={<HomeHeroView dials={HERO_DEFAULTS} />}>
			<DialedHomeHero />
		</Suspense>
	);
}

interface HomeHeroViewProps {
	dials: HeroDials;
}

export function HomeHeroView({ dials }: HomeHeroViewProps) {
	const isCentered = dials.layout.alignment === "center";

	return (
		<main
			className="min-h-svh overflow-x-clip bg-[var(--hero-paper)] text-[var(--hero-ink)]"
			style={createHeroStyle(dials)}
		>
			<section
				aria-labelledby="hero-title"
				className={classNames(
					"grid min-h-svh gap-[clamp(2rem,var(--hero-grid-gap),8rem)]",
					"p-[clamp(1.25rem,var(--hero-page-padding),3.5rem)]",
					dials.visibility.emptyColumn
						? "grid-cols-[minmax(0,var(--hero-column-ratio))_minmax(13rem,1fr)]"
						: "grid-cols-1",
					"max-hero:grid-cols-1 max-hero:p-[clamp(1.25rem,5vw,2.25rem)]"
				)}
			>
				<div
					className={classNames(
						"w-full max-w-[var(--hero-content-max-width)] self-center",
						"py-[clamp(1rem,var(--hero-vertical-padding),10rem)]",
						"max-hero:max-w-[48rem] max-hero:py-[clamp(1rem,4vh,3rem)]",
						isCentered ? "mx-auto text-center" : ""
					)}
				>
					{dials.visibility.wordmark ? (
						<HeroWordmark centered={isCentered} />
					) : null}
					<HeroStatement centered={isCentered} copy={dials.copy} />
					{dials.visibility.actions ? (
						<HeroActions
							centered={isCentered}
							primaryLabel={dials.copy.primaryAction}
							secondaryLabel={dials.copy.secondaryAction}
						/>
					) : null}
				</div>

				{dials.visibility.emptyColumn ? (
					<div aria-hidden="true" className="max-hero:hidden" />
				) : null}
			</section>
		</main>
	);
}

function HeroWordmark({ centered }: { centered: boolean }) {
	return (
		<img
			alt="Anyway"
			className={classNames(
				"block h-auto w-[clamp(10rem,var(--hero-wordmark-width),25rem)]",
				"mb-[clamp(1rem,var(--hero-logo-text-gap),10rem)]",
				"max-hero:w-[clamp(9.5rem,var(--hero-mobile-wordmark-width),20rem)]",
				centered ? "mx-auto" : ""
			)}
			height={887}
			src="/brand/anyway-wordmark.png"
			width={1774}
		/>
	);
}

interface HeroStatementProps {
	centered: boolean;
	copy: HeroDials["copy"];
}

function HeroStatement({ centered, copy }: HeroStatementProps) {
	return (
		<h1
			className={classNames(
				"m-0 max-w-[var(--hero-copy-max-width)] text-pretty text-[var(--hero-copy-color)]",
				"text-[clamp(2.25rem,var(--hero-font-size),3.5rem)]",
				"leading-[var(--hero-line-height)] tracking-[var(--hero-letter-spacing)] [font-weight:var(--hero-font-weight)]",
				"max-hero:text-[clamp(2rem,var(--hero-mobile-font-size),2.5rem)]",
				centered ? "mx-auto" : ""
			)}
			id="hero-title"
		>
			{copy.description}{" "}
			<span className="text-[var(--hero-accent)]">{copy.emphasis}</span>.
		</h1>
	);
}

interface HeroActionsProps {
	centered: boolean;
	primaryLabel: string;
	secondaryLabel: string;
}

function HeroActions({
	centered,
	primaryLabel,
	secondaryLabel,
}: HeroActionsProps) {
	return (
		<nav
			aria-label="Project links"
			className={classNames(
				"mt-[var(--hero-actions-offset)] flex flex-wrap gap-4",
				centered ? "justify-center" : ""
			)}
		>
			<TextRevealLink href={REPOSITORY_URL}>{primaryLabel}</TextRevealLink>
			<TextRevealLink href={BRIEF_URL}>{secondaryLabel}</TextRevealLink>
		</nav>
	);
}

interface TextRevealLinkProps {
	children: string;
	href: string;
}

function TextRevealLink({ children, href }: TextRevealLinkProps) {
	return (
		<a
			className={TEXT_LINK_STYLES}
			href={href}
			rel="noopener noreferrer"
			target="_blank"
		>
			<span className="block h-[1.4em] overflow-hidden leading-[1.4em]">
				<span className={TEXT_REVEAL_STYLES}>
					<span className="block h-[1.4em] whitespace-nowrap">{children}</span>
					<span
						aria-hidden="true"
						className="block h-[1.4em] whitespace-nowrap"
					>
						{children}
					</span>
				</span>
			</span>
		</a>
	);
}

const createHeroStyle = (dials: HeroDials): HeroStyle => ({
	"--hero-accent": dials.colors.accent,
	"--hero-action-font-size": `${dials.actions.fontSize}px`,
	"--hero-actions-gap": `${dials.rhythm.actionsGap}px`,
	"--hero-actions-offset": `${dials.rhythm.actionsOffset}vh`,
	"--hero-column-ratio": `${dials.layout.columnRatio}fr`,
	"--hero-content-max-width": `${dials.layout.contentMaxWidth}px`,
	"--hero-copy-color": `color-mix(in srgb, ${dials.colors.ink} ${dials.type.unhighlightedTextOpacity * 100}%, transparent)`,
	"--hero-copy-max-width": `${dials.type.copyMaxWidth}px`,
	"--hero-font-size": `${dials.type.desktopSize}vw`,
	"--hero-font-weight": dials.type.weight,
	"--hero-grid-gap": `${dials.layout.gap}vw`,
	"--hero-ink": dials.colors.ink,
	"--hero-letter-spacing": `${dials.type.letterSpacing}em`,
	"--hero-line-height": dials.type.lineHeight,
	"--hero-logo-text-gap": `${dials.rhythm.logoTextGap}vh`,
	"--hero-mobile-font-size": `${dials.type.mobileSize}vw`,
	"--hero-mobile-wordmark-width": `${dials.rhythm.mobileWordmarkWidth}vw`,
	"--hero-page-padding": `${dials.layout.pagePadding}vw`,
	"--hero-paper": dials.colors.paper,
	"--hero-vertical-padding": `${dials.layout.verticalPadding}vh`,
	"--hero-wordmark-width": `${dials.rhythm.wordmarkWidth}vw`,
});
