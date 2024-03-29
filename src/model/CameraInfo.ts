import { vec3 } from 'gl-matrix';

export interface CameraInfo {
  // Первичные атрибуты камеры.
  // Задают положение камеры в пространстве.
  center: vec3;
  zoom: number;
  phi: number;
  theta: number;
  // Два атрибута нужных для ограничения движений камеры
  minTheta: number;
  maxTheta: number;
  // Вторичные атрибуты камеры. Вручную НЕ устнавливать!
  // Вычисляются на основе первичных, нужны для уменьшения количества вычислений.
  position: vec3;
  up: vec3;
  front: vec3;
  right: vec3;
}
