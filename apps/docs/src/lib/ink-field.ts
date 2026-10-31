import { getInkRadius, INK_LIFETIME_MS, type InkBloom } from "./ink-wash";

const MAX_DROPS = 48;
const FIELD_DENSITY = 1.25;

const vertexSource = `#version 300 es
const vec2 positions[3] = vec2[3](vec2(-1, -1), vec2(3, -1), vec2(-1, 3));
void main() {
  gl_Position = vec4(positions[gl_VertexID], 0, 1);
}`;

const fragmentSource = `#version 300 es
precision highp float;
uniform vec2 uSize;
uniform vec2 uBuffer;
uniform vec3 uColor;
uniform int uCount;
uniform vec4 uDrops[48];
uniform float uSeeds[48];
out vec4 outputColor;

void main() {
  vec2 point = gl_FragCoord.xy / uBuffer * uSize;
  point.y = uSize.y - point.y;
  float field = 100000.0;
  float opacity = 0.0;
  float radius = 7.0;
  for (int i = 0; i < 48; i++) {
    if (i >= uCount) break;
    vec4 drop = uDrops[i];
    vec2 offset = point - drop.xy;
    float radial = length(offset);
    if (radial > drop.z + 40.0) continue;
    float angle = atan(offset.y, offset.x + 0.0001);
    float edge = drop.z * (1.0 + 0.08 * sin(angle * 3.0 + uSeeds[i])
      + 0.04 * sin(angle * 7.0 - uSeeds[i]));
    float distance = radial - edge;
    if (field > 99999.0) {
      field = distance;
      opacity = drop.w;
      radius = drop.z;
      continue;
    }
    // Polynomial smooth minimum: a single continuous, rounded ink contour.
    float blend = max(0.001, 32.0 * smoothstep(0.0, 0.2, min(opacity, drop.w)));
    float h = clamp(0.5 + 0.5 * (distance - field) / blend, 0.0, 1.0);
    field = mix(distance, field, h) - blend * h * (1.0 - h);
    opacity = mix(drop.w, opacity, h);
    radius = mix(drop.z, radius, h);
  }
  float aa = clamp(fwidth(field), 0.7, 1.5);
  float coverage = 1.0 - smoothstep(-aa, aa, field);
  float depth = clamp(-field / radius, 0.0, 1.0);
  float body = opacity * mix(0.55, 1.0, smoothstep(0.0, 0.6, depth)) * coverage;
  float halo = opacity * 0.2 * (1.0 - smoothstep(0.0, radius, max(field, 0.0)));
  float alpha = body + (1.0 - body) * halo;
  outputColor = vec4(uColor * alpha, alpha);
}`;

function compileShader(
	gl: WebGL2RenderingContext,
	type: number,
	source: string
): WebGLShader | null {
	const shader = gl.createShader(type);
	if (!shader) {
		return null;
	}
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		gl.deleteShader(shader);
		return null;
	}
	return shader;
}

function createProgram(gl: WebGL2RenderingContext): WebGLProgram | null {
	const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
	const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
	const program = gl.createProgram();
	if (!(vertex && fragment && program)) {
		gl.deleteShader(vertex);
		gl.deleteShader(fragment);
		gl.deleteProgram(program);
		return null;
	}
	gl.attachShader(program, vertex);
	gl.attachShader(program, fragment);
	gl.linkProgram(program);
	gl.deleteShader(vertex);
	gl.deleteShader(fragment);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		gl.deleteProgram(program);
		return null;
	}
	return program;
}

interface FieldSize {
	color: string;
	height: number;
	width: number;
}

export function createInkField() {
	const canvas = document.createElement("canvas");
	const gl = canvas.getContext("webgl2", {
		alpha: true,
		antialias: false,
		depth: false,
		stencil: false,
	});
	if (!gl) {
		return null;
	}
	const program = createProgram(gl);
	if (!program) {
		return null;
	}
	const locations = {
		buffer: gl.getUniformLocation(program, "uBuffer"),
		color: gl.getUniformLocation(program, "uColor"),
		count: gl.getUniformLocation(program, "uCount"),
		drops: gl.getUniformLocation(program, "uDrops[0]"),
		seeds: gl.getUniformLocation(program, "uSeeds[0]"),
		size: gl.getUniformLocation(program, "uSize"),
	};
	const drops = new Float32Array(MAX_DROPS * 4);
	const seeds = new Float32Array(MAX_DROPS);

	return {
		dispose() {
			gl.deleteProgram(program);
			gl.getExtension("WEBGL_lose_context")?.loseContext();
		},
		draw(
			context: CanvasRenderingContext2D,
			blooms: readonly InkBloom[],
			now: number,
			{ width, height, color }: FieldSize
		): boolean {
			if (gl.isContextLost()) {
				return false;
			}
			if (!blooms.length) {
				return true;
			}
			const pixelWidth = Math.round(width * FIELD_DENSITY);
			const pixelHeight = Math.round(height * FIELD_DENSITY);
			if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
				canvas.width = pixelWidth;
				canvas.height = pixelHeight;
			}
			let left = width;
			let top = height;
			let right = 0;
			let bottom = 0;
			const count = Math.min(blooms.length, MAX_DROPS);
			for (let index = 0; index < count; index += 1) {
				const bloom = blooms[index];
				const age = now - bloom.born;
				const radius = getInkRadius(bloom) + (age / INK_LIFETIME_MS) * 6;
				const fade = 1 - Math.max(0, (age - 1800) / (INK_LIFETIME_MS - 1800));
				drops.set(
					[bloom.x, bloom.y, radius, (0.48 + bloom.volume * 0.012) * fade],
					index * 4
				);
				seeds[index] = bloom.seed;
				left = Math.min(left, bloom.x - radius - 40);
				top = Math.min(top, bloom.y - radius - 40);
				right = Math.max(right, bloom.x + radius + 40);
				bottom = Math.max(bottom, bloom.y + radius + 40);
			}
			gl.viewport(0, 0, pixelWidth, pixelHeight);
			gl.disable(gl.SCISSOR_TEST);
			gl.clearColor(0, 0, 0, 0);
			gl.clear(gl.COLOR_BUFFER_BIT);
			const x = Math.max(0, Math.floor((left * pixelWidth) / width));
			const y = Math.max(
				0,
				Math.floor(((height - bottom) * pixelHeight) / height)
			);
			const endX = Math.min(
				pixelWidth,
				Math.ceil((right * pixelWidth) / width)
			);
			const endY = Math.min(
				pixelHeight,
				Math.ceil(((height - top) * pixelHeight) / height)
			);
			gl.enable(gl.SCISSOR_TEST);
			gl.scissor(x, y, Math.max(0, endX - x), Math.max(0, endY - y));
			// biome-ignore lint/correctness/useHookAtTopLevel: WebGL useProgram binds a shader, not a React hook.
			gl.useProgram(program);
			gl.uniform2f(locations.size, width, height);
			gl.uniform2f(locations.buffer, pixelWidth, pixelHeight);
			gl.uniform3fv(
				locations.color,
				color.split(",").map((value) => Number(value) / 255)
			);
			gl.uniform1i(locations.count, count);
			gl.uniform4fv(locations.drops, drops);
			gl.uniform1fv(locations.seeds, seeds);
			gl.drawArrays(gl.TRIANGLES, 0, 3);
			context.drawImage(canvas, 0, 0, width, height);
			return true;
		},
	};
}
