import vertexShaderSource from './shaders/shader.vs';
import fragmentShaderSource from './shaders/shader.fs';
import './styles/styles.scss';

import { WebglScene } from './WebglScene';

const canvas = document.createElement('canvas');
if (!canvas) throw new Error(`Нет html-элемента canvas`);
const body = document.querySelector('body');
canvas.width = body.getBoundingClientRect().width;
canvas.height = body.getBoundingClientRect().height;
body.appendChild(canvas);

const webglScene = new WebglScene(canvas, {
  fov: 90,
  near: 0.1,
  far: 100,
});
webglScene.addShader(vertexShaderSource, 'vertex');
webglScene.addShader(fragmentShaderSource, 'fragment');
webglScene.linkAndUseProgram();
// webglScene.addPlayer(0.1, 74);
webglScene.addNCubedCubesAtOrigin(8, 1.5, 0.25);
webglScene.enableControls();
webglScene.startLoop();
