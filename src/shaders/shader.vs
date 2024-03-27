#version 300 es

uniform float pointSize;

void main() {
    gl_Position = vec4(0.5f, 0.5f, 0.0f, 1.0f);
    gl_PointSize = pointSize;
}