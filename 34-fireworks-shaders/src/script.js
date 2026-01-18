import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import GUI from 'lil-gui'
import fireworkVertexShader from './shaders/firework/vertex.glsl'
import fireworkFragmentShader from './shaders/firework/fragment.glsl'
import gsap from 'gsap'

/**
 * Base
 */
// Debug
const gui = new GUI({ width: 340 })

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Loaders
const textureLoader = new THREE.TextureLoader()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
}
const resolution = new THREE.Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)
    resolution.set(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(sizes.pixelRatio)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 100)
camera.position.set(1.5, 0, 6)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)

/**
 * Fireworks
 */
const textures = [
    textureLoader.load('./particles/1.png'),
    textureLoader.load('./particles/2.png'),
    textureLoader.load('./particles/3.png'),
    textureLoader.load('./particles/4.png'),
    textureLoader.load('./particles/5.png'),
    textureLoader.load('./particles/6.png'),
    textureLoader.load('./particles/7.png'),
    textureLoader.load('./particles/8.png')
]

const fireworks = []

const createFirework = (count, position, size, texture, radius, color) =>
{
    // Geometry
    const positionsArray = new Float32Array(count * 3)
    const sizesArray = new Float32Array(count)
    const timeMultipliersArray = new Float32Array(count)

    for(let i = 0; i < count; i++)
    {
        const i3 = i * 3

        const spherical = new THREE.Spherical(
            radius * (0.75 + Math.random() * 0.25),
            Math.random() * Math.PI,
            Math.random() * Math.PI * 2
        )
        const position = new THREE.Vector3()
        position.setFromSpherical(spherical)

        positionsArray[i3    ] = position.x
        positionsArray[i3 + 1] = position.y
        positionsArray[i3 + 2] = position.z

        sizesArray[i] = Math.random()
        timeMultipliersArray[i] = 1 + Math.random()
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positionsArray, 3))
    geometry.setAttribute('aScale', new THREE.Float32BufferAttribute(sizesArray, 1))

    // Material
    texture.flipY = false
    const material = new THREE.ShaderMaterial({
        vertexShader: fireworkVertexShader,
        fragmentShader: fireworkFragmentShader,
        uniforms:
        {
            uSize: { value: size },
            uResolution: { value: resolution },
            uTexture: { value: texture },
            uColor: { value: color },
            uTime: { value: 0 }
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    })

    // Points
    const firework = new THREE.Points(geometry, material)
    firework.position.copy(position)
    scene.add(firework)

    // Destroy
    const destroy = () =>
    {
        scene.remove(firework)
        geometry.dispose()
        material.dispose()
    }

    // Animate
    // Using gsap to tween the uTime uniform could be an option, but manual tick update gives more control if needed.
    // However, managing the array is needed for the vertex shader uTime logic.
    
    fireworks.push({ firework, material, destroy, created: performance.now() })
}

const createRandomFirework = () => 
{
    const count = Math.round(400 + Math.random() * 1000)
    const position = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        Math.random(),
        (Math.random() - 0.5) * 2
    )
    const size = 0.1 + Math.random() * 0.1
    const texture = textures[Math.floor(Math.random() * textures.length)]
    const radius = 0.5 + Math.random()
    const color = new THREE.Color()
    color.setHSL(Math.random(), 1, 0.7)
    
    createFirework(count, position, size, texture, radius, color)
}

// Click event
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

window.addEventListener('click', (event) =>
{
    mouse.x = (event.clientX / sizes.width) * 2 - 1
    mouse.y = - (event.clientY / sizes.height) * 2 + 1
    
    // We don't have a background plane to raycast against, so simple random click or projected?
    // Let's create a random firework on click for now, OR better, raycast to Z=0?
    // The user instruction "create fireworks whenever the user clicks on the screen" usually implies interactivity.
    // Let's spawn it at the mouse direction, at a fixed distance from camera?
    // Or just "createRandomFirework" which positions randomly, but trigger it on click.
    // Let's do a targeted spawn for extra flair.
    
    raycaster.setFromCamera(mouse, camera)
    
    // Calculate a point in front of the camera
    const distance = 8 // arbitrary distance
    const position = new THREE.Vector3()
    raycaster.ray.at(distance, position)
    
    const count = Math.round(400 + Math.random() * 1000)
    const size = 0.1 + Math.random() * 0.1
    const texture = textures[Math.floor(Math.random() * textures.length)]
    const radius = 0.5 + Math.random()
    const color = new THREE.Color()
    color.setHSL(Math.random(), 1, 0.7)
    
    createFirework(count, position, size, texture, radius, color)
})

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update fireworks
    for(let i = 0; i < fireworks.length; i++)
    {
        const firework = fireworks[i]
        
        // Manual time increment or based on creation time?
        // Let's rely on global clock vs creation time delta
        // But uTime in shader usually starts at 0.
        // So we need to track local time of firework.
        
        // We didn't store creation time relative to clock in a way to deduct yet.
        // Let's add a property to the object in the array.
        if(!firework.startTime) firework.startTime = elapsedTime
        
        const lifeTime = elapsedTime - firework.startTime
        firework.material.uniforms.uTime.value = lifeTime
        
        if(lifeTime > 2.0)
        {
            firework.destroy()
            fireworks.splice(i, 1)
            i--
        }
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()