import { lazy, Suspense, type CSSProperties } from "react";

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
		blue: "#4f59b6",
		coral: "#b94d32",
		coralBright: "#dc6846",
		green: "#2c765a",
		ink: "#171717",
		paper: "#f5f2ec",
		stateBlue: "#6671e5",
		stateGreen: "#70c9a2",
	},
	copy: {
		done: "and done—experiments, notes, and code for",
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
		pagePadding: 3.2,
		verticalPadding: 6,
	},
	media: {
		animationDuration: 3.2,
		height: 0.78,
		hoverLift: 0.14,
		hoverRotation: -1,
		loadingWidth: 1.62,
		portraitWidth: 1.08,
		radius: 0.22,
	},
	rhythm: {
		actionsGap: 8,
		actionsOffset: 4,
		mobileWordmarkWidth: 40,
		wordmarkGap: 7,
		wordmarkWidth: 16,
	},
	type: {
		copyMaxWidth: 1040,
		desktopSize: 3.2,
		letterSpacing: -0.035,
		lineHeight: 1.04,
		mobileSize: 4.25,
		weight: 400,
	},
	visibility: {
		actions: true,
		emptyColumn: true,
		loadingState: true,
		portrait: true,
		wordmark: true,
	},
};

export type HeroDials = typeof HERO_DEFAULTS;
type HeroStyle = CSSProperties & Record<`--hero-${string}`, number | string>;

const DialedHomeHero = import.meta.env.DEV
	? lazy(() => import("./home-hero-dials"))
	: null;

const classNames = (...values: string[]): string => values.join(" ");

const INLINE_MEDIA_STYLES = classNames(
	"relative inline-flex items-center justify-center overflow-hidden",
	"h-[var(--hero-media-height)] align-[-0.1em] [margin-inline:0.12em_0.06em]",
	"rounded-[var(--hero-media-radius)] shadow-[inset_0_0_0_1px_rgba(23,23,23,0.08)]",
	"transition-transform duration-[240ms] ease-[ease]",
	"hover:translate-y-[var(--hero-media-hover-y)] hover:rotate-[var(--hero-media-hover-rotation)]",
	"motion-reduce:transition-none"
);

const ACTION_STYLES = classNames(
	"inline-flex items-center justify-center border",
	"min-h-[var(--hero-action-height)] rounded-[var(--hero-action-radius)] px-[var(--hero-action-padding-x)]",
	"font-medium [font-size:var(--hero-action-font-size)] leading-none no-underline",
	"transition-[translate,background-color,border-color] duration-200 ease-[ease]",
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
					<HeroStatement
						centered={isCentered}
						copy={dials.copy}
						showLoadingState={dials.visibility.loadingState}
						showPortrait={dials.visibility.portrait}
					/>
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
				"mb-[clamp(1rem,var(--hero-wordmark-gap),10rem)]",
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
	showLoadingState: boolean;
	showPortrait: boolean;
}

function HeroStatement({
	centered,
	copy,
	showLoadingState,
	showPortrait,
}: HeroStatementProps) {
	return (
		<h1
			className={classNames(
				"m-0 max-w-[var(--hero-copy-max-width)] text-pretty",
				"text-[clamp(2.25rem,var(--hero-font-size),3.5rem)]",
				"leading-[var(--hero-line-height)] tracking-[var(--hero-letter-spacing)] [font-weight:var(--hero-font-weight)]",
				"max-hero:text-[clamp(2rem,var(--hero-mobile-font-size),2.5rem)]",
				centered ? "mx-auto" : ""
			)}
			id="hero-title"
		>
			{copy.intro}
			{showPortrait ? <InlinePortrait /> : null}, {copy.making}{" "}
			<span className="text-[var(--hero-coral)]">{copy.feelRight}</span>.{" "}
			{copy.lab}{" "}
			<span className="text-[var(--hero-blue)]">{copy.smallStates}</span>{" "}
			{copy.loading}
			{showLoadingState ? <LoadingStatePreview /> : " "}
			{copy.done}{" "}
			<span className="text-[var(--hero-green)]">{copy.people}</span>.
		</h1>
	);
}

