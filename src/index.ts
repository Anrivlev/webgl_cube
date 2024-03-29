import vertexShaderSource from './shaders/shader.vs';
import fragmentShaderSource from './shaders/shader.fs';
import './styles/styles.scss';

import { WebglScene } from './WebglScene';

const canvas = document.createElement('canvas');
// const canvas = document.querySelector('canvas');
if (!canvas) throw new Error(`Нет html-элемента canvas`);
const body = document.querySelector('body');
canvas.width = body.getBoundingClientRect().width;
canvas.height = body.getBoundingClientRect().height;
body.appendChild(canvas);

const webglScene = new WebglScene(canvas, {
  width: canvas.width,
  height: canvas.height,
  fov: 90,
  near: 0.1,
  far: 100,
});
webglScene.addShader(vertexShaderSource, 'vertex');
webglScene.addShader(fragmentShaderSource, 'fragment');
webglScene.linkAndUseProgram();
webglScene.addNCubedCubesAtOrigin(6, 1.0, 0.25);
webglScene.startLoop();

document.addEventListener('keydown', event => webglScene.keyboardCallback(event));
