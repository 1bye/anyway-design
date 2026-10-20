import { useEffect, useId, useRef } from "react";
import { createRefractionMap, DISPLACEMENT_SCALE } from "./dock-refraction-map";

const CHROMIUM = /(?:Chrome|Chromium)\/\d+/;

export function DockBackdropFilter() {
	const id = `dock-refraction-${useId().replaceAll(":", "")}`;
	const svgRef = useRef<SVGSVGElement>(null);
	const filterRef = useRef<SVGFilterElement>(null);
	const mapRef = useRef<SVGFEImageElement>(null);

	useEffect(() => {
		const surface = svgRef.current?.parentElement;
		const filter = filterRef.current;
		const map = mapRef.current;
		if (!(surface && filter && map)) {
			return;
		}
		// CSS.supports tests syntax, not whether an engine renders SVG backdrop filters.
		// shortcut: enable the tested Chromium path; revisit as WebKit/Gecko support improves.
		if (
			!(
				CHROMIUM.test(navigator.userAgent) &&
				CSS.supports("backdrop-filter", `url("#${id}")`)
			)
		) {
			return;
		}
		const canvas = document.createElement("canvas");
		const context = canvas.getContext("2d");
		if (!context) {
			return;
		}
		let frame = 0;
		let previous = "";
		const fallback = () => {
			surface.style.removeProperty("--dock-live-filter");
			delete surface.dataset.refraction;
			previous = "";
		};
		const update = () => {
			frame = 0;
			const styles = getComputedStyle(surface);
			const width = Math.ceil(Number.parseFloat(styles.width));
			const height = Math.ceil(Number.parseFloat(styles.height));
			const radius = Number.parseFloat(styles.borderRadius);
			if (
				!(width > 0 && height > 0 && Number.isFinite(radius)) ||
				width > 4096 ||
				height > 4096 ||
				width * height > 1_000_000
			) {
				fallback();
				return;
			}
			const geometry = `${width}:${height}:${radius}`;
			if (geometry === previous) {
				return;
			}
			previous = geometry;
			canvas.width = width;
			canvas.height = height;
			try {
				context.putImageData(
					new ImageData(
						createRefractionMap(width, height, radius),
						width,
						height
					),
					0,
					0
				);
				map.setAttribute("href", canvas.toDataURL());
			} catch {
				fallback();
				return;
			}
			map.setAttribute("width", String(width));
			map.setAttribute("height", String(height));
			filter.setAttribute("width", String(width + 64));
			filter.setAttribute("height", String(height + 64));
			surface.style.setProperty(
				"--dock-live-filter",
				`url("#${id}") saturate(1.12)`
			);
			surface.dataset.refraction = "live";
		};
		const schedule = () => {
			if (!frame) {
				frame = requestAnimationFrame(update);
			}
		};
		const observer = new ResizeObserver(schedule);
		observer.observe(surface);
		map.addEventListener("error", fallback);
		update();
		return () => {
			cancelAnimationFrame(frame);
			observer.disconnect();
			map.removeEventListener("error", fallback);
			fallback();
		};
	}, [id]);

	return (
		<svg
			aria-hidden="true"
			className="mac-dock-filter-definitions"
			focusable="false"
			height="0"
			ref={svgRef}
			width="0"
		>
			<defs>
				<filter
					colorInterpolationFilters="sRGB"
					filterUnits="userSpaceOnUse"
					id={id}
					ref={filterRef}
					x="-32"
					y="-32"
				>
					<feImage
						preserveAspectRatio="none"
						ref={mapRef}
						result="edge"
						x="0"
						y="0"
					/>
					<feGaussianBlur in="SourceGraphic" result="soft" stdDeviation="16" />
					<feDisplacementMap
						in="soft"
						in2="edge"
						scale={DISPLACEMENT_SCALE}
						xChannelSelector="R"
						yChannelSelector="G"
					/>
				</filter>
			</defs>
		</svg>
	);
}
