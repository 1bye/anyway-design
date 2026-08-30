const REPOSITORY_URL = "https://github.com/1bye/anyway-design";
const BRIEF_URL = "https://github.com/1bye/anyway-design/blob/master/design.md";
const classNames = (...values: string[]): string => values.join(" ");

const INLINE_MEDIA_STYLES = classNames(
	"relative inline-flex items-center justify-center overflow-hidden",
	"h-[0.78em] align-[-0.1em] [margin-inline:0.12em_0.06em]",
	"rounded-[0.22em] shadow-[inset_0_0_0_1px_rgba(23,23,23,0.08)]",
	"transition-transform duration-[240ms] ease-[ease]",
	"hover:-translate-y-[0.14em] hover:rotate-[-1deg]",
	"motion-reduce:transition-none"
);

const ACTION_STYLES = classNames(
	"inline-flex min-h-10 items-center justify-center rounded-full border px-4",
	"font-medium text-[0.8125rem] leading-none no-underline",
	"transition-[translate,background-color,border-color] duration-200 ease-[ease]",
	"hover:-translate-y-0.5",
	"focus-visible:outline-2 focus-visible:outline-anyway-ink focus-visible:outline-offset-[3px]",
	"motion-reduce:transition-none"
);

export function HomeHero() {
	return (
		<main className="min-h-svh overflow-x-clip bg-anyway-paper text-anyway-ink">
			<section
				aria-labelledby="hero-title"
				className={classNames(
					"grid min-h-svh",
					"grid-cols-[minmax(0,3fr)_minmax(13rem,2fr)]",
					"gap-[clamp(2rem,6vw,8rem)] p-[clamp(1.25rem,3.2vw,3.5rem)]",
					"max-hero:grid-cols-1 max-hero:p-[clamp(1.25rem,5vw,2.25rem)]"
				)}
			>
				<div
					className={classNames(
						"w-full max-w-[68rem] self-center",
						"py-[clamp(1.5rem,6vh,5rem)]",
						"max-hero:max-w-[48rem] max-hero:py-[clamp(1rem,4vh,3rem)]"
					)}
				>
					<HeroWordmark />
					<HeroStatement />
					<HeroActions />
				</div>

				<div aria-hidden="true" className="max-hero:hidden" />
			</section>
		</main>
	);
}

function HeroWordmark() {
	return (
		<img
			alt="Anyway"
			className={classNames(
				"block h-auto w-[clamp(10rem,16vw,15rem)]",
				"mb-[clamp(2.75rem,7vh,6rem)]",
				"max-hero:mb-[clamp(2.5rem,7vh,4.5rem)]",
				"max-hero:w-[clamp(9.5rem,40vw,13rem)]"
			)}
			height={887}
			src="/brand/anyway-wordmark.png"
			width={1774}
		/>
	);
}

function HeroStatement() {
	return (
		<h1
			className="m-0 max-w-[65rem] text-pretty font-light text-hero-copy max-hero:text-hero-copy-mobile"
			id="hero-title"
		>
			I’m the software engineer behind Anyway
			<InlinePortrait />, and I like making interfaces{" "}
			<span className="text-anyway-coral">feel right</span>. This is my lab for
			the <span className="text-anyway-blue">small states</span> between loading
			<LoadingStatePreview />
			and done—experiments, notes, and code for{" "}
			<span className="text-anyway-green">people who ship</span>.
		</h1>
	);
}

function InlinePortrait() {
	return (
		<span
			aria-label="Abstract self-portrait"
			className={classNames(
				INLINE_MEDIA_STYLES,
				"w-[1.08em] bg-anyway-coral-bright",
				"before:absolute before:top-[9%] before:left-[23%]",
				"before:h-[42%] before:w-[54%] before:rotate-[-4deg]",
				"before:rounded-[50%_50%_32%_32%] before:bg-anyway-ink before:content-['']"
			)}
			role="img"
		>
			<span
				className={classNames(
					"relative mt-[11%] h-[58%] w-[42%]",
					"rounded-[45%_45%_42%_42%] bg-anyway-paper",
					"before:absolute before:top-[38%] before:left-[25%]",
					"before:aspect-square before:w-[7%] before:rounded-full",
					"before:bg-anyway-ink before:shadow-[0.17em_0_0_#171717] before:content-['']",
					"after:absolute after:bottom-[18%] after:left-[36%]",
					"after:h-[12%] after:w-[28%] after:rounded-[50%]",
					"after:border-anyway-ink after:border-b-[0.035em] after:content-['']"
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
				"w-[1.62em] gap-[0.11em] bg-anyway-ink px-[0.16em]"
			)}
			role="img"
		>
			<span className="aspect-square w-[0.1em] flex-none rounded-full bg-anyway-coral-bright shadow-[0_0_0_0.035em_rgba(220,104,70,0.2)]" />
			<span className="h-[0.08em] w-[0.83em] overflow-hidden rounded-full bg-white/[16%]">
				<span className="block h-full w-[72%] origin-left animate-state-progress rounded-[inherit] bg-anyway-state-blue motion-reduce:scale-x-80 motion-reduce:animate-none" />
			</span>
			<span
				aria-hidden="true"
				className="flex-none font-bold text-[0.22em] text-anyway-state-green leading-none [font-family:Arial,sans-serif]"
			>
				✓
			</span>
		</span>
	);
}

function HeroActions() {
	return (
		<nav
			aria-label="Project links"
			className="mt-[clamp(1.75rem,4vh,2.75rem)] flex flex-wrap gap-2"
		>
			<a
				className={classNames(
					ACTION_STYLES,
					"border-anyway-ink bg-anyway-ink text-anyway-paper hover:bg-[#303030]"
				)}
				href={REPOSITORY_URL}
				rel="noopener noreferrer"
				target="_blank"
			>
				Follow the build <span aria-hidden="true">↗</span>
			</a>
			<a
				className={classNames(
					ACTION_STYLES,
					"border-anyway-ink/[14%] bg-white/[42%] text-anyway-ink",
					"hover:border-anyway-ink/[28%] hover:bg-white/70"
				)}
				href={BRIEF_URL}
				rel="noopener noreferrer"
				target="_blank"
			>
				Read the brief <span aria-hidden="true">↗</span>
			</a>
		</nav>
	);
}
