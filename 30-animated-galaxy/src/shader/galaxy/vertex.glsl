 
 
uniform float uSize;
attribute float aScale;
varying vec3 vColor;
attribute vec3 aRandomness;
 uniform float uTime ;
void main()
        {
            //position
            vec4 modelPosition = modelMatrix * vec4(position, 1.0);

            ///spin 
            float angle = atan(modelPosition.x,modelPosition.z);
            float distanceTOCenter = length(modelPosition.xz);
            float angleOffset = (1.0/distanceTOCenter)*uTime;
            angle += angleOffset;
            modelPosition.x = cos(angle)*distanceTOCenter;
            modelPosition.z = sin(angle)*distanceTOCenter;
            
            //randomness
            modelPosition.x += aRandomness.x;
            modelPosition.y += aRandomness.y;
            modelPosition.z += aRandomness.z;



            vec4 viewPosition = viewMatrix * modelPosition;
            vec4 projectedPosition = projectionMatrix * viewPosition;
            gl_Position = projectedPosition;

            gl_PointSize = uSize * aScale ;
            gl_PointSize *=(1.0/-viewPosition.z);

            vColor = color;
        }