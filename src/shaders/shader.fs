#version 300 es

precision mediump float;
precision mediump sampler2DArray;

uniform sampler2DArray uSampler;
// uniform sampler2D uSampler;
uniform vec3 uLightPosition;

in vec4 vColor;
in vec2 vTexCoord;
in float vTexId;
in float vDiffuse;
in vec3 vNormal;
in vec3 vPosition;

out vec4 fragColor;

void main() {
    vec4 baseColor = vColor * texture(uSampler, vec3(vTexCoord, vTexId));

    // vec3 offset = uLightPosition - vPosition;
    // float distance = length(offset);
    // float attenuation = 2.0f / distance / distance;

    fragColor.rgb = baseColor.rgb * 0.1f + vDiffuse * baseColor.rgb * 0.9f;
    //  + attenuation * baseColor.rgb * 0.45f;
    // fragColor.a = vColor.w;
    fragColor.a = 1.0;

}