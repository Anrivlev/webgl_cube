#version 300 es

precision mediump float;
precision mediump sampler2DArray;

uniform sampler2DArray uSampler;
// uniform sampler2D uSampler;

in vec4 vColor;
in vec2 vTexCoord;
in float vTexId;
in float vBrightness;

out vec4 fragColor;

void main() {
    vec4 baseColor = vColor * texture(uSampler, vec3(vTexCoord, vTexId));
    fragColor = baseColor * 0.2f + vBrightness * baseColor * 0.8f;
    fragColor.a = vColor.w;
}