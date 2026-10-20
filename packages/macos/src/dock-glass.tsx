import { useEffect, useReducer, useRef } from "react";
import { GLASS_FRAGMENT, GLASS_VERTEX } from "./dock-glass-shader";

export interface DockGlassBackdrop {
	height: number;
	/** Same-origin or CORS-enabled image containing the scene behind the Dock. */
	src: string;
	/** Displayed image dimensions in CSS pixels, before ancestor zoom. */
	width: number;
	/** Image's top-left relative to the resting Dock's top-left, in CSS pixels. */
	x: number;
	y: number;
}

function createProgram(gl: WebGLRenderingContext) {
	const program = gl.createProgram();
	if (!program) {
		throw new Error("Unable to create the glass shader program");
	}
	for (const [type, source] of [
		[gl.VERTEX_SHADER, GLASS_VERTEX],
		[gl.FRAGMENT_SHADER, GLASS_FRAGMENT],
	] as const) {
		const shader = gl.createShader(type);
		if (!shader) {
			gl.deleteProgram(program);
			throw new Error("Unable to allocate a glass shader");
		}
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			const message = gl.getShaderInfoLog(shader);
			gl.deleteShader(shader);
			gl.deleteProgram(program);
			throw new Error(message ?? "Glass shader compilation failed");
		}
		gl.attachShader(program, shader);
		gl.deleteShader(shader);
	}
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		const message = gl.getProgramInfoLog(program);
		gl.deleteProgram(program);
		throw new Error(message ?? "Glass shader linking failed");
	}
	return program;
}

function uploadBackdrop(
	gl: WebGLRenderingContext,
	image: HTMLImageElement,
	displayWidth: number
) {
	const maximum = Math.min(2048, gl.getParameter(gl.MAX_TEXTURE_SIZE));
	const scale = Math.min(1, maximum / Math.max(image.width, image.height));
	const blurred = document.createElement("canvas");
	blurred.width = Math.max(1, Math.round(image.width * scale));
	blurred.height = Math.max(1, Math.round(image.height * scale));
	const context = blurred.getContext("2d");
	if (!context) {
		throw new Error("Unable to prepare the glass backdrop");
	}
	context.filter = `blur(${(16 * blurred.width) / displayWidth}px)`;
	context.drawImage(image, 0, 0, blurred.width, blurred.height);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, blurred);
}

