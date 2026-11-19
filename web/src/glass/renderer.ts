import {
  BLUR_FRAGMENT,
  COMPOSITE_FRAGMENT,
  DOWNSAMPLE_FRAGMENT,
  QUAD_VERTEX,
  REGION_VERTEX,
} from './shaders'
import { REGION_STRIDE, type GlassSettings } from './types'

const POSITION = 0
const ALPHA = 1
const VERTICES_PER_REGION = 6
const FLOATS_PER_VERTEX = 3
const BLUR_REACH = 4.5

interface Target {
  framebuffer: WebGLFramebuffer
  texture: WebGLTexture
}

interface Program {
  program: WebGLProgram
  uniforms: Record<string, WebGLUniformLocation | null>
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)
  if (!shader) throw new Error('Unable to create a shader')
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? 'Shader compilation failed')
  }
  return shader
}

function link(gl: WebGLRenderingContext, vertex: string, fragment: string, uniforms: string[]): Program {
  const program = gl.createProgram()
  if (!program) throw new Error('Unable to create a program')
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vertex))
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fragment))
  gl.bindAttribLocation(program, POSITION, 'a_position')
  gl.bindAttribLocation(program, ALPHA, 'a_alpha')
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) ?? 'Program link failed')
  }
  gl.useProgram(program)
  gl.uniform1i(gl.getUniformLocation(program, 'u_texture'), 0)
  return {
    program,
    uniforms: Object.fromEntries(uniforms.map((name) => [name, gl.getUniformLocation(program, name)])),
  }
}

function createGameTexture(gl: WebGLRenderingContext): WebGLTexture {
  const texture = gl.createTexture()
  if (!texture) throw new Error('Unable to create the game texture')
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]))
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT)
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  return texture
}

function createTarget(gl: WebGLRenderingContext, width: number, height: number): Target {
  const texture = gl.createTexture()
  const framebuffer = gl.createFramebuffer()
  if (!texture || !framebuffer) throw new Error('Unable to create a render target')
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  return { framebuffer, texture }
}

export class GlassRenderer {
  private readonly canvas: OffscreenCanvas
  private readonly gl: WebGLRenderingContext
  private readonly game: WebGLTexture
  private readonly quad: WebGLBuffer
  private readonly vertices: WebGLBuffer
  private readonly downsample: Program
  private readonly blur: Program
  private readonly composite: Program

  private settings: GlassSettings
  private targets: [Target, Target] | null = null
  private targetWidth = 0
  private targetHeight = 0
  private regions: Float32Array = new Float32Array(0)
  private vertexCount = 0
  private scissor: [number, number, number, number] = [0, 0, 0, 0]
  private frame = 0
  private lastFrame = 0

