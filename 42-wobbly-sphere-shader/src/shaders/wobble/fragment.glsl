uniform vec3 uColorA;
uniform vec3 uColorB;

varying float vWobble;

void main()
{
    // csm_DiffuseColor is the variable containing the base color in CustomShaderMaterial
    
    float mixing = smoothstep(-1.0, 1.0, vWobble);
    csm_DiffuseColor.rgb = mix(uColorA, uColorB, mixing); // Mix colors based on wobble height
}
