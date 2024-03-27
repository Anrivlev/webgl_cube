#version 300 es

in vec3 aPosition;
in vec3 aColor;

out vec3 vColor;

uniform mat4 WVP;

void main() {
    gl_Position = WVP * vec4(aPosition, 1.0f);
    vColor = aColor;
}