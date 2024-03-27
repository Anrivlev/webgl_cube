import vertexShaderSource from './shaders/shader.vs';
import fragmentShaderSource from './shaders/shader.fs';
// import styles from "./styles/styles.scss"

import { WebglScene } from './WebglScene';

const canvas = document.querySelector('canvas');
if (!canvas) throw new Error(`Нет html-элемента canvas`);

const webglScene = new WebglScene(canvas);
webglScene.addShader(vertexShaderSource, 'vertex');
webglScene.addShader(fragmentShaderSource, 'fragment');
webglScene.linkAndUseProgram();
webglScene.draw();
