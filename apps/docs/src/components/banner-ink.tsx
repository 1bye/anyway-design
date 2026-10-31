import { drawInkSmudge, paintBannerScene } from "../lib/banner-scene";
import {
	addInkBloom,
	getInkRadius,
	INK_DEPOSIT_INTERVAL_MS,
	INK_LIFETIME_MS,
	type InkBloom,
	pruneInkBlooms,
} from "../lib/ink-wash";

function drawBloom(
	context: CanvasRenderingContext2D,
	bloom: InkBloom,
	now: number,
	inkColor: string
): void {
	const age = now - bloom.born;
	const progress = Math.min(age / INK_LIFETIME_MS, 1);
	const fade = 1 - Math.max(0, (age - 1800) / (INK_LIFETIME_MS - 1800));
	const radius = getInkRadius(bloom) + progress * 6;
	const opacity = (0.48 + bloom.volume * 0.012) * fade;
	const haloRadius = radius * 2;
	const halo = context.createRadialGradient(
		bloom.x,
		bloom.y,
		radius * 0.6,
		bloom.x,
		bloom.y,
		haloRadius
	);
	halo.addColorStop(0, `rgba(${inkColor}, ${0.1 * fade})`);
	halo.addColorStop(1, `rgba(${inkColor}, 0)`);
	context.fillStyle = halo;
	context.fillRect(
		bloom.x - haloRadius,
		bloom.y - haloRadius,
		haloRadius * 2,
		haloRadius * 2
	);

	context.beginPath();
	for (let segment = 0; segment <= 48; segment += 1) {
		const angle = (segment / 48) * Math.PI * 2;
		const edge =
			radius *
			(1 +
				0.08 * Math.sin(angle * 3 + bloom.seed) +
				0.04 * Math.sin(angle * 7 - bloom.seed));
		const x = bloom.x + Math.cos(angle) * edge;
		const y = bloom.y + Math.sin(angle) * edge;
		if (segment === 0) {
			context.moveTo(x, y);
		} else {
			context.lineTo(x, y);
		}
	}
	context.closePath();
	const ink = context.createRadialGradient(
		bloom.x - radius * 0.2,
		bloom.y - radius * 0.2,
		0,
		bloom.x,
		bloom.y,
		radius
	);
	ink.addColorStop(0, `rgba(${inkColor}, ${opacity})`);
	ink.addColorStop(0.8, `rgba(${inkColor}, ${opacity * 0.85})`);
	ink.addColorStop(1, `rgba(${inkColor}, ${opacity * 0.55})`);
	context.fillStyle = ink;
	context.fill();
	context.strokeStyle = `rgba(${inkColor}, ${opacity * 0.25})`;
	context.lineWidth = 0.75;
	context.stroke();
}

