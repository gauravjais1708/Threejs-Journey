uniform float uTime;
uniform float uSize;
uniform vec2 uResolution;

attribute float aScale;

void main()
{
    vec3 newPosition = position;
    
    // Expansion (Linear)
    newPosition = position * uTime;
    
    // Gravity
    // 0.5 * g * t^2
    newPosition.y -= 0.5 * 1.0 * uTime * uTime;

    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

    // Size Scaling
    float size = uSize * aScale * uResolution.y;
    
    // Lifecycle: Grow fast, shrink slow
    float progress = uTime;
    
    // "Scale up even faster"
    float scaleIn = smoothstep(0.0, 0.1, uTime);
    
    // "Scale down"
    float scaleOut = 1.0 - smoothstep(0.5, 1.5, uTime); // Finishes by 1.5s
    
    // "Twinkle as they disappear"
    // Twinkle starts affecting more as scaleOut decreases
    float twinkle = sin(uTime * 30.0 + aScale * 100.0) * 0.5 + 0.5;
    float twinkleInfluence = smoothstep(0.5, 1.0, uTime);
    float currentScale = scaleIn * scaleOut;
    currentScale = mix(currentScale, currentScale * twinkle, twinkleInfluence);

    size *= currentScale;
    
    // Perspective attenuation
    size *= (1.0 / - viewPosition.z);

    gl_PointSize = size;

    if(gl_PointSize < 1.0)
        gl_Position = vec4(9999.9);
}
