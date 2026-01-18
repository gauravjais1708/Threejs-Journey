uniform float uTime;
uniform vec3 uColor;

varying vec3 vPosition;
varying vec3 vNormal;

void main()
{
    vec3 normal = normalize(vNormal);
    if(!gl_FrontFacing)
        normal *= - 1.0;
        
    // Stripes
    float stripes = mod((vPosition.y - uTime * 0.02) * 20.0, 1.0);
    stripes = pow(stripes, 3.0);
    
    // Fresnel
    vec3 viewDirection = normalize(cameraPosition - vPosition);
    float fresnel = dot(viewDirection, normal);
    fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
    fresnel = pow(fresnel, 2.0);
    
    // Falloff
    float holographic = stripes * fresnel;
    holographic += fresnel * 1.25;
    holographic *= 0.5;

    // Scifi scanline burst
    // Every few seconds, add a brighter scanline
    float brightness = 1.0;
    // ... maybe later
    
    gl_FragColor = vec4(uColor, holographic);
    
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
