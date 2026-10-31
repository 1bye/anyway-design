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
	palette: CSSStyleDeclaration
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
	context.save();
	context.translate(
		arrowBounds.left - origin.left,
		arrowBounds.top - origin.top
	);
	context.scale(arrowBounds.width / 24, arrowBounds.height / 24);
	context.lineWidth = 2;
	context.lineCap = "round";
	context.lineJoin = "round";
	context.strokeStyle = getComputedStyle(element).color;
	for (const path of arrow.querySelectorAll("path")) {
		const data = path.getAttribute("d");
		if (data) {
			context.stroke(new Path2D(data));
		}
	}
	context.restore();
}

export function paintBannerScene(
	context: CanvasRenderingContext2D,
	banner: HTMLElement,
	{ width, height, scale }: SceneSize
): void {
	context.setTransform(scale, 0, 0, scale, 0, 0);
	context.clearRect(0, 0, width, height);
	const origin = banner.getBoundingClientRect();
	const palette = getComputedStyle(banner);
	for (const action of banner.querySelectorAll<HTMLAnchorElement>(
		"[data-canvas-action]"
	)) {
		drawAction(context, action, origin, palette);
	}
	for (const text of banner.querySelectorAll<HTMLElement>(
		"[data-canvas-text]"
	)) {
		drawText(context, text, origin);
	}
}

export function drawInkSmudge(
	context: CanvasRenderingContext2D,
	scene: HTMLCanvasElement,
	{
		x,
		y,
		radius,
		seed,
		opacity,
		scale,
	}: {
		x: number;
		y: number;
		radius: number;
		seed: number;
		opacity: number;
		scale: number;
	}
): void {
	context.save();
	context.beginPath();
	context.arc(x, y, radius, 0, Math.PI * 2);
	context.clip();
	context.globalAlpha = opacity;
	context.filter = "blur(1.5px)";
	const left = Math.max(0, x - radius);
	const top = Math.max(0, y - radius);
	const width = Math.min(radius * 2, scene.width / scale - left);
	const height = Math.min(radius * 2, scene.height / scale - top);
	const shift = Math.min(radius * 0.15, 5);
	context.drawImage(
		scene,
		left * scale,
		top * scale,
		width * scale,
		height * scale,
		left + Math.cos(seed) * shift,
		top + Math.sin(seed) * shift,
		width,
		height
	);
	context.restore();
}
