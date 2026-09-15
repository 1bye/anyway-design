interface Bounds {
	height: number;
	width: number;
}
interface Anchor extends Bounds {
	x: number;
	y: number;
}

/** Canvas-local coordinates keep the card readable at every canvas zoom level. */
export function editorPosition(
	anchor: Anchor,
	panel: Bounds,
	canvas: Bounds,
	inPlace = false
) {
	const margin = 12;
	const gap = 20;
	const width = Math.min(panel.width, Math.max(0, canvas.width - margin * 2));
	const height = Math.min(
		panel.height,
		Math.max(0, canvas.height - margin * 2)
	);
	let x = anchor.x - 16;
	let y = anchor.y - 16;
	if (!inPlace) {
		x = anchor.x + anchor.width + gap;
		({ y } = anchor);
		if (x + width > canvas.width - margin) {
			x = anchor.x - width - gap;
		}
		if (x < margin) {
			x = anchor.x + anchor.width / 2 - width / 2;
			y = anchor.y + anchor.height + gap;
			if (y + height > canvas.height - margin) {
				y = anchor.y - height - gap;
			}
		}
	}
	return {
		x: Math.max(margin, Math.min(x, canvas.width - width - margin)),
		y: Math.max(margin, Math.min(y, canvas.height - height - margin)),
	};
}
