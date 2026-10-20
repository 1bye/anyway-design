export const GLASS_VERTEX = `
attribute vec2 position;
varying vec2 uv;
void main() {
  uv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

export const GLASS_FRAGMENT = `
precision highp float;
varying vec2 uv;
uniform sampler2D backdrop;
uniform vec2 size;
uniform vec2 imageSize;
uniform vec2 imageOffset;
uniform float radius;
uniform float density;
uniform float dark;

float roundedBox(vec2 p) {
  vec2 q = abs(p - size * 0.5) - (size * 0.5 - radius);
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
}

void main() {
  vec2 p = vec2(uv.x, 1.0 - uv.y) * size;
  float distance = roundedBox(p);
  float aa = 0.65 / density;
  float coverage = 1.0 - smoothstep(-aa, aa, distance);
  if (coverage < 0.001) discard;

  vec2 normal = normalize(vec2(
    roundedBox(p + vec2(0.2, 0.0)) - roundedBox(p - vec2(0.2, 0.0)),
    roundedBox(p + vec2(0.0, 0.2)) - roundedBox(p - vec2(0.0, 0.2))
  ) + vec2(0.00001));

  // A curved lip compresses the wallpaper inward at the perimeter.
  float lip = exp(-max(-distance, 0.0) / 3.0);
  vec2 refracted = p - normal * lip * 5.5;
  vec3 color = texture2D(backdrop, (refracted + imageOffset) / imageSize).rgb;
  float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
  color = mix(vec3(luminance), color, 1.12);
  color += vec3(0.0, 0.0, 0.015);
  color = mix(color, mix(vec3(0.94, 0.98, 1.0), vec3(0.08, 0.11, 0.16), dark),
    mix(0.19, 0.26, dark));

  // Separate the narrow specular rim from the wider, faint inner reflection.
  float rim = exp(-pow((distance + 0.5) / 0.45, 2.0));
  float inner = exp(-pow((distance + 1.0) / 0.6, 2.0));
  float light = 0.72 + 0.28 * max(dot(normal, normalize(vec2(-0.45, -1.0))), 0.0);
  color = mix(color, vec3(0.75, 0.94, 1.0), rim * light * 0.52);
  color += vec3(0.03, 0.045, 0.05) * inner * light;
  gl_FragColor = vec4(color * coverage, coverage);
}
`;