  constructor(canvas: OffscreenCanvas, width: number, height: number, settings: GlassSettings) {
    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      desynchronized: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance',
    })
    if (!gl) throw new Error('WebGL is not available')

    this.canvas = canvas
    this.gl = gl
    this.settings = this.sanitize(settings)
    this.game = createGameTexture(gl)
    this.downsample = link(gl, QUAD_VERTEX, DOWNSAMPLE_FRAGMENT, ['u_offset'])
    this.blur = link(gl, QUAD_VERTEX, BLUR_FRAGMENT, ['u_direction'])
    this.composite = link(gl, REGION_VERTEX, COMPOSITE_FRAGMENT, [])

    const quad = gl.createBuffer()
    const vertices = gl.createBuffer()
    if (!quad || !vertices) throw new Error('Unable to create the buffers')
    gl.bindBuffer(gl.ARRAY_BUFFER, quad)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    this.quad = quad
    this.vertices = vertices

    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.enableVertexAttribArray(POSITION)
    this.resize(width, height)
  }

  resize(width: number, height: number) {
    this.canvas.width = Math.max(1, Math.round(width))
    this.canvas.height = Math.max(1, Math.round(height))
    this.allocateTargets()
    this.updateRegions()
  }

  configure(settings: GlassSettings) {
    const previous = this.settings.downscale
    this.settings = this.sanitize(settings)
    if (this.settings.downscale !== previous) this.allocateTargets()
    this.updateRegions()
  }

  setRegions(regions: Float32Array) {
    this.regions = regions
    this.updateRegions()
  }

  private sanitize(settings: GlassSettings): GlassSettings {
    return {
      enabled: settings.enabled !== false,
      fps: clamp(Number(settings.fps) || 60, 10, 240),
      downscale: Math.round(clamp(Number(settings.downscale) || 4, 1, 8)),
      strength: Math.round(clamp(Number(settings.strength) || 2, 1, 6)),
    }
  }

  private allocateTargets() {
    const { gl } = this
    if (this.targets) {
      for (const target of this.targets) {
        gl.deleteFramebuffer(target.framebuffer)
        gl.deleteTexture(target.texture)
      }
    }
    this.targetWidth = Math.max(1, Math.ceil(this.canvas.width / this.settings.downscale))
    this.targetHeight = Math.max(1, Math.ceil(this.canvas.height / this.settings.downscale))
    this.targets = [
      createTarget(gl, this.targetWidth, this.targetHeight),
      createTarget(gl, this.targetWidth, this.targetHeight),
    ]
  }

  private updateRegions() {
    const { width, height } = this.canvas
    const count = this.settings.enabled ? this.regions.length / REGION_STRIDE : 0
    const data = new Float32Array(count * VERTICES_PER_REGION * FLOATS_PER_VERTEX)
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    for (let i = 0; i < count; i++) {
      const offset = i * REGION_STRIDE
      const x = this.regions[offset]
      const y = this.regions[offset + 1]
      const w = this.regions[offset + 2]
      const h = this.regions[offset + 3]
      const alpha = this.regions[offset + 4]
      const left = (x / width) * 2 - 1
      const right = ((x + w) / width) * 2 - 1
      const top = 1 - (y / height) * 2
      const bottom = 1 - ((y + h) / height) * 2

      data.set(
        [left, bottom, alpha, right, bottom, alpha, left, top, alpha, left, top, alpha, right, bottom, alpha, right, top, alpha],
        i * VERTICES_PER_REGION * FLOATS_PER_VERTEX,
      )

      minX = Math.min(minX, x)
      maxX = Math.max(maxX, x + w)
      minY = Math.min(minY, height - y - h)
      maxY = Math.max(maxY, height - y)
    }

    this.vertexCount = count * VERTICES_PER_REGION
    const { gl } = this
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertices)
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW)

    if (count > 0) {
      const scale = this.settings.downscale
      const margin = Math.ceil(BLUR_REACH * this.settings.strength) + 2
      const x0 = clamp(Math.floor(minX / scale) - margin, 0, this.targetWidth)
      const y0 = clamp(Math.floor(minY / scale) - margin, 0, this.targetHeight)
      const x1 = clamp(Math.ceil(maxX / scale) + margin, 0, this.targetWidth)
      const y1 = clamp(Math.ceil(maxY / scale) + margin, 0, this.targetHeight)
      this.scissor = [x0, y0, x1 - x0, y1 - y0]
      this.start()
    } else {
      this.stop()
    }
  }

  private start() {
    if (!this.frame) this.frame = requestAnimationFrame(this.tick)
  }

  private stop() {
    if (this.frame) {
      cancelAnimationFrame(this.frame)
      this.frame = 0
    }
    const { gl } = this
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0, 0, this.canvas.width, this.canvas.height)
    gl.disable(gl.SCISSOR_TEST)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
  }

  private tick = (now: number) => {
    this.frame = requestAnimationFrame(this.tick)
    if (now - this.lastFrame < 1000 / this.settings.fps - 1) return
    this.lastFrame = now
    this.render()
  }

  private pass(program: Program, target: Target, source: WebGLTexture) {
    const { gl } = this
    gl.useProgram(program.program)
    gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer)
    gl.bindTexture(gl.TEXTURE_2D, source)
  }

  private render() {
    const { gl, targets } = this
    if (!targets || this.vertexCount === 0) return
    const [front, back] = targets
    const scale = this.settings.downscale

    gl.disable(gl.BLEND)
    gl.enable(gl.SCISSOR_TEST)
    gl.scissor(...this.scissor)
    gl.viewport(0, 0, this.targetWidth, this.targetHeight)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad)
    gl.vertexAttribPointer(POSITION, 2, gl.FLOAT, false, 0, 0)
    gl.disableVertexAttribArray(ALPHA)

    this.pass(this.downsample, front, this.game)
    gl.uniform2f(this.downsample.uniforms.u_offset, (scale * 0.25) / this.canvas.width, (scale * 0.25) / this.canvas.height)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

    for (let i = 0; i < this.settings.strength; i++) {
      this.pass(this.blur, back, front.texture)
      gl.uniform2f(this.blur.uniforms.u_direction, 1 / this.targetWidth, 0)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

      this.pass(this.blur, front, back.texture)
      gl.uniform2f(this.blur.uniforms.u_direction, 0, 1 / this.targetHeight)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }

    gl.disable(gl.SCISSOR_TEST)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0, 0, this.canvas.width, this.canvas.height)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.enable(gl.BLEND)
    gl.useProgram(this.composite.program)
    gl.bindTexture(gl.TEXTURE_2D, front.texture)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertices)
    gl.vertexAttribPointer(POSITION, 2, gl.FLOAT, false, FLOATS_PER_VERTEX * 4, 0)
    gl.vertexAttribPointer(ALPHA, 1, gl.FLOAT, false, FLOATS_PER_VERTEX * 4, 8)
    gl.enableVertexAttribArray(ALPHA)
    gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount)
  }
}
