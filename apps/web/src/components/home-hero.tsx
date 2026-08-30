import { type CSSProperties, lazy, Suspense } from "react";

const REPOSITORY_URL = "https://github.com/1bye/anyway-design";
const BRIEF_URL = "https://github.com/1bye/anyway-design/blob/master/design.md";

export const HERO_DEFAULTS = {
	actions: {
		fontSize: 13,
		height: 40,
		horizontalPadding: 16,
		hoverLift: 2,
		roundness: 1,
	},
	colors: {
		blue: "#323130",
		coral: "#323130",
		green: "#323130",
		ink: "#171717",
		paper: "#f5f2ec",
	},
	copy: {
		done: "and done: experiments, notes, and code for",
		feelRight: "feel right",
		intro: "I’m the software engineer behind Anyway",
		lab: "This is my lab for the",
		loading: "between loading",
		making: "and I like making interfaces",
		people: "people who ship",
		primaryAction: "Follow the build",
		secondaryAction: "Read the brief",
		smallStates: "small states",
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

const ACTION_STYLES = classNames(
	"inline-flex items-center justify-center",
	"min-h-[var(--hero-action-height)] rounded-[var(--hero-action-radius)] px-[var(--hero-action-padding-x)]",
	"font-medium [font-size:var(--hero-action-font-size)] leading-none no-underline",
	"transition-[translate,background-color] duration-200 ease-[ease]",
	"hover:translate-y-[var(--hero-action-hover-y)]",
	"focus-visible:outline-2 focus-visible:outline-[var(--hero-ink)] focus-visible:outline-offset-[3px]",
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
			{copy.intro}, {copy.making}{" "}
			<span className="text-[var(--hero-coral)]">{copy.feelRight}</span>.{" "}
			{copy.lab}{" "}
			<span className="text-[var(--hero-blue)]">{copy.smallStates}</span>{" "}
			{copy.loading} {copy.done}{" "}
			<span className="text-[var(--hero-green)]">{copy.people}</span>.
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
				"mt-[var(--hero-actions-offset)] flex flex-wrap gap-[var(--hero-actions-gap)]",
				centered ? "justify-center" : ""
			)}
		>
			<a
				className={classNames(
					ACTION_STYLES,
					"border border-[var(--hero-ink)] bg-[var(--hero-ink)] text-[var(--hero-paper)]",
					"hover:bg-[color-mix(in_srgb,var(--hero-ink)_88%,white)]"
				)}
				href={REPOSITORY_URL}
				rel="noopener noreferrer"
				target="_blank"
			>
				{primaryLabel}
			</a>
			<a
				className={classNames(
					ACTION_STYLES,
					"bg-[color-mix(in_srgb,white_42%,transparent)] text-[var(--hero-ink)]",
					"hover:bg-[color-mix(in_srgb,white_70%,transparent)]"
				)}
				href={BRIEF_URL}
				rel="noopener noreferrer"
				target="_blank"
			>
				{secondaryLabel}
			</a>
		</nav>
	);
}

const createHeroStyle = (dials: HeroDials): HeroStyle => ({
	"--hero-action-font-size": `${dials.actions.fontSize}px`,
	"--hero-action-height": `${dials.actions.height}px`,
	"--hero-action-hover-y": `${-dials.actions.hoverLift}px`,
	"--hero-action-padding-x": `${dials.actions.horizontalPadding}px`,
	"--hero-action-radius": `${dials.actions.roundness * 999}px`,
	"--hero-actions-gap": `${dials.rhythm.actionsGap}px`,
	"--hero-actions-offset": `${dials.rhythm.actionsOffset}vh`,
	"--hero-blue": dials.colors.blue,
	"--hero-column-ratio": `${dials.layout.columnRatio}fr`,
	"--hero-content-max-width": `${dials.layout.contentMaxWidth}px`,
	"--hero-copy-color": `color-mix(in srgb, ${dials.colors.ink} ${dials.type.unhighlightedTextOpacity * 100}%, transparent)`,
	"--hero-copy-max-width": `${dials.type.copyMaxWidth}px`,
	"--hero-coral": dials.colors.coral,
	"--hero-font-size": `${dials.type.desktopSize}vw`,
	"--hero-font-weight": dials.type.weight,
	"--hero-green": dials.colors.green,
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
