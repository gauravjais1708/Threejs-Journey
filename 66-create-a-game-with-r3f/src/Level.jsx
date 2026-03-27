import * as THREE from 'three'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { useState, useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'
import useGame from './stores/useGame.jsx'

THREE.ColorManagement.legacyMode = false

const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
const floor1material = new THREE.MeshStandardMaterial({color:'#333333', metalness: 0, roughness: 0.1})
const floor2material = new THREE.MeshStandardMaterial({color:'#4a4a4a', metalness: 0, roughness: 0.1})
const obstacleMaterial = new THREE.MeshStandardMaterial({color:'#ff0055', roughness: 0.2, emissive: '#ff0055', emissiveIntensity: 1.5})
const wallMaterial = new THREE.MeshStandardMaterial({color:'#8877ff', roughness: 0.2, emissive: '#4433aa', emissiveIntensity: 0.5, transparent: true, opacity: 0.9})

const PortalMaterial = shaderMaterial(
    { uTime: 0, uColorStart: new THREE.Color('#220033'), uColorEnd: new THREE.Color('#ff0055') },
    `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    `uniform float uTime; uniform vec3 uColorStart; uniform vec3 uColorEnd; varying vec2 vUv;
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    float snoise(vec2 v){
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) ); vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1; i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1; i = mod(i, 289.0);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m ; m = m*m ;
        vec3 x = 2.0 * fract(p * C.www) - 1.0; vec3 h = abs(x) - 0.5; vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox; m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g; g.x  = a0.x  * x0.x  + h.x  * x0.y; g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
    }
    void main() {
        vec2 displacedUv = vUv + snoise(vUv * 5.0 + uTime * 0.5) * 0.1;
        float strength = snoise(displacedUv * 10.0 + uTime * 0.5);
        float dist = distance(vUv, vec2(0.5));
        float multiplier = smoothstep(0.5, 0.1, dist);
        vec3 color = mix(uColorStart, uColorEnd, strength + dist);
        gl_FragColor = vec4(color, multiplier);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
    }`
)
extend({ PortalMaterial })

export function BlockStart({position = [0, 0, 0]}) {
    return <group position={position} > 
        <mesh geometry={boxGeometry} material={floor1material} position={[0,-1 ,0]} scale={[4, 0.2, 4]} receiveShadow></mesh>
    </group>
}   

export function BlockSpinner({position = [0, 0, 0]}) {    
    const obstacle = useRef() 
    const [speed] = useState(() => (Math.random() * 0.2) + 1.1 * (Math.random() < 0.5 ? -1 : 1))
    const fail = useGame((state) => state.fail)
    
    useFrame((state) => {
        const time = state.clock.getElapsedTime()
        const rotation = new THREE.Euler(0, time * (speed * 0.5), 0)
        const quaternion = new THREE.Quaternion()
        quaternion.setFromEuler(rotation)
        obstacle.current.setNextKinematicRotation(quaternion)
    })

    return <group position={position} > 
        <mesh geometry={boxGeometry} material={floor2material} position={[0,-1 ,0]} scale={[4, 0.2, 4]} receiveShadow></mesh>
       <RigidBody ref={obstacle} type="kinematicPosition" position={[0,0.3,0]} restitution={0.2} friction={0} onCollisionEnter={(e) => { if(e.other.rigidBodyObject?.name === 'player') fail() }}>
         <mesh geometry={boxGeometry} material={obstacleMaterial} position={[0,-0.7,0]} scale={[3.5, .3, .3]} receiveShadow castShadow></mesh>
       </RigidBody>
    </group>
}   

export function BlockLimbo({position = [0, 0, 0]}) {    
    const obstacle = useRef() 
    const [timeoffset] = useState(() => Math.random() * Math.PI * 2)
    const fail = useGame((state) => state.fail)
    
    useFrame((state) => {
        const time = state.clock.getElapsedTime()
        const y = Math.sin(time * 0.6 + timeoffset) + 1.15
        obstacle.current.setNextKinematicTranslation({ x: position[0], y: y, z: position[2] })
    })

    return <group position={position} > 
        <mesh geometry={boxGeometry} material={floor2material} position={[0,-1 ,0]} scale={[4, 0.2, 4]} receiveShadow></mesh>
       <RigidBody ref={obstacle} type="kinematicPosition" position={[0,0.3,0]} restitution={0.2} friction={0} onCollisionEnter={(e) => { if(e.other.rigidBodyObject?.name === 'player') fail() }}>
         <mesh geometry={boxGeometry} material={obstacleMaterial} position={[0,-0.7,0]} scale={[3.5, .3, .3]} receiveShadow castShadow></mesh>
       </RigidBody>
    </group>
}   

export function BlockAxe({position = [0, 0, 0]}) {    
    const obstacle = useRef() 
    const [timeoffset] = useState(() => Math.random() * Math.PI * 2)
    const fail = useGame((state) => state.fail)
    
    useFrame((state) => {
        const time = state.clock.getElapsedTime()
        const x = Math.sin(time * 0.6 + timeoffset) * 1.25
        obstacle.current.setNextKinematicTranslation({ x: x, y: position[1]+0.55, z: position[2] })
    })

    return <group position={position} > 
        <mesh geometry={boxGeometry} material={floor2material} position={[0,-1 ,0]} scale={[4, 0.2, 4]} receiveShadow></mesh>
       <RigidBody ref={obstacle} type="kinematicPosition" position={[0,0.3,0]} restitution={0.2} friction={0} onCollisionEnter={(e) => { if(e.other.rigidBodyObject?.name === 'player') fail() }}>
         <mesh geometry={boxGeometry} material={obstacleMaterial} position={[0,-0.7,0]} scale={[1.5, 1.5, .3]} receiveShadow castShadow></mesh>
       </RigidBody>
    </group>
}   

export function BlockEnd({position = [0, 0, 0]}) {
    const materialRef = useRef()
    
    useFrame((state, delta) => {
        if (materialRef.current) materialRef.current.uTime += delta
    })

    return <group position={position} > 
        <mesh geometry={boxGeometry} material={floor1material} position={[0,-0.8 ,0]} scale={[4, 0.2, 4]} receiveShadow></mesh>
        <RigidBody type="fixed" colliders='hull' restitution={0.2} friction={0} position={[0,0.25,0]}/> 
        <mesh position={[0, 0.5, 0]}>
            <circleGeometry args={[1, 32]} />
            <portalMaterial ref={materialRef} transparent side={THREE.DoubleSide} />
        </mesh>
    </group>
}  

export function Bounds({length=1}) {
    return <>
     <RigidBody type='fixed' restitution={0.2} friction={0}>
         <mesh geometry={boxGeometry} material={wallMaterial} position={[2.15, 0.5, (length * -0.2 )+ 2]} scale={[0.3, 3, length * 4]} castShadow />
         <mesh geometry={boxGeometry} material={wallMaterial} position={[-2.15, 0.5, (length * -0.2 )+ 2]} scale={[0.3, 3, length * 4]} receiveShadow />
         <mesh geometry={boxGeometry} material={wallMaterial} position={[0, 0.5, (length * -1.9)+ 0.2]} scale={[4, 3, 0.3]} receiveShadow />
         <CuboidCollider args={[ 2, 0.1, 2*length ]} position={[0, -1, -(length * -1.9)-13]} restitution={0.2} friction={1}/>
     </RigidBody>
    </>
}

export function Level({types = [BlockSpinner, BlockLimbo, BlockAxe] }) {
    const blocksCount = useGame((state) => state.blocksCount)
    const blocksSeed = useGame((state) => state.blocksSeed)

    const blocks = useMemo(() => {
        const blocks = []
        for(let i=0; i< blocksCount; i++) {
            const type = types[Math.floor(Math.random() * types.length)]
            blocks.push(type)
        }
        return blocks
    }, [blocksCount, types, blocksSeed])

    return <>
        <BlockStart position={[0,0,12]}/>
        {blocks.map((Block, index) => <Block key={index} position={[0,0,12 - (index + 1) * 4]} />)}
        <BlockEnd position={[0,0,12 - (blocksCount + 1) * 4]}/>
        <Bounds length={blocksCount + 2}/>
    </>
}