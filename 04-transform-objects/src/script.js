import * as THREE from 'three'
import { cameraNear } from 'three/tsl'

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()


/**
 * Objects
 */
// group objects adding 
const group = new THREE.Group()

scene.add(group)

const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: 0xff6060 })
const mesh = new THREE.Mesh(geometry, material)
group.add(mesh)
group.position.x= 1
const cube1 =new THREE.Mesh(
    new THREE.BoxGeometry(1,1,1),
    new THREE.MeshBasicMaterial({color:0x00ff00}    )
)
cube1.position.x= -2
group.add(cube1)



 //axis helper
 const axisHelper = new THREE.AxesHelper(2)
 scene.add(axisHelper)
/**
 * Sizes
 * 
 */
const sizes = {
    width: 800,
    height: 600
}
//scale
mesh.scale.set(2,0.5,0.5)
//rottion
// mesh.rotation.x = Math.PI * 1
//reorder
mesh.rotation.reorder('YXZ')
mesh.rotation.y = Math.PI * 0.75


/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
//lookAt
camera.position.z = 2

scene.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.render(scene, camera)