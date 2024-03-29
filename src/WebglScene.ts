import { mat4, vec3 } from 'gl-matrix';
import { ViewportInfo } from './model/ViewportInfo';
import { CameraInfo } from './model/CameraInfo';
import { CubeObject } from './model/CubeObject';
// import imageUrl from './resources/cube-texture.jpg';
import imageUrl from './resources/patternPack_tilesheet@2.png';
import { AttribLocations } from './model/AttribLocations';

export class WebglScene {
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram;
  private FLOAT_SIZE = 4;
  private cubeList: CubeObject[];
  private attribLocs?: AttribLocations;
  private WVPLoc: WebGLUniformLocation;

  constructor(
    canvas: HTMLCanvasElement,
    private vp: ViewportInfo,
    private camera: CameraInfo = {
      position: new Float32Array([0.0, 0.0, 2.5]),
      front: new Float32Array([0.0, 0.0, 1.0]),
      up: new Float32Array([0.0, 1.0, 0.0]),
      zoom: 1.0,
    }
  ) {
    this.cubeList = [];

    const gl = canvas.getContext('webgl2');
    if (!gl) throw new Error(`Не удалось создать контекст`);
    this.gl = gl;
    const program = gl.createProgram();
    if (!program) throw new Error(`Не удалось создать программу`);
    this.program = program;

    this.gl.enable(this.gl.CULL_FACE);
    this.gl.cullFace(this.gl.FRONT);

    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.gl.enable(gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    this.gl.clearColor(1.0, 1.0, 1.0, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
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

    this.attribLocs = {
      position: this.gl.getAttribLocation(this.program, 'aPosition'),
      color: this.gl.getAttribLocation(this.program, 'aColor'),
      texCoord: this.gl.getAttribLocation(this.program, 'aTexCoord'),
      texId: this.gl.getAttribLocation(this.program, 'aTexId'),
    };
    this.WVPLoc = this.gl.getUniformLocation(this.program, 'WVP');
  }

  // private textureSize = 16 / 512;
  // private textureOffset = 1 / 512 / 2;
  private textureSize = 1.0;
  private textureOffset = 0.0;

  private getCubeBufferData(texCoordU: number, texCoordV: number, texId: number, alpha = 1.0): Float32Array {
    return new Float32Array([
      -0.5,
      -0.5,
      -0.5,
      0.2,
      0.2,
      0.2,
      alpha,
      texCoordU * this.textureSize + 0.0 + this.textureOffset,
      texCoordV * this.textureSize + 0.0 + this.textureOffset,
      texId,
      //
      -0.5,
      -0.5,
      0.5,
      0.2,
      0.2,
      0.8,
      alpha,
      texCoordU * this.textureSize + 0.0 + this.textureOffset,
      texCoordV * this.textureSize + this.textureSize - this.textureOffset,
      texId,
      //
      -0.5,
      0.5,
      -0.5,
      0.2,
      0.8,
      0.2,
      alpha,
      texCoordU * this.textureSize + this.textureSize - this.textureOffset,
      texCoordV * this.textureSize + 0.0 + this.textureOffset,
      texId,
      //
      -0.5,
      0.5,
      0.5,
      0.2,
      0.8,
      0.8,
      alpha,
      texCoordU * this.textureSize + this.textureSize - this.textureOffset,
      texCoordV * this.textureSize + this.textureSize - this.textureOffset,
      texId,
      //
      0.5,
      -0.5,
      -0.5,
      0.8,
      0.2,
      0.2,
      alpha,
      texCoordU * this.textureSize + 0.0 + this.textureOffset,
      texCoordV * this.textureSize + this.textureSize - this.textureOffset,
      texId,
      //
      0.5,
      -0.5,
      0.5,
      0.8,
      0.2,
      0.8,
      alpha,
      texCoordU * this.textureSize + 0.0 + this.textureOffset,
      texCoordV * this.textureSize + 0.0 + this.textureOffset,
      texId,
      //
      0.5,
      0.5,
      -0.5,
      0.8,
      0.8,
      0.2,
      alpha,
      texCoordU * this.textureSize + this.textureSize - this.textureOffset,
      texCoordV * this.textureSize + this.textureSize - this.textureOffset,
      texId,
      //
      0.5,
      0.5,
      0.5,
      0.8,
      0.8,
      0.8,
      alpha,
      texCoordU * this.textureSize + this.textureSize - this.textureOffset,
      texCoordV * this.textureSize + 0.0 + this.textureOffset,
      texId,
      //
    ]);
  }

  private getCubeIndicesData(): Uint8Array {
    return new Uint8Array([
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
  }

  public addCube(
    x: number,
    y: number,
    z: number,
    size: number,
    rotation: number,
    textureId: number,
    alpha?: number,
    rotationSpeed?: number
  ) {
    const bufferData = this.getCubeBufferData(0.0, 1.0, textureId, alpha);
    const indicesBufferData = this.getCubeIndicesData();
    const BUFFER_DATA_SINGLE_ELEMENT_SIZE = 10;

    const vao = this.gl.createVertexArray();
    this.gl.bindVertexArray(vao);

    const buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, bufferData, this.gl.STATIC_DRAW);

    const indicesBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, indicesBufferData, this.gl.STATIC_DRAW);

    this.gl.vertexAttribPointer(
      this.attribLocs.position,
      3,
      this.gl.FLOAT,
      false,
      BUFFER_DATA_SINGLE_ELEMENT_SIZE * this.FLOAT_SIZE,
      0
    );
    this.gl.vertexAttribPointer(
      this.attribLocs.color,
      4,
      this.gl.FLOAT,
      false,
      BUFFER_DATA_SINGLE_ELEMENT_SIZE * this.FLOAT_SIZE,
      3 * this.FLOAT_SIZE
    );
    this.gl.vertexAttribPointer(
      this.attribLocs.texCoord,
      2,
      this.gl.FLOAT,
      false,
      BUFFER_DATA_SINGLE_ELEMENT_SIZE * this.FLOAT_SIZE,
      7 * this.FLOAT_SIZE
    );
    this.gl.vertexAttribPointer(
      this.attribLocs.texId,
      1,
      this.gl.FLOAT,
      false,
      BUFFER_DATA_SINGLE_ELEMENT_SIZE * this.FLOAT_SIZE,
      9 * this.FLOAT_SIZE
    );
    this.gl.enableVertexAttribArray(this.attribLocs.position);
    this.gl.enableVertexAttribArray(this.attribLocs.color);
    this.gl.enableVertexAttribArray(this.attribLocs.texCoord);
    this.gl.enableVertexAttribArray(this.attribLocs.texId);
    this.gl.bindVertexArray(null);
    this.cubeList.push({
      vao: vao,
      position: new Float32Array([x, y, z]),
      size: size,
      rotation: rotation,
      speedRotation: rotationSpeed ?? this.getRandomArbitrary(-0.05, 0.05),
    });
  }

  private getRandomArbitrary(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  public addNCubedCubesAtOrigin(n: number, gap: number, size: number) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        for (let k = 0; k < n; k++) {
          this.addCube(
            -n / 2 + i * gap,
            -n / 2 + j * gap,
            -n / 2 + k * gap,
            size,
            0.0,
            (i * n ** 2 + j * n + k) % (7 * 12),
            0.7
          );
        }
      }
    }
  }

