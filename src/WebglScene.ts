import { mat4, vec3 } from 'gl-matrix';
import { ViewportInfo } from './model/ViewportInfo';
import { CameraInfo } from './model/CameraInfo';
import { CubeObject } from './model/CubeObject';
import imageUrl from './resources/patternPack_tilesheet@2.png';
import { AttribLocations } from './model/AttribLocations';
import { ControlSettings } from './model/ControlSettings';

export class WebglScene {
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram;
  private FLOAT_SIZE = 4;
  private cubeList: CubeObject[];
  private attribLocs?: AttribLocations;
  private WVPLoc: WebGLUniformLocation;
  private uLightDirectionLoc: WebGLUniformLocation;
  private lightDirection: vec3;
  private camera: CameraInfo;

  private mousePrevPosX: number | undefined;
  private mousePrevPosY: number | undefined;

  private player?: CubeObject;
  private controlSettings: ControlSettings;

  constructor(
    private canvas: HTMLCanvasElement,
    private vp: ViewportInfo,
    camera?: Partial<CameraInfo>,
    controlSettings?: Partial<ControlSettings>,
    lightDirection?: vec3
  ) {
    this.camera = {
      center: camera?.center ?? [0.0, 0.0, 0.0],
      phi: camera?.phi ?? 0.0,
      theta: camera?.theta ?? 20.0,
      zoom: camera?.zoom ?? 1.0,
      minTheta: camera?.minTheta ?? 0.0,
      maxTheta: camera?.maxTheta ?? 180.0,
      minZoom: camera?.minZoom ?? 0.5,
      maxZoom: camera?.maxZoom ?? 10.0,
      position: [0.0, 0.0, 0.0],
      front: [0.0, 0.0, 0.0],
      up: [0.0, 0.0, 0.0],
      left: [0.0, 0.0, 0.0],
    };
    this.updateCamera();
    this.lightDirection = lightDirection
      ? vec3.normalize(vec3.create(), lightDirection)
      : vec3.normalize(vec3.create(), [0.0, 0.2, 0.8]);

    this.cubeList = [];
    this.controlSettings = {
      mouseSensitivity: controlSettings?.mouseSensitivity ?? 0.25,
      wheelSensitivity: controlSettings?.wheelSensitivity ?? 0.005,
      moveSpeed: controlSettings?.moveSpeed ?? 0.04,
    };

    const gl = this.canvas.getContext('webgl2');
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

    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
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
    this.uLightDirectionLoc = this.gl.getUniformLocation(this.program, 'uLightDirectionLoc');
  }

