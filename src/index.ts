import vertexShaderSource from "./shaders/shader.vs";
import fragmentShaderSource from "./shaders/shader.fs";
// import styles from "./styles/styles.scss"

let pointSize = 20.0;
const bufferData = new Float32Array([
  0, 0, 0, 100, 1, 0, 0,
  //
  0.5, 0.5, 0, 50, 0, 1, 0,
  //
  -0.6, 0.3, 0, 50, 0, 1, 1,
  //
  -0.8, -0.8, 0, 25, 0.5, 0.5, 0,
  //
]);
const BUFFER_DATA_SINGLE_ELEMENT_SIZE = 7;
const FLOAT_SIZE = 4;

function addShader(
  shaderSource: string,
  shaderType: number,
  context: WebGL2RenderingContext,
  program: WebGLProgram
): WebGLShader {
  const shader = context.createShader(shaderType);
  if (!shader) throw new Error(`Не удалось создать шейдер`);
  context.shaderSource(shader, shaderSource);
  context.compileShader(shader);
  context.attachShader(program, shader);
  return shader;
}

const canvas = document.querySelector("canvas");
if (!canvas) throw new Error(`Нет html-элемента canvas`);
const gl = canvas.getContext("webgl2");
if (!gl) throw new Error(`Не удалось создать контекст`);
const program = gl.createProgram();
if (!program) throw new Error(`Не удалось создать программу`);

const vertexShader = addShader(vertexShaderSource, gl.VERTEX_SHADER, gl, program);
const fragmentShader = addShader(fragmentShaderSource, gl.FRAGMENT_SHADER, gl, program);

gl.linkProgram(program);
gl.useProgram(program);

const pointPositionLoc = gl.getAttribLocation(program, "aPosition");
const pointSizeLoc = gl.getAttribLocation(program, "aPointSize");
const pointColorLoc = gl.getAttribLocation(program, "aColor");
gl.enableVertexAttribArray(pointPositionLoc);
gl.enableVertexAttribArray(pointSizeLoc);
gl.enableVertexAttribArray(pointColorLoc);

const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, bufferData, gl.STATIC_DRAW);

gl.vertexAttribPointer(pointPositionLoc, 3, gl.FLOAT, false, BUFFER_DATA_SINGLE_ELEMENT_SIZE * FLOAT_SIZE, 0);
gl.vertexAttribPointer(pointSizeLoc, 1, gl.FLOAT, false, BUFFER_DATA_SINGLE_ELEMENT_SIZE * FLOAT_SIZE, 3 * FLOAT_SIZE);
gl.vertexAttribPointer(pointColorLoc, 3, gl.FLOAT, false, BUFFER_DATA_SINGLE_ELEMENT_SIZE * FLOAT_SIZE, 4 * FLOAT_SIZE);

console.log(gl.getParameter(gl.MAX_VERTEX_ATTRIBS));

gl.drawArrays(gl.TRIANGLES, 0, 3);
