import { type DialConfig, useDialKit } from "dialkit";

import { HERO_DEFAULTS, HomeHeroView } from "./home-hero";

const HERO_DIAL_CONFIG = {
	actions: {
		fontSize: [HERO_DEFAULTS.actions.fontSize, 10, 20, 0.5],
		height: [HERO_DEFAULTS.actions.height, 32, 64, 1],
		horizontalPadding: [
			HERO_DEFAULTS.actions.horizontalPadding,
			8,
			32,
			1,
		],
		hoverLift: [HERO_DEFAULTS.actions.hoverLift, 0, 8, 0.25],
		roundness: [HERO_DEFAULTS.actions.roundness, 0, 1, 0.01],
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
	media: {
		animationDuration: [
			HERO_DEFAULTS.media.animationDuration,
			0.5,
			10,
			0.1,
		],
		height: [HERO_DEFAULTS.media.height, 0.5, 1.1, 0.01],
		hoverLift: [HERO_DEFAULTS.media.hoverLift, 0, 0.5, 0.01],
		hoverRotation: [HERO_DEFAULTS.media.hoverRotation, -8, 8, 0.25],
		loadingWidth: [HERO_DEFAULTS.media.loadingWidth, 1.2, 2.4, 0.01],
		portraitWidth: [HERO_DEFAULTS.media.portraitWidth, 0.8, 1.6, 0.01],
		radius: [HERO_DEFAULTS.media.radius, 0.05, 0.5, 0.01],
	},
	rhythm: {
		actionsGap: [HERO_DEFAULTS.rhythm.actionsGap, 0, 32, 1],
		actionsOffset: [HERO_DEFAULTS.rhythm.actionsOffset, 0, 12, 0.25],
		mobileWordmarkWidth: [
			HERO_DEFAULTS.rhythm.mobileWordmarkWidth,
			20,
			70,
			1,
		],
		wordmarkGap: [HERO_DEFAULTS.rhythm.wordmarkGap, 1, 15, 0.25],
		wordmarkWidth: [HERO_DEFAULTS.rhythm.wordmarkWidth, 8, 30, 0.25],
	},
	type: {
		copyMaxWidth: [HERO_DEFAULTS.type.copyMaxWidth, 560, 1400, 8],
		desktopSize: [HERO_DEFAULTS.type.desktopSize, 2, 6, 0.05],
		letterSpacing: [HERO_DEFAULTS.type.letterSpacing, -0.1, 0.05, 0.005],
		lineHeight: [HERO_DEFAULTS.type.lineHeight, 0.85, 1.35, 0.01],
		mobileSize: [HERO_DEFAULTS.type.mobileSize, 3, 10, 0.05],
		weight: [HERO_DEFAULTS.type.weight, 400, 700, 25],
	},
	visibility: { ...HERO_DEFAULTS.visibility },
} satisfies DialConfig;

export default function DialedHomeHero() {
	const dials = useDialKit("Hero", HERO_DIAL_CONFIG, {
		id: "anyway-hero",
		persist: true,
	});

	return <HomeHeroView dials={dials} />;
}
