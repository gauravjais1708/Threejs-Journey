uniform float uTime;
uniform float uPositionFrequency;
uniform float uTimeFrequency;
uniform float uStrength;
uniform float uWarpPositionFrequency;
uniform float uWarpTimeFrequency;
uniform float uWarpStrength;

attribute vec4 tangent;

varying float vWobble;

#include ../includes/simplexNoise4d.glsl

float getWobble(vec3 position)
{
    vec3 warpedPosition = position;
    warpedPosition += simplexNoise4d(vec4(
        position * uWarpPositionFrequency,
        uTime * uWarpTimeFrequency
    )) * uWarpStrength;

    return simplexNoise4d(vec4(
        warpedPosition * uPositionFrequency,
        uTime * uTimeFrequency
    )) * uStrength;
}

void main()
{
    // csm_Position is the variable containing the vertex position in CustomShaderMaterial
    
    vec3 biTangent = cross(normal, tangent.xyz);

    // Neighbours positions
    float shift = 0.01;
    vec3 positionA = csm_Position + tangent.xyz * shift;
    vec3 positionB = csm_Position + biTangent * shift;

    // Wobble
    float wobble = getWobble(csm_Position);
    float wobbleA = getWobble(positionA);
    float wobbleB = getWobble(positionB);
    
    // Apply wobble
    csm_Position += wobble * normal;
    positionA += wobbleA * normal;
    positionB += wobbleB * normal;
    
    // Compute normal
    vec3 toA = normalize(positionA - csm_Position);
    vec3 toB = normalize(positionB - csm_Position);
    csm_Normal = cross(toA, toB);

    vWobble = wobble / uStrength; // Normalize varying for fragment color
}
