import vertexShaderSource from './shaders/shader.vs'
import fragmentShaderSource from './shaders/shader.fs'

const canvas = document.querySelector("canvas");
if (!canvas) throw new Error(`Нет html-элемента canvas`);
const gl = canvas.getContext("webgl2");
if (!gl) throw new Error(`Не удалось создать контекст`);
const program = gl.createProgram();
if (!program) throw new Error(`Не удалось создать программу`);

const vertexShader = gl.createShader(gl.VERTEX_SHADER);
if (!vertexShader) throw new Error(`Не удалось создать шейдер`);
gl.shaderSource(vertexShader, vertexShaderSource);
gl.compileShader(vertexShader);
gl.attachShader(program, vertexShader);

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
if (!vertexShader) throw new Error(`Не удалось создать шейдер`);
gl.shaderSource(fragmentShader, fragmentShaderSource);
gl.compileShader(fragmentShader);
gl.attachShader(program, fragmentShader);

gl.useProgram(program);