export function DockGlass({ backdrop }: { backdrop: DockGlassBackdrop }) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [contextVersion, restoreContext] = useReducer((value) => value + 1, 0);
	const { src, width, height, x, y } = backdrop;

	// biome-ignore lint/correctness/useExhaustiveDependencies: Restoring a WebGL context requires rebuilding its GPU resources.
	useEffect(() => {
		const canvas = canvasRef.current;
		if (canvas === null) {
			return;
		}
		const dock = canvas.closest<HTMLElement>(".mac-dock");
		if (
			dock === null ||
			![width, height, x, y].every(Number.isFinite) ||
			width <= 0 ||
			height <= 0
		) {
			return;
		}
		const gl = canvas.getContext("webgl", {
			antialias: false,
			depth: false,
			powerPreference: "low-power",
			premultipliedAlpha: true,
		});
		if (!gl) {
			canvas.dataset.renderer = "css-fallback";
			return;
		}
		let program: WebGLProgram;
		try {
			program = createProgram(gl);
		} catch {
			canvas.dataset.renderer = "css-fallback";
			return;
		}
		const buffer = gl.createBuffer();
		const texture = gl.createTexture();
		if (!(buffer && texture)) {
			gl.deleteBuffer(buffer);
			gl.deleteTexture(texture);
			gl.deleteProgram(program);
			canvas.dataset.renderer = "css-fallback";
			return;
		}
		// biome-ignore lint/correctness/useHookAtTopLevel: WebGL's useProgram is a GPU API, not a React hook.
		gl.useProgram(program);
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
			gl.STATIC_DRAW
		);
		const position = gl.getAttribLocation(program, "position");
		gl.enableVertexAttribArray(position);
		gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		const uniforms = Object.fromEntries(
			["size", "imageSize", "imageOffset", "radius", "density", "dark"].map(
				(name) => [name, gl.getUniformLocation(program, name)]
			)
		);
		const maximum = Math.min(8192, gl.getParameter(gl.MAX_RENDERBUFFER_SIZE));
		const environment = dock.closest<HTMLElement>(".macos");
		let disposed = false;
		let loaded = false;
		let frame = 0;
		const paint = () => {
			frame = 0;
			if (!loaded || disposed || gl.isContextLost()) {
				return;
			}
			const bounds = canvas.getBoundingClientRect();
			const styles = getComputedStyle(canvas);
			const w = Number.parseFloat(styles.width);
			const h = Number.parseFloat(styles.height);
			if (!(w > 0 && h > 0)) {
				return;
			}
			const zoom = bounds.width / w;
			const density = Math.min(
				window.devicePixelRatio * zoom,
				4,
				maximum / w,
				maximum / h
			);
			canvas.width = Math.max(1, Math.round(w * density));
			canvas.height = Math.max(1, Math.round(h * density));
			const dockBounds = dock.getBoundingClientRect();
			const surface = canvas.parentElement;
			const radius = surface
				? Number.parseFloat(getComputedStyle(surface).borderRadius)
				: 0;
			gl.viewport(0, 0, canvas.width, canvas.height);
			gl.clear(gl.COLOR_BUFFER_BIT);
			gl.uniform2f(uniforms.size ?? null, w, h);
			gl.uniform2f(uniforms.imageSize ?? null, width, height);
			gl.uniform2f(
				uniforms.imageOffset ?? null,
				(bounds.left - dockBounds.left) / zoom - x,
				(bounds.top - dockBounds.top) / zoom - y
			);
			gl.uniform1f(uniforms.radius ?? null, Math.min(radius, w / 2, h / 2));
			gl.uniform1f(uniforms.density ?? null, density);
			gl.uniform1f(
				uniforms.dark ?? null,
				Number(environment?.dataset.appearance === "dark")
			);
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
			canvas.dataset.renderer =
				gl.getError() === gl.NO_ERROR ? "webgl" : "css-fallback";
		};
		const schedule = () => {
			if (!frame) {
				frame = requestAnimationFrame(paint);
			}
		};
		const image = new Image();
		image.crossOrigin = "anonymous";
		image.onload = () => {
			if (disposed || gl.isContextLost()) {
				return;
			}
			try {
				uploadBackdrop(gl, image, width);
				loaded = true;
				schedule();
			} catch {
				canvas.dataset.renderer = "css-fallback";
			}
		};
		image.onerror = () => {
			canvas.dataset.renderer = "css-fallback";
		};
		image.src = src;
		const resize = new ResizeObserver(schedule);
		resize.observe(canvas);
		// CSS zoom doesn't change the observed content box; watch ancestor style changes.
		const changes = new MutationObserver(schedule);
		for (
			let ancestor: HTMLElement | null = dock;
			ancestor;
			ancestor = ancestor.parentElement
		) {
			changes.observe(ancestor, {
				attributeFilter: ["style", "data-appearance"],
				attributes: true,
			});
		}
		const lost = (event: Event) => {
			event.preventDefault();
			canvas.dataset.renderer = "css-fallback";
		};
		canvas.addEventListener("webglcontextlost", lost);
		canvas.addEventListener("webglcontextrestored", restoreContext);
		window.addEventListener("resize", schedule);
		return () => {
			disposed = true;
			cancelAnimationFrame(frame);
			resize.disconnect();
			changes.disconnect();
			image.onload = null;
			image.onerror = null;
			canvas.removeEventListener("webglcontextlost", lost);
			canvas.removeEventListener("webglcontextrestored", restoreContext);
			window.removeEventListener("resize", schedule);
			gl.deleteBuffer(buffer);
			gl.deleteTexture(texture);
			gl.deleteProgram(program);
			canvas.dataset.renderer = "css-fallback";
		};
	}, [src, width, height, x, y, contextVersion]);

	return <canvas className="mac-dock-glass" ref={canvasRef} tabIndex={-1} />;
}
