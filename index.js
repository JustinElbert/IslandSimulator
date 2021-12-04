import * as THREE from './three.js/build/three.module.js'
import { FirstPersonControls } from './three.js/examples/jsm/controls/FirstPersonControls.js'
import { PointerLockControls } from './three.js/examples/jsm/controls/PointerLockControls.js' 

// Scene
const scene = new THREE.Scene();
scene.background =  new THREE.Color(0xFAFAFA);

// Clock
const clock = new THREE.Clock();

// Camera
const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 1, 1000);
camera.position.z = 5;
camera.position.y = 0;

// Renderer
const renderer = new THREE.WebGLRenderer({ AntiAlias : true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;            // Render Bayangan

document.body.appendChild(renderer.domElement);

// Light 
const directLight = new THREE.DirectionalLight("#FFFFFF", 100);
directLight.position.set(0, 1, 0);
directLight.castShadow = true;

const ambientLight = new THREE.AmbientLight("#FFFFFF", 0.5);

// Grid
const grid = new THREE.GridHelper(100, 20, 0x0a0a0a, 0x0a0a0a);
grid.position.set(0, -0.5, 0);

// Box
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const boxMaterial = new THREE.MeshBasicMaterial({
    color : "#00ff00",
    wireframe : false
});
const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);

// First Person Controls 
const controls = new FirstPersonControls(camera, renderer.domElement );
controls.lookSpeed = 0.05;
controls.lookVertical = true;

// PointerLock Controls
const pointerlockControls = new PointerLockControls(camera, renderer.domElement);


//Scene
scene.add(boxMesh);
scene.add(grid);
scene.add(ambientLight);


    
// onWindowResize\
window.addEventListener('resize', onWindowResize);

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    controls.handleResize();

}
// Animate
function animate(){
    requestAnimationFrame(animate)
    renderer.render(scene, camera);
    controls.update( clock.getDelta() );
}

animate()