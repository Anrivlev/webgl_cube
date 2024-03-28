import { vec3 } from "gl-matrix";

export interface CubeObject {
  position: vec3;
  size: number;
  rotation: number,
  speedRotation: number,
  vao: WebGLVertexArrayObject,
}