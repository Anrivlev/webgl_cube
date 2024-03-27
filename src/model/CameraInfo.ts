import { vec3 } from 'gl-matrix';

export interface CameraInfo {
  position: vec3;
  front: vec3;
  up: vec3;
  zoom: number;
}
