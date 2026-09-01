import { type DialConfig, useDialKit } from "dialkit";

import { HERO_DEFAULTS, HomeHeroView } from "./home-hero";

const HERO_DIAL_CONFIG = {
	actions: {
		fontSize: [HERO_DEFAULTS.actions.fontSize, 10, 50, 0.5],
	},
	colors: { ...HERO_DEFAULTS.colors },
	copy: {
		_collapsed: true,
		...HERO_DEFAULTS.copy,
	},
	layout: {
		alignment: {
			default: HERO_DEFAULTS.layout.alignment,
			options: ["left", "center"],
			type: "select",
		},
		columnRatio: [HERO_DEFAULTS.layout.columnRatio, 1, 3, 0.05],
		contentMaxWidth: [HERO_DEFAULTS.layout.contentMaxWidth, 640, 1440, 8],
		gap: [HERO_DEFAULTS.layout.gap, 2, 12, 0.1],
		pagePadding: [HERO_DEFAULTS.layout.pagePadding, 1.5, 6, 0.1],
		verticalPadding: [HERO_DEFAULTS.layout.verticalPadding, 0, 15, 0.25],
	},
	rhythm: {
		actionsGap: [HERO_DEFAULTS.rhythm.actionsGap, 0, 32, 1],
		actionsOffset: [HERO_DEFAULTS.rhythm.actionsOffset, 0, 12, 0.25],
		logoTextGap: [HERO_DEFAULTS.rhythm.logoTextGap, 1, 15, 0.25],
		mobileWordmarkWidth: [HERO_DEFAULTS.rhythm.mobileWordmarkWidth, 20, 70, 1],
		wordmarkWidth: [HERO_DEFAULTS.rhythm.wordmarkWidth, 8, 30, 0.25],
	},
	type: {
		copyMaxWidth: [HERO_DEFAULTS.type.copyMaxWidth, 560, 1400, 8],
		desktopSize: [HERO_DEFAULTS.type.desktopSize, 2, 6, 0.05],
		letterSpacing: [HERO_DEFAULTS.type.letterSpacing, -0.1, 0.05, 0.005],
		lineHeight: [HERO_DEFAULTS.type.lineHeight, 0.85, 1.35, 0.01],
		mobileSize: [HERO_DEFAULTS.type.mobileSize, 3, 10, 0.05],
		unhighlightedTextOpacity: [
			HERO_DEFAULTS.type.unhighlightedTextOpacity,
			0.45,
			1,
			0.01,
		],
		weight: [HERO_DEFAULTS.type.weight, 400, 700, 25],
	},
	visibility: { ...HERO_DEFAULTS.visibility },
} satisfies DialConfig;

export default function DialedHomeHero() {
	const dials = useDialKit("Hero", HERO_DIAL_CONFIG, {
		id: "anyway-hero-v2",
		persist: true,
	});

	return <HomeHeroView dials={dials} />;
}
