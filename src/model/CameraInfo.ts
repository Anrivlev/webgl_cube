import { vec3 } from 'gl-matrix';

export interface CameraInfo {
  center: vec3;
  
  zoom: number;
  phi: number,
  theta: number,

  position: vec3,
  up: vec3,
  front: vec3,
}
