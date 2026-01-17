varying vec2 vUv;

void main()
{   //pattern1 
    // gl_FragColor = vec4(vUv, 1.0, 1.0);
    // pattern2
    // gl_FragColor = vec4(vUv, 0.5, 1.0);
    //pattern 3
    // float strength = 1.0 - vUv.y;
    // float strength = mod(vUv.y, 0.2);
    // gl_FragColor = vec4(strength, strength, strength, 1.0);
    // pattern 4
    // float strength =  vUv.y* 10.0 ;
    //pattern 8
    // float strength = mod(vUv.y*10.0, 1.0);
    //pattern 9
    // float strength = mod(vUv.y*10.0, 1.0);
    // strength = step(0.8, strength);
    //pattern 10
    // float strength = mod(vUv.x*10.0, 1.0);
    // strength = step(0.8, strength);
    //pattern 11
    // float strength = step(0.8, mod(vUv.x*10.0, 1.0));
    // strength+= step(0.8, mod(vUv.y*10.0, 1.0));
    //pattern 12
    // float strength = step(0.8, mod(vUv.x*10.0, 1.0));
    // strength*= step(0.8, mod(vUv.y*10.0, 1.0));
    //pattern 13
    // float strength = step(0.4, mod(vUv.x*10.0, 1.0));
    // strength*= step(0.8, mod(vUv.y*10.0, 1.0));
    //pattern 14
    // float barX = step(0.4, mod(vUv.x*10.0, 1.0));
    // barX*= step(0.8, mod(vUv.y*10.0, 1.0));
    // float barY = step(0.8, mod(vUv.x*10.0, 1.0));
    // barY*= step(0.4, mod(vUv.y*10.0, 1.0));
    // float strength = barX+barY;
    //pattern 15
    
    float barX = step(0.8, mod(vUv.x*10.0, 1.0));
    barX*= step(0.8, mod(vUv.y*10.0, 1.0));
    float barY = step(0.8, mod(vUv.x*10.0, 1.0));
    barY*= step(0.8, mod(vUv.y*10.0, 1.0));
    float strength = barX+barY;


    gl_FragColor = vec4(strength, strength, strength, 1.0);

    
    

}