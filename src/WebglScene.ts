import { mat4, vec3 } from 'gl-matrix';
import { ViewportInfo } from './model/ViewportInfo';
import { CameraInfo } from './model/CameraInfo';

export class WebglScene {
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram;

  constructor(
    canvas: HTMLCanvasElement,
    private vp: ViewportInfo,
    private camera: CameraInfo = {
      position: new Float32Array([0.0, 0.0, -2.5]),
      front: new Float32Array([0.0, 0.0, 1.0]),
      up: new Float32Array([0.0, 1.0, 0.0]),
      zoom: 1.0,
    }
  ) {
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

  public drawCube(): void {
    const bufferData = new Float32Array([
      -0.5, -0.5, -0.5, 0.2, 0.2, 0.2,
      //
      -0.5, -0.5, 0.5, 0.2, 0.2, 0.8,
      //
      -0.5, 0.5, -0.5, 0.2, 0.8, 0.2,
      //
      -0.5, 0.5, 0.5, 0.2, 0.8, 0.8,
      //
      0.5, -0.5, -0.5, 0.8, 0.2, 0.2,
      //
      0.5, -0.5, 0.5, 0.8, 0.2, 0.8,
      //
      0.5, 0.5, -0.5, 0.8, 0.8, 0.2,
      //
      0.5, 0.5, 0.5, 0.8, 0.8, 0.8,
      //
    ]);

    const indicesBufferData = new Uint8Array([
      // LEFT
      1, 2, 3,
      //
      0, 2, 1,
      // BOTTOM
      0, 1, 4,
      //
      1, 5, 4,
      // TOP
      2, 6, 3,
      //
      3, 6, 7,
      // BACK
      3, 5, 1,
      //
      3, 7, 5,
      // RIGHT
      4, 5, 6,
      //
      5, 7, 6,
      // FRONT
      0, 4, 2,
      //
      2, 4, 6,
    ]);
    const BUFFER_DATA_SINGLE_ELEMENT_SIZE = 7;
    const FLOAT_SIZE = 4;

    const pointPositionLoc = this.gl.getAttribLocation(this.program, 'aPosition');
    const pointColorLoc = this.gl.getAttribLocation(this.program, 'aColor');
    const WVPLoc = this.gl.getUniformLocation(this.program, 'WVP');
    const WVPm: mat4 = mat4.mul(
      mat4.create(),
      mat4.mul(mat4.create(), this.getProjectionMatrix(), this.getCameraViewMatrix()),
      mat4.fromRotation(mat4.create(), 0.0, new Float32Array([0.0, 1.0, 0.0]))
    );
    this.gl.uniformMatrix4fv(WVPLoc, false, WVPm, 0, 0);
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

    const indicesBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, indicesBufferData, this.gl.STATIC_DRAW);

    // this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
    // this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.drawElements(this.gl.TRIANGLES, 36, this.gl.UNSIGNED_BYTE, 0);
  }

  public getProjectionMatrix(): mat4 {
    const r = this.vp.width / this.vp.height;
    // const f = 1 / Math.tan(this.vp.fov / 2);
    // const a = (this.vp.far + this.vp.near) / (this.vp.far - this.vp.near);
    // const b = (2 * this.vp.far * this.vp.near) / (this.vp.far - this.vp.near);
    // return new Float32Array([f / r, 0.0, 0.0, 0.0, 0.0, f, 0.0, 0.0, 0.0, 0.0, a, b, 0.0, 0.0, 1.0, 0.0]);
    return mat4.perspective(mat4.create(), this.vp.fov, r, this.vp.near, this.vp.far);
  }

  public getCameraViewMatrix(): mat4 {
    // const N = this.camera.front;
    // const V = this.camera.up;
    // const U = vec3.cross(vec3.create(), N, V);
    // return new Float32Array([
    //   U[0],
    //   U[1],
    //   U[2],
    //   vec3.dot(vec3.negate(vec3.create(), U), this.camera.position),
    //   V[0],
    //   V[1],
    //   V[2],
    //   vec3.dot(vec3.negate(vec3.create(), V), this.camera.position),
    //   N[0],
    //   N[1],
    //   N[2],
    //   vec3.dot(N, this.camera.position),
    //   0.0,
    //   0.0,
    //   0.0,
    //   1.0,
    // ]);
    return mat4.lookAt(
      mat4.create(),
      this.camera.position,
      vec3.add(vec3.create(), this.camera.position, this.camera.front),
      this.camera.up
    );
  }
}