  private getZprojection(position: vec3): number {
    return vec3.dot(vec3.sub(vec3.create(), position, this.camera.position), this.camera.front);
  }

  private insertionSort<T>(list: T[], compare: (a: T, b: T) => number): void {
    for (let i = 1; i < list.length; i++) {
      let j = i - 1;
      const curr = list[i];
      while (j > -1 && compare(curr, list[j]) < 0) {
        console.log('swapped');
        list[j + 1] = list[j];
        j--;
      }
      list[j + 1] = curr;
    }
  }

  private sortCubes(): void {
    // Сортировать нужно по расстоянию от камеры...... вдоль оси перпендикулярной плоскости вьюпорта.
    // + Нужно сортировать вставками, а не быстрой сортировкой
    this.insertionSort(this.cubeList, (a, b) => this.getZprojection(a.position) - this.getZprojection(b.position));
    // this.cubeList.sort((a, b) => this.getZprojection(b.position) - this.getZprojection(a.position));
  }

  public startLoop(): void {
    const image = new Image();
    image.src = imageUrl;
    // image.onload = () => this.setTextureSimple(image);
    image.onload = () => this.setTexture(image, 512);

    this.draw();
  }

  private convertImageToArray(image: HTMLImageElement): Uint8ClampedArray {
    const { width, height } = image;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0);
    return context.getImageData(0, 0, width, height).data;
  }

  private setTexture(image: HTMLImageElement, tileSize: number): void {
    const rowCount = Math.floor(image.height / tileSize);
    const columnCount = Math.floor(image.width / tileSize);
    const tileCount = rowCount * columnCount;
    const imageData = this.convertImageToArray(image);
    const texture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D_ARRAY, texture);
    this.gl.texStorage3D(this.gl.TEXTURE_2D_ARRAY, 1, this.gl.RGBA8, tileSize, tileSize, tileCount);
    const pbo = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.PIXEL_UNPACK_BUFFER, pbo);
    this.gl.bufferData(this.gl.PIXEL_UNPACK_BUFFER, imageData, this.gl.STATIC_DRAW);
    this.gl.pixelStorei(this.gl.UNPACK_ROW_LENGTH, image.width);
    this.gl.pixelStorei(this.gl.UNPACK_IMAGE_HEIGHT, image.height);

    this.gl.texParameteri(this.gl.TEXTURE_2D_ARRAY, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D_ARRAY, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
    this.gl.generateMipmap(this.gl.TEXTURE_2D_ARRAY);

    for (let i = 0; i < rowCount; i++) {
      for (let j = 0; j < columnCount; j++) {
        this.gl.pixelStorei(this.gl.UNPACK_SKIP_PIXELS, j * tileSize);
        this.gl.pixelStorei(this.gl.UNPACK_SKIP_ROWS, i * tileSize);
        this.gl.texSubImage3D(
          this.gl.TEXTURE_2D_ARRAY,
          0,
          0,
          0,
          i * columnCount + j,
          tileSize,
          tileSize,
          1,
          this.gl.RGBA,
          this.gl.UNSIGNED_BYTE,
          0
        );
      }
    }
  }

  private setTextureSimple(image: HTMLImageElement): void {
    const texture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGB,
      image.width,
      image.height,
      0,
      this.gl.RGB,
      this.gl.UNSIGNED_BYTE,
      image
    );
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
    this.gl.generateMipmap(this.gl.TEXTURE_2D);
  }

  private getTransformMatrix(scale: number, translation: vec3, angle: number): mat4 {
    let out = mat4.fromRotation(mat4.create(), angle, new Float32Array([0.0, 1.0, 0.0]));
    out = mat4.mul(mat4.create(), mat4.fromScaling(mat4.create(), new Float32Array([scale, scale, scale])), out);
    out = mat4.mul(mat4.create(), mat4.fromTranslation(mat4.create(), translation), out);
    return out;
  }

  private draw(): void {
    this.sortCubes();
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    for (const cube of this.cubeList) {
      cube.rotation += cube.speedRotation;
      this.gl.bindVertexArray(cube.vao);
      const WVPm: mat4 = mat4.mul(
        mat4.create(),
        mat4.mul(mat4.create(), this.getProjectionMatrix(), this.getCameraViewMatrix()),
        this.getTransformMatrix(cube.size, cube.position, cube.rotation)
      );
      this.gl.uniformMatrix4fv(this.WVPLoc, false, WVPm, 0, 0);

      this.gl.drawElements(this.gl.TRIANGLES, 36, this.gl.UNSIGNED_BYTE, 0);
      this.gl.bindVertexArray(null);
    }
    setTimeout(() => this.draw(), 1000 / 60);
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
      new Float32Array([0.0, 0.0, 0.0]),
      // vec3.add(vec3.create(), this.camera.position, this.camera.front),
      this.camera.up
    );
  }
}
