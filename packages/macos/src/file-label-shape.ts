export interface FileLabelRect {
	bottom: number;
	left: number;
	right: number;
	top: number;
}

interface Point {
	x: number;
	y: number;
}

function roundedOutline(points: Point[], radius: number): string {
	const corners = points.filter((point, index) => {
		const before = points.at(index - 1) ?? point;
		const after = points[(index + 1) % points.length] ?? point;
		return (
			(point.x - before.x) * (after.y - point.y) !==
			(point.y - before.y) * (after.x - point.x)
		);
	});
	const segments = corners
		.map((point, index) => {
			const before = corners.at(index - 1) ?? point;
			const after = corners[(index + 1) % corners.length] ?? point;
			const previousLength = Math.hypot(before.x - point.x, before.y - point.y);
			const nextLength = Math.hypot(after.x - point.x, after.y - point.y);
			const inset = Math.min(radius, previousLength / 2, nextLength / 2);
			const start = {
				x: point.x + ((before.x - point.x) * inset) / previousLength,
				y: point.y + ((before.y - point.y) * inset) / previousLength,
			};
			const end = {
				x: point.x + ((after.x - point.x) * inset) / nextLength,
				y: point.y + ((after.y - point.y) * inset) / nextLength,
			};
			return `${index === 0 ? "M" : "L"}${start.x},${start.y}Q${point.x},${point.y} ${end.x},${end.y}`;
		})
		.join("");
	return `${segments}Z`;
}

// A single outline joins the two centered label lines, including inward corners.
export function fileLabelPath(
	rects: readonly FileLabelRect[],
	radius = 4
): string {
	const [first, second] = rects.filter(
		(rect) => rect.right > rect.left && rect.bottom > rect.top
	);
	if (!first) {
		return "";
	}
	const last = second ?? first;
	const seam = second ? (first.bottom + second.top) / 2 : first.bottom;
	const points = second
		? [
				{ x: first.left, y: first.top },
				{ x: first.right, y: first.top },
				{ x: first.right, y: seam },
				{ x: last.right, y: seam },
				{ x: last.right, y: last.bottom },
				{ x: last.left, y: last.bottom },
				{ x: last.left, y: seam },
				{ x: first.left, y: seam },
			]
		: [
				{ x: first.left, y: first.top },
				{ x: first.right, y: first.top },
				{ x: first.right, y: first.bottom },
				{ x: first.left, y: first.bottom },
			];
	return roundedOutline(points, Math.max(0, radius));
}
