import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

const REPOSITORY_URL = "https://github.com/1bye/anyway-design";
const BRIEF_URL = "https://github.com/1bye/anyway-design/blob/master/design.md";

function HomeComponent() {
	return (
		<main className="hero-shell">
			<section aria-labelledby="hero-title" className="hero-layout">
				<div className="hero-content">
					<img
						alt="Anyway"
						className="hero-logo"
						height={887}
						src="/brand/anyway-wordmark.png"
						width={1774}
					/>

					<h1 className="hero-copy" id="hero-title">
						I’m the software engineer behind Anyway
						<span
							aria-label="Abstract self-portrait"
							className="inline-media inline-portrait"
							role="img"
						>
							<span className="portrait-face" />
						</span>
						, and I like making interfaces{" "}
						<span className="highlight-coral">feel right</span>. This is my lab
						for the <span className="highlight-blue">small states</span> between
						loading
						<span
							aria-label="A tiny interface moving from loading to done"
							className="inline-media inline-state"
							role="img"
						>
							<span className="state-dot" />
							<span className="state-track">
								<span className="state-progress" />
							</span>
							<span aria-hidden="true" className="state-check">
								✓
							</span>
						</span>
						and done—experiments, notes, and code for{" "}
						<span className="highlight-green">people who ship</span>.
					</h1>

					<nav aria-label="Project links" className="hero-actions">
						<a
							className="hero-action hero-action-primary"
							href={REPOSITORY_URL}
							rel="noopener noreferrer"
							target="_blank"
						>
							Follow the build <span aria-hidden="true">↗</span>
						</a>
						<a
							className="hero-action hero-action-secondary"
							href={BRIEF_URL}
							rel="noopener noreferrer"
							target="_blank"
						>
							Read the brief <span aria-hidden="true">↗</span>
						</a>
					</nav>
				</div>

				<div aria-hidden="true" className="hero-negative-space" />
			</section>
		</main>
	);
}
