#version 300 es

in vec3 aPosition;
in vec4 aColor;
in vec2 aTexCoord;
in float aTexId;
in vec3 aNormal;

out vec4 vColor;
out vec2 vTexCoord;
out float vTexId;
out float vBrightness;

uniform mat4 WVP;
uniform vec3 uLightDirection;

void main() {
    gl_Position = WVP * vec4(aPosition, 1.0f);
    vColor = aColor;
    vTexCoord = aTexCoord;
    vTexId = aTexId;
    vBrightness = max(dot(uLightDirection, aNormal), 0.0f);
}