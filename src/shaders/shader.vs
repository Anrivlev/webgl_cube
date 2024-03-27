#version 300 es

in vec3 aPosition;
in vec3 aColor;

out vec3 vColor;

void main() {
    gl_Position = vec4(aPosition, 1.0f);
    vColor = aColor;
}