function startInkWash(canvas: HTMLCanvasElement): () => void {
	const drawing = canvas.getContext("2d");
	const banner = canvas.parentElement;
	const scene = document.createElement("canvas");
	const sceneDrawing = scene.getContext("2d");
	if (!(drawing && banner && sceneDrawing)) {
		return () => undefined;
	}

	const context = drawing;
	const sceneContext = sceneDrawing;
	const surface = banner;
	const blooms: InkBloom[] = [];
	let frame = 0;
	let width = 0;
	let height = 0;
	let scale = 1;
	let lastInput = 0;
	let fontsReady = false;
	let disposed = false;
	let inkColor = "28, 30, 33";

	function paint(now: number) {
		if (!(width && height)) {
			return;
		}
		context.clearRect(0, 0, width, height);
		if (fontsReady && scene.width && scene.height) {
			context.drawImage(scene, 0, 0, width, height);
		}
		pruneInkBlooms(blooms, now);
		for (const bloom of blooms) {
			drawInkSmudge(context, scene, {
				opacity: 0.5 * (1 - (now - bloom.born) / INK_LIFETIME_MS),
				radius: getInkRadius(bloom) + 16,
				scale,
				seed: bloom.seed,
				x: bloom.x,
				y: bloom.y,
			});
			drawBloom(context, bloom, now, inkColor);
		}
	}

	function clear() {
		cancelAnimationFrame(frame);
		frame = 0;
		blooms.length = 0;
		paint(performance.now());
	}

	function draw(now: number) {
		paint(now);
		frame = blooms.length ? requestAnimationFrame(draw) : 0;
	}

	function refreshScene() {
		if (!(fontsReady && width && height) || disposed) {
			return;
		}
		paintBannerScene(sceneContext, surface, { height, scale, width });
		inkColor = getComputedStyle(canvas).getPropertyValue("--ink-rgb").trim();
		surface.dataset.canvasReady = "true";
		if (!frame) {
			frame = requestAnimationFrame(draw);
		}
	}

	function resize() {
		if (disposed) {
			return;
		}
		clear();
		({ width, height } = canvas.getBoundingClientRect());
		if (!(width && height)) {
			delete surface.dataset.canvasReady;
			return;
		}
		scale = Math.min(window.devicePixelRatio || 1, 2);
		canvas.width = Math.round(width * scale);
		canvas.height = Math.round(height * scale);
		scene.width = canvas.width;
		scene.height = canvas.height;
		context.setTransform(scale, 0, 0, scale, 0, 0);
		refreshScene();
	}

	function onPointerMove(event: PointerEvent) {
		if (event.pointerType !== "mouse") {
			return;
		}
		const now = performance.now();
		if (now - lastInput < INK_DEPOSIT_INTERVAL_MS) {
			return;
		}
		const bounds = canvas.getBoundingClientRect();
		pruneInkBlooms(blooms, now);
		if (
			addInkBloom(
				blooms,
				event.clientX - bounds.left,
				event.clientY - bounds.top,
				now
			)
		) {
			lastInput = now;
			if (!frame) {
				frame = requestAnimationFrame(draw);
			}
		}
	}

	function onVisibilityChange() {
		if (document.hidden) {
			clear();
		}
	}

	async function loadFonts() {
		await document.fonts.ready;
		if (!disposed) {
			fontsReady = true;
			refreshScene();
		}
	}

	const observer = new ResizeObserver(resize);
	const themeObserver = new MutationObserver(refreshScene);
	observer.observe(canvas);
	themeObserver.observe(document.documentElement, {
		attributeFilter: ["class"],
		attributes: true,
	});
	surface.addEventListener("pointermove", onPointerMove, { passive: true });
	for (const event of ["pointerover", "pointerout", "focusin", "focusout"]) {
		surface.addEventListener(event, refreshScene);
	}
	document.addEventListener("visibilitychange", onVisibilityChange);
	document.fonts.addEventListener("loadingdone", refreshScene);
	resize();
	loadFonts().catch(() => {
		fontsReady = false;
		clear();
		delete surface.dataset.canvasReady;
	});

	return () => {
		disposed = true;
		delete surface.dataset.canvasReady;
		clear();
		observer.disconnect();
		themeObserver.disconnect();
		surface.removeEventListener("pointermove", onPointerMove);
		for (const event of ["pointerover", "pointerout", "focusin", "focusout"]) {
			surface.removeEventListener(event, refreshScene);
		}
		document.removeEventListener("visibilitychange", onVisibilityChange);
		document.fonts.removeEventListener("loadingdone", refreshScene);
	};
}

function mountInkWash(canvas: HTMLCanvasElement | null) {
	if (!canvas) {
		return;
	}
	const surface = canvas;
	const motion = window.matchMedia(
		"(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)"
	);
	let stop: () => void = () => undefined;
	function update() {
		stop();
		stop = motion.matches ? startInkWash(surface) : () => undefined;
	}
	update();
	motion.addEventListener("change", update);
	return () => {
		stop();
		motion.removeEventListener("change", update);
	};
}

export function BannerInk() {
	return (
		<canvas
			aria-hidden="true"
			className="docs-banner-ink"
			ref={mountInkWash}
			tabIndex={-1}
		/>
	);
}
