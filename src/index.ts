import vertexShaderSource from "./shaders/shader.vs";
import fragmentShaderSource from "./shaders/shader.fs";
// import styles from "./styles/styles.scss"

let pointSize = 20.0;

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

function renderCallback(context: WebGL2RenderingContext, pointSizeLocation: WebGLUniformLocation): void {
  pointSize += 0.1;
  context.uniform1f(pointSizeLocation, pointSize);
  context.drawArrays(gl.POINTS, 0, 1);
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
const pointSizeLocation = gl.getUniformLocation(program, "pointSize");

gl.useProgram(program);

setInterval(() => renderCallback(gl, pointSizeLocation), 20);
