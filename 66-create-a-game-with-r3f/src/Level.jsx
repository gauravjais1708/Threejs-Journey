import* as THREE from 'three'
import { RigidBody,CuboidCollider } from '@react-three/rapier'
import { useState, useRef ,useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
THREE.ColorManagement.legacyMode = false
const boxGeometry = new THREE.BoxGeometry(1,1,1)
const floor1material = new THREE.MeshStandardMaterial({color:'greenyellow'})
const floor2material = new THREE.MeshStandardMaterial({color:'darkgreen'})
const obstacleMaterial = new THREE.MeshStandardMaterial({color:'orangered'})
const wallMaterial = new THREE.MeshStandardMaterial({color:'slategrey'})



function BlockStart({position = [0, 0, 0]})
{
    return <group position={position} > 
        <mesh geometry={boxGeometry} position={[0,-1 ,0]} scale={[4, 0.2, 4]} receiveShadow>
       
        <meshStandardMaterial color="limegreen" />

    </mesh>
    
    </group>
}   
function BlockSpinner({position = [0, 0, 0]})
{    
    const obstacle = useRef() 
    const [speed] = useState(() => (Math.random() * 0.2) + 1.1 * (Math.random() < 0.5 ? -1 : 1))
    useFrame((state, delta) => {
    const time = state.clock.getElapsedTime()
    const rotation = new THREE.Euler(0, time * speed, 0)
    const quaternion = new THREE.Quaternion()
    quaternion.setFromEuler(rotation)
    obstacle.current.setNextKinematicRotation(quaternion)
})

    return <group position={position} > 
        <mesh geometry={boxGeometry} material={floor2material} position={[0,-1 ,0]} scale={[4, 0.2, 4]} receiveShadow></mesh>
       <RigidBody ref={obstacle} type="kinematicPosition" position={[0,0.3,0]} 
                 restitution={0.2}  friction={0}  >
         <mesh geometry={boxGeometry} material={obstacleMaterial} position={[0,-0.7,0]} scale={[3.5, .3, .3]} receiveShadow castShadow></mesh>
       </RigidBody>
    </group>
}   

export function BlockLimbo({position = [0, 0, 0]})
{    
    const obstacle = useRef() 
    const [timeoffset] = useState(() => Math.random() * Math.PI * 2)
    useFrame((state, delta) => {

    const time = state.clock.getElapsedTime()
   const y = Math.sin(time + timeoffset) + 1.15
    obstacle.current.setNextKinematicTranslation({ x: position[0], y: y, z: position[2] })
})

    return <group position={position} > 
        <mesh geometry={boxGeometry} material={floor2material} position={[0,-1 ,0]} scale={[4, 0.2, 4]} receiveShadow></mesh>
       <RigidBody ref={obstacle} type="kinematicPosition" position={[0,0.3,0]} 
                 restitution={0.2}  friction={0}  >
         <mesh geometry={boxGeometry} material={obstacleMaterial} position={[0,-0.7,0]} scale={[3.5, .3, .3]} receiveShadow castShadow></mesh>
       </RigidBody>
    </group>
}   
export function BlockAxe({position = [0, 0, 0]})
{    
    const obstacle = useRef() 
    const [timeoffset] = useState(() => Math.random() * Math.PI * 2)
    useFrame((state, delta) => {

    const time = state.clock.getElapsedTime()
   const x   = Math.sin(time * timeoffset) 
    obstacle.current.setNextKinematicTranslation({ x: x, y: position[1]+0.55, z: position[2] })
})

    return <group position={position} > 
        <mesh geometry={boxGeometry} material={floor2material} position={[0,-1 ,0]} scale={[4, 0.2, 4]} receiveShadow></mesh>
       <RigidBody ref={obstacle} type="kinematicPosition" position={[0,0.3,0]} 
                 restitution={0.2}  friction={0}  >
         <mesh geometry={boxGeometry} material={obstacleMaterial} position={[0,-0.7,0]} scale={[1.5, 1.5, .3]} receiveShadow castShadow></mesh>
       </RigidBody>
    </group>
}   
export function BlockEnd({position = [0, 0, 0]})

{   
    const hamburger = useGLTF('/hamburger.glb')
    hamburger.scene.traverse((child) => {
        child.castShadow = true
    })

    return <group position={position} > 
        <mesh geometry={boxGeometry}  material={floor1material} position={[0,-0.8 ,0]} scale={[4, 0.2, 4]} receiveShadow>
        </mesh>
        <RigidBody type="fixed" colliders='hull' restitution={0.2} friction={0} position={[0,0.25,0]}/> 
         <primitive object={hamburger.scene} position={[0,-0.8,0]} scale = {0.2} />
    
    </group>
}  

function Bounds({length=1})
{
    return <>
     <RigidBody type='fixed' restitution={0.2} friction={0}>
        <mesh geometry={boxGeometry} 
     material={wallMaterial} 
     position={[2.15, 0.5, (length * -0.2 )+ 2]} 
     scale={[0.3, 3, length * 4]} castShadow />
     <mesh geometry={boxGeometry} 
     material={wallMaterial} 
     position={[-2.15, 0.5, (length * -0.2 )+ 2]} 
     scale={[0.3, 3, length * 4]} receiveShadow 
     />
     <mesh geometry={boxGeometry} 
     material={wallMaterial} 
     position={[0, 0.5, (length * -1.9)+ 0.2]} 
     scale={[4, 3, 0.3]} receiveShadow 
     />
     <CuboidCollider args={[ 2, 0.1, 2*length ]}
      position={[0, -1, -(length * -1.9)-13]} 
      restitution={0.2} friction={1}/>
     </RigidBody>
    
    </>
}

export  function  Level({count = 5, types = [BlockSpinner, BlockLimbo, BlockAxe] })
{
        const blocks = useMemo(() => {
        const blocks = []
        for(let i=0; i< count; i++)
        {
            const type = types[Math.floor(Math.random() * types.length)]
            blocks.push(type)
        }

        return blocks
    }, [count, types])
    console.log(blocks)

    return <>
     
        <BlockStart position={[0,0,12]}/>
        {blocks.map((Block, index) => <Block key={index} position={[0,0,12 - (index + 1) * 4]} />)
        }
        <BlockEnd position={[0,0,12 - (count + 1) * 4]}/>
        <Bounds length ={count+2}/>
        
        


        {/* <BlockSpinner position={[0,0,8]}/>
        <BlockLimbo position={[0,0,4]}/>
        <BlockAxe position={[0,0,0]}/>
        <BlockEnd position={[0,0,-4]}/> */}
        

    </>

}