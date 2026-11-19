export const QUAD_VERTEX = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`

export const REGION_VERTEX = `
attribute vec2 a_position;
attribute float a_alpha;
varying vec2 v_uv;
varying float v_alpha;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  v_alpha = a_alpha;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`

export const DOWNSAMPLE_FRAGMENT = `
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_texture;
uniform vec2 u_offset;
void main() {
  vec3 color = texture2D(u_texture, v_uv + vec2(-u_offset.x, -u_offset.y)).rgb
    + texture2D(u_texture, v_uv + vec2(u_offset.x, -u_offset.y)).rgb
    + texture2D(u_texture, v_uv + vec2(-u_offset.x, u_offset.y)).rgb
    + texture2D(u_texture, v_uv + vec2(u_offset.x, u_offset.y)).rgb;
  gl_FragColor = vec4(color * 0.25, 1.0);
}`

export const BLUR_FRAGMENT = `
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_texture;
uniform vec2 u_direction;
void main() {
  vec2 near = u_direction * 1.3846153846;
  vec2 far = u_direction * 3.2307692308;
  vec3 color = texture2D(u_texture, v_uv).rgb * 0.2270270270
    + (texture2D(u_texture, v_uv + near).rgb + texture2D(u_texture, v_uv - near).rgb) * 0.3162162162
    + (texture2D(u_texture, v_uv + far).rgb + texture2D(u_texture, v_uv - far).rgb) * 0.0702702703;
  gl_FragColor = vec4(color, 1.0);
}`

export const COMPOSITE_FRAGMENT = `
precision mediump float;
varying vec2 v_uv;
varying float v_alpha;
uniform sampler2D u_texture;
void main() {
  gl_FragColor = vec4(texture2D(u_texture, v_uv).rgb, v_alpha);
}`
