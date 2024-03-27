#version 300 es

in vec3 aPosition;
in vec3 aColor;
in vec2 aTexCoord;

out vec3 vColor;
out vec2 vTexCoord;

uniform mat4 WVP;

void main() {
    gl_Position = WVP * vec4(aPosition, 1.0f);
    vColor = aColor;
    vTexCoord = aTexCoord;
}