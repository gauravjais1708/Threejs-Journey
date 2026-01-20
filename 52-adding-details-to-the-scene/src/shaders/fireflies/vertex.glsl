uniform float uPixelRatio;
uniform float uSize ;
attribute float aScale;
uniform float uTime;


void main()
{
    vec4 modelPosition = modelMatrix * vec4(position , 1.0 );
    modelPosition.y += sin(uTime *0.8 + modelPosition.x * 100.0) * aScale * 0.6;
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 ProjectionPosition = projectionMatrix * viewPosition ;
     
     gl_Position = ProjectionPosition;
     gl_PointSize = uSize * aScale * uPixelRatio ;
     gl_PointSize *= (1.0 / - viewPosition.z);
}