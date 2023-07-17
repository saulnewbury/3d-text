// This version features click and hold to rotate functionality
// Click on the left side of the screen to rotate anti-clockwise
// and on the right side to rotate clockwise. The further from
// the center (along the x axis) the faster.

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { gsap } from 'gsap'

THREE.ColorManagement.enabled = false

console.log(TextGeometry)

// Cursor
const cursor = {
  x: 0,
  y: 0,
}

const scroll = { y: 4, x: 0 }
let mousedown = false,
  text,
  box,
  donut,
  objArray = [],
  rotationCount = 0

window.addEventListener('mousemove', (e) => {
  cursor.x = e.clientX / sizes.width - 0.5
  cursor.y = -(e.clientY / sizes.height - 0.5)
})

window.addEventListener('wheel', (e) => {
  zoom(e)
})

window.addEventListener('mousedown', (e) => {
  mousedown = true
})

window.addEventListener('mouseup', (e) => {
  mousedown = false
})

function zoom(e) {
  scroll.x += e.deltaX
  // Move on the z-axis
  scroll.y += e.deltaY / 200
  gsap.to(camera.position, {
    z: scroll.y,
  })
}

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Axes Helper
// const axesHelper = new THREE.AxesHelper()
// scene.add(axesHelper)

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()

const matcapTexture = textureLoader.load('/textures/matcaps/8.png')

/**
 * Fonts
 */
const fontLoader = new FontLoader()

// Unlike texture loader we must use a callback once font has loaded
fontLoader.load('/fonts/helvetiker_regular.typeface.json', (font) => {
  const textGeometry = new TextGeometry('Saul Newbury', {
    font,
    size: 0.5,
    height: 0.3,
    curveSegments: 5,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bebelSegments: 4,
  })

  //   textGeometry.computeBoundingBox()
  //   textGeometry.translate(
  //     -(textGeometry.boundingBox.max.x - 0.01) * 0.5,
  //     -(textGeometry.boundingBox.max.y - 0.01) * 0.5,
  //     -(textGeometry.boundingBox.max.z - 0.15) * 0.5
  //   )
  //   console.log(textGeometry.boundingBox)
  textGeometry.center()

  //   const material = new THREE.MeshMatcapMaterial({ matcap: matcapTexture })
  const material = new THREE.MeshNormalMaterial()
  //   textMaterial.wireframe = true
  text = new THREE.Mesh(textGeometry, material)
  scene.add(text)

  console.time('donuts')

  // Keep these outside the loop, they only need to be created once
  const donutGeometry = new THREE.TorusGeometry(0.3, 0.2, 20, 45)
  const cubeGeometry = new THREE.BoxGeometry(1, 1)

  for (let i = 0; i < 70; i++) {
    donut = new THREE.Mesh(donutGeometry, material)
    box = new THREE.Mesh(cubeGeometry, material)
    box.position.x = (Math.random() - 0.5) * 15
    box.position.y = (Math.random() - 0.5) * 15
    box.position.z = (Math.random() - 0.5) * 15
    donut.position.x = (Math.random() - 0.5) * 15
    donut.position.y = (Math.random() - 0.5) * 15
    donut.position.z = (Math.random() - 0.5) * 15

    box.rotation.x = Math.random() * Math.PI
    box.rotation.y = Math.random() * Math.PI
    donut.rotation.x = Math.random() * Math.PI
    donut.rotation.y = Math.random() * Math.PI

    const donutScale = Math.random() / 1.5
    const boxScale = Math.random() / 1.5
    // donut.scale.y = scale
    // donut.scale.x = scale
    // donut.scale.z = scale
    box.scale.set(boxScale, boxScale, boxScale, boxScale)
    donut.scale.set(donutScale, donutScale, donutScale, donutScale)
    scene.add(box, donut)

    objArray.push({ box, donut })
  }

  console.timeEnd('donuts')
})

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

window.addEventListener('resize', () => {
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
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
)
// camera.position.x = 2.6
// camera.position.y = -1
camera.position.z = scroll.y
scene.add(camera)

// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
})
renderer.outputColorSpace = THREE.LinearSRGBColorSpace
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */

console.log(camera)

const clock = new THREE.Clock()

const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  // Update controls
  //   controls.update()

  // Update camera
  if (!mousedown) {
    gsap.to(camera.position, { x: cursor.x })
    gsap.to(camera.position, { y: cursor.y })
  }

  // Mousedown will cause the rotationCount to increment at each click
  // (click and hold)
  if (mousedown) {
    console.log(cursor.x)
    rotationCount += cursor.x
    gsap.to(camera.rotation, { y: rotationCount / 10 })
  }

  // Update objects
  if (text) {
    text.position.x = Math.cos(elapsedTime) / 10
    text.position.y = Math.sin(elapsedTime) / 10
    gsap.to(text.rotation, { x: cursor.y / 2 })
    gsap.to(text.rotation, { y: cursor.x / 2 })
  }

  if (box && donut) {
    for (let i = 0; i < objArray.length; i++) {
      if (i % 5 == 0) {
        objArray[i].box.position.x += Math.cos(elapsedTime) / 300
        objArray[i].box.position.y += Math.sin(elapsedTime) / 300
        objArray[i].donut.position.x += Math.cos(elapsedTime) / 300
        objArray[i].donut.position.y += Math.sin(elapsedTime) / 300
      } else if (i % 3 == 0) {
        objArray[i].box.position.x += Math.cos(elapsedTime) / 400
        objArray[i].box.position.y += Math.sin(elapsedTime) / 400
        objArray[i].donut.position.x += Math.cos(elapsedTime) / 400
        objArray[i].donut.position.y += Math.sin(elapsedTime) / 400
      } else if (i % 2 === 0) {
        objArray[i].box.position.x += Math.sin(elapsedTime) / 500
        objArray[i].box.position.y += Math.cos(elapsedTime) / 500
        objArray[i].donut.position.x += Math.sin(elapsedTime) / 500
        objArray[i].donut.position.y += Math.cos(elapsedTime) / 500
      } else {
        objArray[i].box.position.x += Math.sin(elapsedTime) / 600
        objArray[i].box.position.y += Math.cos(elapsedTime) / 600
        objArray[i].donut.position.x += Math.sin(elapsedTime) / 600
        objArray[i].donut.position.y += Math.cos(elapsedTime) / 600
      }
    }
  }

  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
