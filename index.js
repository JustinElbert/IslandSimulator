import * as THREE from './three.js/build/three.module.js'
import { FirstPersonControls } from './three.js/examples/jsm/controls/FirstPersonControls.js'
import { PointerLockControls } from './three.js/examples/jsm/controls/PointerLockControls.js' 

//
let prevTime = performance.now();
const direction = new THREE.Vector3();
const velocity = new THREE.Vector3();

// Scene
const scene = new THREE.Scene();
scene.background =  new THREE.Color(0xFAFAFA);

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
const grid = new THREE.GridHelper(100, 20, 0x00ff00, 0x00ff00);
grid.position.set(0, -0.5, 0);

//Floor
// const planeLoader = new THREE.TextureLoader().load('/grass.png');
const planeGeo = new THREE.PlaneGeometry(500,500);
const planeMaterial = new THREE.MeshPhongMaterial({
    // map = planeLoader,
    side : THREE.DoubleSide
});
const planeMesh = new THREE.Mesh(planeGeo, planeMaterial);
planeMesh.rotateX( - Math.PI / 2 );
planeMesh.position.set(0, 0, 0);
planeMesh.rotation.set(Math.PI / 2, 0, -Math.PI / 2);

// Box
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const boxMaterial = new THREE.MeshBasicMaterial({
    color : 0x964B00,
    wireframe : false
});
const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);

// PointerLock Controls
const controls = new PointerLockControls(camera, renderer.domElement);
const blocker = document.getElementById( 'blocker' );
const instructions = document.getElementById( 'instructions' );

instructions.addEventListener( 'click', function () {

    controls.lock();

} );

controls.addEventListener( 'lock', function () {

    instructions.style.display = 'none';
    blocker.style.display = 'none';

} );

controls.addEventListener( 'unlock', function () {

    blocker.style.display = 'block';
    instructions.style.display = '';

} );

//Scene
scene.add(boxMesh);
scene.add(grid);
scene.add(ambientLight);
scene.add(controls.getObject());
scene.add(planeMesh);

// Movement Controls
    let moveForward = false;
    let moveBackward = false;
    let moveLeft = false;
    let moveRight = false;
    let canJump = false;

const keyMovement = function (event){
    switch (event.code){

        case 'ArrowUp':
		case 'KeyW':
		    moveForward = true;
		    break;

		case 'ArrowLeft':
		case 'KeyA':
			moveLeft = true;
			break;

		case 'ArrowDown':
		case 'KeyS':
			moveBackward = true;
			break;

		case 'ArrowRight':
		case 'KeyD':
			moveRight = true;
			break;

		case 'Space':
		if ( canJump === true ) velocity.y += 350;
			canJump = false;
		    break;
    }
}

const letgoMovement = function (event){
    switch (event.code){

        case 'ArrowUp':
		case 'KeyW':
		    moveForward = false;
		    break;

		case 'ArrowLeft':
		case 'KeyA':
			moveLeft = false;
			break;

		case 'ArrowDown':
		case 'KeyS':
			moveBackward = false;
			break;

		case 'ArrowRight':
		case 'KeyD':
			moveRight = false;
			break;
    }
}

document.addEventListener( 'keydown', keyMovement );
document.addEventListener( 'keyup', letgoMovement );
    
// onWindowResize
window.addEventListener('resize', onWindowResize);

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}
// Animate
function animate(){
    requestAnimationFrame(animate)
    renderer.render(scene, camera);

    const time = performance.now();

    if ( controls.isLocked === true ) {

        const delta = ( time - prevTime ) / 100;

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

        direction.z = Number( moveForward ) - Number( moveBackward );
        direction.x = Number( moveRight ) - Number( moveLeft );
        direction.normalize(); // this ensures consistent movements in all directions

        if ( moveForward || moveBackward ) velocity.z -= direction.z * 4.0 * delta;
        if ( moveLeft || moveRight ) velocity.x -= direction.x * 4.0 * delta;

        controls.moveRight( - velocity.x * delta );
        controls.moveForward( - velocity.z * delta );

        canJump = true;

    }
    prevTime = time;
}

animate()