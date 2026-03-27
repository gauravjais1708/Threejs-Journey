import { OrbitControls } from '@react-three/drei'
import { Physics} from "@react-three/rapier"
import Lights from './Lights.jsx'
import { Level } from './Level.jsx'
import Player from './Player.jsx'
import { EffectComposer, Bloom } from '@react-three/postprocessing'

export default function Experience()
{
    return <>
        <color args={ [ '#000000' ] } attach="background" />
        <Physics debug={false}> 
            <Lights />
            <Level/>
            <Player />
        </Physics>

        <EffectComposer>
            <Bloom 
                luminanceThreshold={ 1.2 } 
                mipmapBlur 
                intensity={ 1.5 } 
            />
        </EffectComposer>
    </>
}