 
 
varying vec3 vColor;
void main()
        {
            //disc
            // float strength = distance(gl_PointCoord,vec2(0.5));
            // strength =step(0.5,strength);
            // strength = 1.0 - strength;
            
            //diffuse pattern
            // float strength = distance(gl_PointCoord,vec2(0.5));
            // strength *= 2.0;
            // strength = 1.0 - strength;

            //lightpoint Pattern
            float strength = distance(gl_PointCoord,vec2(0.5));
            strength = 1.0 - strength;
            strength = pow(strength, 10.0);
            
            gl_FragColor = vec4(vColor, strength);
        }