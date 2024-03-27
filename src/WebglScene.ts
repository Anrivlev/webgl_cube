export class WebglScene {
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram;

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl2');
    if (!gl) throw new Error(`Не удалось создать контекст`);
    this.gl = gl;
    const program = gl.createProgram();
    if (!program) throw new Error(`Не удалось создать программу`);
    this.program = program;
  }

  public addShader(shaderSource: string, shaderType: 'vertex' | 'fragment'): WebGLShader {
    const glShaderType = shaderType === 'vertex' ? this.gl.VERTEX_SHADER : this.gl.FRAGMENT_SHADER;
    const shader = this.gl.createShader(glShaderType);
    if (!shader) throw new Error(`Не удалось создать шейдер`);
    this.gl.shaderSource(shader, shaderSource);
    this.gl.compileShader(shader);
    this.gl.attachShader(this.program, shader);
    return shader;
  }

  public linkAndUseProgram(): void {
    this.gl.linkProgram(this.program);
    this.gl.useProgram(this.program);
  }

  public draw(): void {
    const bufferData = new Float32Array([
      -0.5, -0.5, 0.0, 1, 0, 0,
      //
      0.5, 0.5, 0, 0, 1, 0,
      //
      -0.6, 0.3, 0, 0, 1, 1,
      //
      -0.8, -0.8, 0, 0.5, 0.5, 0,
      //
    ]);
    const BUFFER_DATA_SINGLE_ELEMENT_SIZE = 7;
    const FLOAT_SIZE = 4;

    const pointPositionLoc = this.gl.getAttribLocation(this.program, 'aPosition');
    const pointColorLoc = this.gl.getAttribLocation(this.program, 'aColor');
    this.gl.enableVertexAttribArray(pointPositionLoc);
    this.gl.enableVertexAttribArray(pointColorLoc);

    const buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, bufferData, this.gl.STATIC_DRAW);

    this.gl.vertexAttribPointer(
      pointPositionLoc,
      3,
      this.gl.FLOAT,
      false,
      BUFFER_DATA_SINGLE_ELEMENT_SIZE * FLOAT_SIZE,
      0
    );
    this.gl.vertexAttribPointer(
      pointColorLoc,
      3,
      this.gl.FLOAT,
      false,
      BUFFER_DATA_SINGLE_ELEMENT_SIZE * FLOAT_SIZE,
      3 * FLOAT_SIZE
    );

    this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
  }
}
