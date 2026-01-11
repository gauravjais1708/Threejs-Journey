import * as THREE from 'three'
import * as dat from 'dat-gui'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap'

//debug-ui
const gui = new dat.GUI()

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Object
 */
const geometry = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2)
const material = new THREE.MeshBasicMaterial({ color: '#ff0000' })
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)
//debug-ui
    gui.add(mesh.position, 'y').min(-3).max(3).step(0.01).name('cube Y')
    gui.add(mesh, 'visible')
    gui.add(material, 'wireframe')
    gui.addColor(material, 'color')
    gui.add(mesh.position, 'x').min(-3).max(3).step(0.01).name('cube X')
    gui.add(mesh.position, 'z').min(-3).max(3).step(0.01).name('cube Z')
    gui.add(mesh.scale, 'x').min(-3).max(3).step(0.01).name('cube scale X')
    gui.add(mesh.scale, 'y').min(-3).max(3).step(0.01).name('cube scale Y')
    gui.add(mesh.scale, 'z').min(-3).max(3).step(0.01).name('cube scale Z')
    gui.add(mesh.rotation, 'x').min(-3).max(3).step(0.01).name('cube rotation X')
    gui.add(mesh.rotation, 'y').min(-3).max(3).step(0.01).name('cube rotation Y')
    gui.add(mesh.rotation, 'z').min(-3).max(3).step(0.01).name('cube rotation Z')
   
/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 2
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()