function InlinePortrait() {
	return (
		<span
			aria-label="Abstract self-portrait"
			className={classNames(
				INLINE_MEDIA_STYLES,
				"w-[var(--hero-portrait-width)] bg-[var(--hero-coral-bright)]",
				"before:absolute before:top-[9%] before:left-[23%]",
				"before:h-[42%] before:w-[54%] before:rotate-[-4deg]",
				"before:rounded-[50%_50%_32%_32%] before:bg-[var(--hero-ink)] before:content-['']"
			)}
			role="img"
		>
			<span
				className={classNames(
					"relative mt-[11%] h-[58%] w-[42%]",
					"rounded-[45%_45%_42%_42%] bg-[var(--hero-paper)]",
					"before:absolute before:top-[38%] before:left-[25%]",
					"before:aspect-square before:w-[7%] before:rounded-full",
					"before:bg-[var(--hero-ink)] before:shadow-[0.17em_0_0_var(--hero-ink)] before:content-['']",
					"after:absolute after:bottom-[18%] after:left-[36%]",
					"after:h-[12%] after:w-[28%] after:rounded-[50%]",
					"after:border-[var(--hero-ink)] after:border-b-[0.035em] after:content-['']"
				)}
			/>
		</span>
	);
}

function LoadingStatePreview() {
	return (
		<span
			aria-label="A tiny interface moving from loading to done"
			className={classNames(
				INLINE_MEDIA_STYLES,
				"w-[var(--hero-loading-width)] gap-[0.11em] bg-[var(--hero-ink)] px-[0.16em]"
			)}
			role="img"
		>
			<span className="aspect-square w-[0.1em] flex-none rounded-full bg-[var(--hero-coral-bright)] shadow-[0_0_0_0.035em_rgba(220,104,70,0.2)]" />
			<span className="h-[0.08em] w-[0.83em] overflow-hidden rounded-full bg-white/[16%]">
				<span className="block h-full w-[72%] origin-left animate-state-progress rounded-[inherit] bg-[var(--hero-state-blue)] [animation-duration:var(--hero-progress-duration)] motion-reduce:scale-x-80 motion-reduce:animate-none" />
			</span>
			<span
				aria-hidden="true"
				className="flex-none font-bold text-[0.22em] text-[var(--hero-state-green)] leading-none [font-family:Arial,sans-serif]"
			>
				✓
			</span>
		</span>
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
					"border-[var(--hero-ink)] bg-[var(--hero-ink)] text-[var(--hero-paper)]",
					"hover:bg-[color-mix(in_srgb,var(--hero-ink)_88%,white)]"
				)}
				href={REPOSITORY_URL}
				rel="noopener noreferrer"
				target="_blank"
			>
				{primaryLabel} <span aria-hidden="true">↗</span>
			</a>
			<a
				className={classNames(
					ACTION_STYLES,
					"border-[color-mix(in_srgb,var(--hero-ink)_14%,transparent)]",
					"bg-[color-mix(in_srgb,white_42%,transparent)] text-[var(--hero-ink)]",
					"hover:border-[color-mix(in_srgb,var(--hero-ink)_28%,transparent)]",
					"hover:bg-[color-mix(in_srgb,white_70%,transparent)]"
				)}
				href={BRIEF_URL}
				rel="noopener noreferrer"
				target="_blank"
			>
				{secondaryLabel} <span aria-hidden="true">↗</span>
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
	"--hero-copy-max-width": `${dials.type.copyMaxWidth}px`,
	"--hero-coral": dials.colors.coral,
	"--hero-coral-bright": dials.colors.coralBright,
	"--hero-font-size": `${dials.type.desktopSize}vw`,
	"--hero-font-weight": dials.type.weight,
	"--hero-green": dials.colors.green,
	"--hero-grid-gap": `${dials.layout.gap}vw`,
	"--hero-ink": dials.colors.ink,
	"--hero-letter-spacing": `${dials.type.letterSpacing}em`,
	"--hero-line-height": dials.type.lineHeight,
	"--hero-loading-width": `${dials.media.loadingWidth}em`,
	"--hero-media-height": `${dials.media.height}em`,
	"--hero-media-hover-rotation": `${dials.media.hoverRotation}deg`,
	"--hero-media-hover-y": `${-dials.media.hoverLift}em`,
	"--hero-media-radius": `${dials.media.radius}em`,
	"--hero-mobile-font-size": `${dials.type.mobileSize}vw`,
	"--hero-mobile-wordmark-width": `${dials.rhythm.mobileWordmarkWidth}vw`,
	"--hero-page-padding": `${dials.layout.pagePadding}vw`,
	"--hero-paper": dials.colors.paper,
	"--hero-portrait-width": `${dials.media.portraitWidth}em`,
	"--hero-progress-duration": `${dials.media.animationDuration}s`,
	"--hero-state-blue": dials.colors.stateBlue,
	"--hero-state-green": dials.colors.stateGreen,
	"--hero-vertical-padding": `${dials.layout.verticalPadding}vh`,
	"--hero-wordmark-gap": `${dials.rhythm.wordmarkGap}vh`,
	"--hero-wordmark-width": `${dials.rhythm.wordmarkWidth}vw`,
});
