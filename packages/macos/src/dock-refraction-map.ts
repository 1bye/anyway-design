export const DISPLACEMENT_SCALE = 12;

/** Encode a rounded glass edge's inward sampling vector in the R/G channels. */
export function createRefractionMap(
	width: number,
	height: number,
	radius: number
) {
	if (
		!(Number.isInteger(width) && Number.isInteger(height)) ||
		width <= 0 ||
		height <= 0 ||
		!Number.isFinite(radius)
	) {
		throw new RangeError(
			"Refraction maps require positive integer dimensions and a finite radius"
		);
	}
	const pixels = new Uint8ClampedArray(width * height * 4);
	const r = Math.max(0, Math.min(radius, width / 2, height / 2));
	for (let y = 0; y < height; y += 1) {
		for (let x = 0; x < width; x += 1) {
			const cx = x + 0.5 - width / 2;
			const cy = y + 0.5 - height / 2;
			const qx = Math.abs(cx) - (width / 2 - r);
			const qy = Math.abs(cy) - (height / 2 - r);
			const ox = Math.max(qx, 0);
			const oy = Math.max(qy, 0);
			const length = Math.sqrt(ox * ox + oy * oy);
			const distance = length + Math.min(Math.max(qx, qy), 0) - r;
			const displacement =
				distance < -18 ? 0 : 5.5 * Math.exp(-Math.max(-distance, 0) / 3);
			let nx = 0;
			let ny = 0;
			if (length > 0) {
				nx = (Math.sign(cx) * ox) / length;
				ny = (Math.sign(cy) * oy) / length;
			} else if (qx > qy) {
				nx = Math.sign(cx);
			} else {
				ny = Math.sign(cy);
			}
			const index = (y * width + x) * 4;
			pixels[index] = 255 * (0.5 - (nx * displacement) / DISPLACEMENT_SCALE);
			pixels[index + 1] =
				255 * (0.5 - (ny * displacement) / DISPLACEMENT_SCALE);
			pixels[index + 2] = 128;
			pixels[index + 3] = 255;
		}
	}
	return pixels;
}