  private getCubeBufferData(texId: number, color: vec3, alpha = 1.0): Float32Array {
    return new Float32Array([
      -0.5,
      -0.5,
      -0.5,
      color[0],
      color[1],
      color[2],
      alpha,
      0.0,
      1.0,
      texId,
      
      //
      -0.5,
      -0.5,
      0.5,
      color[0],
      color[1],
      color[2],
      alpha,
      1.0,
      1.0,
      texId,
      //
      -0.5,
      0.5,
      -0.5,
      color[0],
      color[1],
      color[2],
      alpha,
      0.0,
      0.0,
      texId,
      //
      -0.5,
      0.5,
      0.5,
      color[0],
      color[1],
      color[2],
      alpha,
      1.0,
      0.0,
      texId,
      //
      0.5,
      -0.5,
      -0.5,
      color[0],
      color[1],
      color[2],
      alpha,
      1.0,
      1.0,
      texId,
      //
      0.5,
      -0.5,
      0.5,
      color[0],
      color[1],
      color[2],
      alpha,
      0.0,
      1.0,
      texId,
      //
      0.5,
      0.5,
      -0.5,
      color[0],
      color[1],
      color[2],
      alpha,
      1.0,
      0.0,
      texId,
      //
      0.5,
      0.5,
      0.5,
      color[0],
      color[1],
      color[2],
      alpha,
      0.0,
      0.0,
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

  public addPlayer(size: number, textureId: number = 74) {
    this.player = {
      vao: this.getInitializedCubeVao(textureId, [1.0, 1.0, 1.0], 1.0),
      position: this.camera.center,
      size: size,
      rotation: 0.0,
      speedRotation: 0.0,
    };
  }

  private getInitializedCubeVao(textureId: number, color: vec3, alpha?: number): WebGLVertexArrayObject {
    const bufferData = this.getCubeBufferData(textureId, color, alpha);
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
    return vao;
  }

  public addCube(
    position: vec3,
    size: number,
    rotation: number,
    textureId: number,
    color: vec3,
    alpha?: number,
    rotationSpeed?: number
  ): void {
    this.cubeList.push({
      vao: this.getInitializedCubeVao(textureId, color, alpha),
      position: position,
      size: size,
      rotation: rotation,
      speedRotation: rotationSpeed ?? this.getRandomArbitrary(-0.05, 0.05),
    });
  }

  private getRandomArbitrary(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  public enableControls(): void {
    document.addEventListener('keydown', event => {
      this.keyboardInSpaceCallback(event);
    });
    document.addEventListener('mousedown', event => {
      this.mousedownCallback(event);
    });
    document.addEventListener('mouseup', event => {
      this.mouseupCallback(event);
    });
    document.addEventListener('mousemove', event => {
      this.mousemoveCallback(event);
    });
    document.addEventListener('wheel', event => {
      this.wheelCallback(event);
    });
  }

  private mousedownCallback(event: MouseEvent): void {
    this.mousePrevPosX = event.x;
    this.mousePrevPosY = event.y;
  }

  private mouseupCallback(event: MouseEvent): void {
    this.mousePrevPosX = undefined;
    this.mousePrevPosY = undefined;
  }

  private mousemoveCallback(event: MouseEvent): void {
    if (this.mousePrevPosX !== undefined && this.mousePrevPosY !== undefined) {
      const mousedx = event.x - this.mousePrevPosX;
      const mousedy = event.y - this.mousePrevPosY;
      this.mousePrevPosX = event.x;
      this.mousePrevPosY = event.y;

      if (mousedx !== 0) this.camera.phi += this.controlSettings.mouseSensitivity * mousedx;
      const newTheta = this.camera.theta - this.controlSettings.mouseSensitivity * mousedy;
      if (mousedy !== 0 && newTheta <= this.camera.maxTheta && newTheta >= this.camera.minTheta)
        this.camera.theta = newTheta;

      this.updateCamera();
    }
  }

  private wheelCallback(event: WheelEvent): void {
    const newZoom = this.camera.zoom + event.deltaY * this.controlSettings.wheelSensitivity;
    if (newZoom >= this.camera.minZoom && newZoom <= this.camera.maxZoom) this.camera.zoom = newZoom;
    this.updateCamera();
  }

  private updateCamera(): void {
    const sint = Math.sin((this.camera.theta * Math.PI) / 180.0);
    const cost = Math.cos((this.camera.theta * Math.PI) / 180.0);
    const sinp = Math.sin((this.camera.phi * Math.PI) / 180.0);
    const cosp = Math.cos((this.camera.phi * Math.PI) / 180.0);

    const x = this.camera.zoom * sint * cosp;
    const y = this.camera.zoom * cost;
    const z = this.camera.zoom * sint * sinp;
    this.camera.position = vec3.add(this.camera.position, this.camera.center, [x, y, z]);

    this.camera.front = vec3.normalize(this.camera.front, [-sint * cosp, -cost, -sint * sinp]);
    this.camera.up = vec3.normalize(this.camera.up, [-cost * cosp, sint, -cost * sinp]);
    this.camera.left = vec3.normalize(this.camera.left, [sinp, 0, -cosp]);
  }

  private keyboardCallback(event: KeyboardEvent): void {
    switch (event.key.toLowerCase()) {
      case 'w': {
        if (event.shiftKey) this.camera.center[1] += this.controlSettings.moveSpeed;
        else this.camera.center[2] += this.controlSettings.moveSpeed;
        this.updateCamera();
        break;
      }
      case 's': {
        if (event.shiftKey) this.camera.center[1] -= this.controlSettings.moveSpeed;
        else this.camera.center[2] -= this.controlSettings.moveSpeed;
        this.updateCamera();
        break;
      }
      case 'a': {
        this.camera.center[0] += this.controlSettings.moveSpeed;
        this.updateCamera();
        break;
      }
      case 'd': {
        this.camera.center[0] -= this.controlSettings.moveSpeed;
        this.updateCamera();
        break;
      }
    }
  }

  /**
   * Well...... it's worth playing with
   * @param event
   */
  private keyboardInSpaceCallback(event: KeyboardEvent): void {
    switch (event.key.toLowerCase()) {
      case 'w': {
        if (event.shiftKey)
          vec3.add(
            this.camera.center,
            this.camera.center,
            vec3.scale(vec3.create(), this.camera.up, this.controlSettings.moveSpeed)
          );
        else
          vec3.add(
            this.camera.center,
            this.camera.center,
            vec3.scale(vec3.create(), this.camera.front, this.controlSettings.moveSpeed)
          );
        this.updateCamera();
        break;
      }
      case 's': {
        if (event.shiftKey)
          vec3.add(
            this.camera.center,
            this.camera.center,
            vec3.scale(vec3.create(), this.camera.up, -this.controlSettings.moveSpeed)
          );
        else
          vec3.add(
            this.camera.center,
            this.camera.center,
            vec3.scale(vec3.create(), this.camera.front, -this.controlSettings.moveSpeed)
          );
        this.updateCamera();
        break;
      }
      case 'a': {
        vec3.add(
          this.camera.center,
          this.camera.center,
          vec3.scale(vec3.create(), this.camera.left, -this.controlSettings.moveSpeed)
        );
        this.updateCamera();
        break;
      }
      case 'd': {
        vec3.add(
          this.camera.center,
          this.camera.center,
          vec3.scale(vec3.create(), this.camera.left, this.controlSettings.moveSpeed)
        );
        this.updateCamera();
        break;
      }
    }
  }

  public addNCubedCubesAtOrigin(n: number, gap: number, size: number) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        for (let k = 0; k < n; k++) {
          this.addCube(
            [-n / 2 + i * gap, -n / 2 + j * gap, -n / 2 + k * gap],
            size,
            0.0,
            (i * n ** 2 + j * n + k) % (7 * 12),
            [this.getRandomArbitrary(0.0, 1.0), this.getRandomArbitrary(0.0, 1.0), this.getRandomArbitrary(0.0, 1.0)],
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
        list[j + 1] = list[j];
        j--;
      }
      list[j + 1] = curr;
    }
  }

  private sortCubes(): void {
    // Сортировать нужно по расстоянию от камеры...... вдоль оси перпендикулярной плоскости вьюпорта.
    // + Нужно сортировать вставками, а не быстрой сортировкой
    this.insertionSort(this.cubeList, (a, b) => this.getZprojection(b.position) - this.getZprojection(a.position));
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
    this.gl.uniform3fv(this.uLightDirectionLoc, this.lightDirection);
    if (this.player) {
      this.gl.bindVertexArray(this.player.vao);
      const WVPm: mat4 = mat4.mul(
        mat4.create(),
        mat4.mul(mat4.create(), this.getProjectionMatrix(), this.getCameraViewMatrix()),
        this.getTransformMatrix(this.player.size, this.player.position, this.player.rotation)
      );
      this.gl.uniformMatrix4fv(this.WVPLoc, false, WVPm, 0, 0);
      this.gl.drawElements(this.gl.TRIANGLES, 36, this.gl.UNSIGNED_BYTE, 0);
      this.gl.bindVertexArray(null);
    }
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
    window.requestAnimationFrame(this.draw.bind(this));
  }

  public getProjectionMatrix(): mat4 {
    const r = this.canvas.width / this.canvas.height;
    const f = 1 / Math.tan(this.vp.fov / 2);
    const a = (this.vp.far + this.vp.near) / (this.vp.far - this.vp.near);
    const b = (-2 * this.vp.far * this.vp.near) / (this.vp.far - this.vp.near);
    return mat4.transpose(mat4.create(), [
      f / r,
      0.0,
      0.0,
      0.0,
      0.0,
      f,
      0.0,
      0.0,
      0.0,
      0.0,
      -a,
      b,
      0.0,
      0.0,
      -1.0,
      0.0,
    ]);
  }

  public getCameraViewMatrix(): mat4 {
    const N = this.camera.front;
    const V = this.camera.up;
    const U = this.camera.left;
    return mat4.transpose(mat4.create(), [
      U[0],
      U[1],
      U[2],
      vec3.dot(vec3.negate(vec3.create(), U), this.camera.position),
      V[0],
      V[1],
      V[2],
      vec3.dot(vec3.negate(vec3.create(), V), this.camera.position),
      -N[0],
      -N[1],
      -N[2],
      vec3.dot(N, this.camera.position),
      0.0,
      0.0,
      0.0,
      1.0,
    ]);
  }
}
