export interface AttribAndUniformLocations {
  texId: number;
  position: number;
  color: number;
  texCoord: number;
  normal: number;
  WVP:WebGLUniformLocation;
  modelTransform: WebGLUniformLocation;
  lightDirection: WebGLUniformLocation;
  lightPosition: WebGLUniformLocation;
}
