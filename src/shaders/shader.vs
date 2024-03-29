#version 300 es

in vec3 aPosition;
in vec4 aColor;
in vec2 aTexCoord;
in float aTexId;

out vec4 vColor;
out vec2 vTexCoord;
out float vTexId;

uniform mat4 WVP;

void main() {
    gl_Position = WVP * vec4(aPosition, 1.0f);
    vColor = aColor;
    vTexCoord = aTexCoord;
    vTexId = aTexId;
}