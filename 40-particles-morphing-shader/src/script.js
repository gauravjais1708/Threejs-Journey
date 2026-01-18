import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import GUI from 'lil-gui'
import gsap from 'gsap'
import particlesVertexShader from './shaders/particles/vertex.glsl'
import particlesFragmentShader from './shaders/particles/fragment.glsl'

/**
 * Base
 */
// Debug
const gui = new GUI({ width: 340 })
const debugObject = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Loaders
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('./draco/')
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)

    // Materials
    if(particles.material)
        particles.material.uniforms.uResolution.value.set(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)

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
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 0, 8 * 2)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
})

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)

debugObject.clearColor = '#160920'
gui.addColor(debugObject, 'clearColor').onChange(() => { renderer.setClearColor(debugObject.clearColor) })
renderer.setClearColor(debugObject.clearColor)

/**
 * Particles
 */
const particles = {}
particles.index = 0

// Load models
gltfLoader.load('./models.glb', (gltf) =>
{
    particles.maxCount = 0
    const positions = []
    
    const children = gltf.scene.children
    
    for(const child of children)
    {
        if(child.isMesh)
        {
            positions.push(child.geometry.attributes.position.array)
            if(child.geometry.attributes.position.count > particles.maxCount)
                particles.maxCount = child.geometry.attributes.position.count
        }
    }

    particles.positions = positions
    
    // Geometry
    particles.geometry = new THREE.BufferGeometry()
    const positionArray = new Float32Array(particles.maxCount * 3)
    const positionTargetArray = new Float32Array(particles.maxCount * 3)
    const randomArray = new Float32Array(particles.maxCount)
    const sizeArray = new Float32Array(particles.maxCount)
    
    // Fill with first model
    for(let i = 0; i < particles.maxCount; i++)
    {
        const i3 = i * 3
        const originalArray = particles.positions[0] 
        const originalIndex = i % (originalArray.length / 3) 
        
        positionArray[i3    ] = originalArray[originalIndex * 3    ]
        positionArray[i3 + 1] = originalArray[originalIndex * 3 + 1]
        positionArray[i3 + 2] = originalArray[originalIndex * 3 + 2]

        positionTargetArray[i3    ] = positionArray[i3    ]
        positionTargetArray[i3 + 1] = positionArray[i3 + 1]
        positionTargetArray[i3 + 2] = positionArray[i3 + 2]
        
        // Randomness for sci-fi look
        randomArray[i] = Math.random()
        sizeArray[i] = Math.random()
    }

    particles.geometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3))
    particles.geometry.setAttribute('aPositionTarget', new THREE.BufferAttribute(positionTargetArray, 3))
    particles.geometry.setAttribute('aRandom', new THREE.BufferAttribute(randomArray, 1))
    particles.geometry.setAttribute('aSize', new THREE.BufferAttribute(sizeArray, 1))

    // Material
    particles.colorA = '#00ffff'
    particles.colorB = '#ff00ff'
    
    particles.material = new THREE.ShaderMaterial({
        vertexShader: particlesVertexShader,
        fragmentShader: particlesFragmentShader,
        uniforms:
        {
            uSize: new THREE.Uniform(0.08), // Smaller particles
            uResolution: new THREE.Uniform(new THREE.Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)),
            uProgress: new THREE.Uniform(0),
            uColorA: new THREE.Uniform(new THREE.Color(particles.colorA)),
            uColorB: new THREE.Uniform(new THREE.Color(particles.colorB))
        },
        blending: THREE.AdditiveBlending,
        depthWrite: false
    })

    // Points
    particles.points = new THREE.Points(particles.geometry, particles.material)
    // Scale or center? The models are likely centered.
    // particles.points.frustumCulled = false // Just in case
    scene.add(particles.points)
    
    // Methods
    particles.morph = (index) =>
    {
        // Update attributes
        // Update attributes
        particles.geometry.attributes.position.array.set(particles.geometry.attributes.aPositionTarget.array)
        // We need to commit the data
        particles.geometry.attributes.position.needsUpdate = true
        
        // Pick new target
        const targetPositions = particles.positions[index]
        const targetArray = particles.geometry.attributes.aPositionTarget.array
        
        for(let i = 0; i < particles.maxCount; i++)
        {
            const i3 = i * 3
            const targetIndex = i % (targetPositions.length / 3)
            
            targetArray[i3    ] = targetPositions[targetIndex * 3    ]
            targetArray[i3 + 1] = targetPositions[targetIndex * 3 + 1]
            targetArray[i3 + 2] = targetPositions[targetIndex * 3 + 2]
        }
        
        particles.geometry.attributes.aPositionTarget.needsUpdate = true
        
        // Animate uProgress
        gsap.fromTo(particles.material.uniforms.uProgress, 
            { value: 0 },
            { value: 1, duration: particles.morphDuration, ease: 'linear' }
        )
        
        particles.index = index
    }
    
    particles.morph0 = () => particles.morph(0)
    particles.morph1 = () => particles.morph(1)
    particles.morph2 = () => particles.morph(2)
    particles.morph3 = () => particles.morph(3)
    
    // GUI
    gui.add(particles.material.uniforms.uProgress, 'value').min(0).max(1).step(0.001).name('uProgress').listen()
    gui.addColor(particles, 'colorA').onChange(() => { particles.material.uniforms.uColorA.value.set(particles.colorA) })
    gui.addColor(particles, 'colorB').onChange(() => { particles.material.uniforms.uColorB.value.set(particles.colorB) })
    
    gui.add(particles.material.uniforms.uSize, 'value').min(0).max(1).step(0.001).name('uSize')
    
    particles.morphDuration = 3.0
    gui.add(particles, 'morphDuration').min(0.2).max(10).step(0.1).name('Morph Speed (s)')
    
    gui.add(particles, 'morph0').name('Morph to 1')
    gui.add(particles, 'morph1').name('Morph to 2')
    gui.add(particles, 'morph2').name('Morph to 3')
    gui.add(particles, 'morph3').name('Morph to 4')

    // Initial morph (optional, just to set state)
    // particles.morph(0) 
})

/**
 * Animate
 */
const tick = () =>
{
    // Update controls
    controls.update()

    // Render normal scene
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()