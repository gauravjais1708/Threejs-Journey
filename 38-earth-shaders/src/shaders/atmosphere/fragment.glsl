uniform vec3 uSunDirection;
uniform vec3 uAtmosphereColor;

varying vec3 vNormal;
varying vec3 vPosition;

void main()
{
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = uAtmosphereColor;

    // Atmosphere
    float atmosphereDayMix = dot(normal, uSunDirection);
    atmosphereDayMix = smoothstep(- 0.5, 1.0, atmosphereDayMix);

    float atmosphereEdgeMix = dot(viewDirection, - normal);
    atmosphereEdgeMix = smoothstep(0.0, 0.5, atmosphereEdgeMix);
    atmosphereEdgeMix = 1.0 - atmosphereEdgeMix;

    float alpha = atmosphereDayMix * atmosphereEdgeMix;

    // Final color
    gl_FragColor = vec4(color, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
