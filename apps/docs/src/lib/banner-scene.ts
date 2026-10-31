import { TEXT_SMEAR_LIFETIME_MS, type TextSmear } from "./text-smear";

export const TEXT_SMEAR_RADIUS = 48;

interface SceneSize {
	height: number;
	scale: number;
	width: number;
}

function drawText(
	context: CanvasRenderingContext2D,
	element: HTMLElement,
	origin: DOMRect
): void {
	const style = getComputedStyle(element);
	const bounds = element.getBoundingClientRect();
	const text = element.textContent ?? "";
	context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
	context.letterSpacing =
		style.letterSpacing === "normal" ? "0px" : style.letterSpacing;
	context.fillStyle = style.color;
	const metrics = context.measureText(text);
	const ascent = metrics.fontBoundingBoxAscent;
	const descent = metrics.fontBoundingBoxDescent;
	context.fillText(
		text,
		bounds.left - origin.left,
		bounds.top - origin.top + (bounds.height - ascent - descent) / 2 + ascent
	);
}

function drawAction(
	context: CanvasRenderingContext2D,
	element: HTMLAnchorElement,
	origin: DOMRect,
	palette: CSSStyleDeclaration,
	inkContext: CanvasRenderingContext2D
): void {
	const bounds = element.getBoundingClientRect();
	const x = bounds.left - origin.left;
	const y = bounds.top - origin.top;
	const primary = element.dataset.canvasAction === "primary";
	context.fillStyle = primary
		? palette.getPropertyValue("--color-fd-primary")
		: palette.getPropertyValue("--color-fd-accent");
	if (primary || element.matches(":hover")) {
		context.globalAlpha = primary && element.matches(":hover") ? 0.8 : 1;
		context.beginPath();
		context.roundRect(x, y, bounds.width, bounds.height, bounds.height / 2);
		context.fill();
		context.globalAlpha = 1;
	}
	if (element.matches(":focus-visible")) {
		context.save();
		context.strokeStyle = palette.getPropertyValue("--color-fd-ring");
		context.lineWidth = 2;
		context.beginPath();
		context.roundRect(
			x - 2,
			y - 2,
			bounds.width + 4,
			bounds.height + 4,
			bounds.height / 2 + 2
		);
		context.stroke();
		context.restore();
	}
	const arrow = element.querySelector("svg");
	if (!arrow) {
		return;
	}
	const arrowBounds = arrow.getBoundingClientRect();
	inkContext.save();
	inkContext.translate(
		arrowBounds.left - origin.left,
		arrowBounds.top - origin.top
	);
	inkContext.scale(arrowBounds.width / 24, arrowBounds.height / 24);
	inkContext.lineWidth = 2;
	inkContext.lineCap = "round";
	inkContext.lineJoin = "round";
	inkContext.strokeStyle = getComputedStyle(element).color;
	for (const path of arrow.querySelectorAll("path")) {
		const data = path.getAttribute("d");
		if (data) {
			inkContext.stroke(new Path2D(data));
		}
	}
	inkContext.restore();
}

export function paintBannerScene(
	context: CanvasRenderingContext2D,
	banner: HTMLElement,
	{ width, height, scale }: SceneSize,
	inkContext: CanvasRenderingContext2D
): void {
	context.setTransform(scale, 0, 0, scale, 0, 0);
	context.clearRect(0, 0, width, height);
	inkContext.setTransform(scale, 0, 0, scale, 0, 0);
	inkContext.clearRect(0, 0, width, height);
	const origin = banner.getBoundingClientRect();
	const palette = getComputedStyle(banner);
	for (const action of banner.querySelectorAll<HTMLAnchorElement>(
		"[data-canvas-action]"
	)) {
		drawAction(context, action, origin, palette, inkContext);
	}
	for (const text of banner.querySelectorAll<HTMLElement>(
		"[data-canvas-text]"
	)) {
		drawText(inkContext, text, origin);
	}
}

export function drawTextSmear(
	context: CanvasRenderingContext2D,
	ink: HTMLCanvasElement,
	smear: TextSmear,
	{
		patch,
		mask,
		scale,
		now,
	}: {
		patch: CanvasRenderingContext2D;
		mask: HTMLCanvasElement;
		scale: number;
		now: number;
	}
): void {
	const fade = Math.max(0, 1 - (now - smear.born) / TEXT_SMEAR_LIFETIME_MS);
	const size = TEXT_SMEAR_RADIUS * 2;
	const left = smear.x - TEXT_SMEAR_RADIUS;
	const top = smear.y - TEXT_SMEAR_RADIUS;
	patch.clearRect(0, 0, size, size);
	patch.drawImage(ink, -left, -top, ink.width / scale, ink.height / scale);
	patch.globalCompositeOperation = "destination-in";
	patch.drawImage(mask, 0, 0, size, size);
	patch.globalCompositeOperation = "source-over";

	context.save();
	// Lift the original pigment locally before dragging it into a soft trail.
	context.globalAlpha = fade;
	context.globalCompositeOperation = "destination-out";
	context.drawImage(mask, left, top, size, size);
	context.globalCompositeOperation = "source-over";
	context.filter = "blur(0.5px)";
	for (let pass = 0; pass < 4; pass += 1) {
		const pull = pass / 3;
		context.globalAlpha = fade * (0.2 + pull * 0.6);
		context.drawImage(
			patch.canvas,
			left + smear.dx * pull * fade,
			top + smear.dy * pull * fade,
			size,
			size
		);
	}
	context.restore();
}
