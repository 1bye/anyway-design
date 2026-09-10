import { createFileRoute, Link } from "@tanstack/react-router";
import { LiquidHero } from "../components/liquid-hero";
import { MenuPlayground } from "../components/menu-playground";

export const Route = createFileRoute("/")({ component: LiquidPage });

function LiquidPage() {
	return (
		<div className="app-shell">
			<header className="site-header">
				<Link aria-label="Anyway Liquid home" className="brand" to="/">
					<img
						alt="Anyway"
						className="brand-wordmark"
						height={54}
						src="/brand/anyway-wordmark.png"
						width={108}
					/>
					<span aria-hidden="true" className="brand-divider" />
					<span className="brand-liquid">liquid</span>
				</Link>
			</header>
			<main className="workspace">
				<LiquidHero />
				<MenuPlayground />
			</main>
		</div>
	);
}
