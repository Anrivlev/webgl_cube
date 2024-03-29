#version 300 es

precision mediump float;
precision mediump sampler2DArray;

uniform sampler2DArray uSampler;
// uniform sampler2D uSampler;

in vec4 vColor;
in vec2 vTexCoord;
in float vTexId;

out vec4 fragColor;

void main() {
    fragColor = vColor * texture(uSampler, vec3(vTexCoord, vTexId));
}