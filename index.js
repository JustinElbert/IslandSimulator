import * as THREE from './three.js/build/three.module.js'
import Stats from './three.js/examples/jsm/libs/stats.module.js'
import { PointerLockControls } from './three.js/examples/jsm/controls/PointerLockControls.js' 
import { ImprovedNoise } from './three.js/examples/jsm/math/ImprovedNoise.js'

//
let prevTime = performance.now();
let mesh, texture, stats;
const raycaster = new THREE.Raycaster();
const direction = new THREE.Vector3();
const velocity = new THREE.Vector3();

// Scene
const scene = new THREE.Scene();
scene.background =  new THREE.Color(0xFAFAFA);

// Camera
const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 1, 1000);
camera.position.z = 5;
camera.position.y = 200;

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

// World
const worldWidth = 20, worldDepth = 30;

const data = generateHeight( worldWidth, worldDepth );

const geometry = new THREE.PlaneGeometry( 300, 300, worldWidth - 1, worldDepth - 1);

	geometry.rotateX( - Math.PI / 2 );

		const vertices = geometry.attributes.position.array;

		for ( let i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3 ) {

			vertices[ j + 1 ] = data[ i ] * 10;

		}

texture = new THREE.CanvasTexture(generateTexture( data, worldWidth, worldDepth ) );
texture.wrapS = THREE.ClampToEdgeWrapping;
texture.wrapT = THREE.ClampToEdgeWrapping;

mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { map: texture } ) );

stats = new Stats();
document.body.appendChild( stats.dom );

function generateHeight( width, height ) {

    const size = width * height, data = new Uint8Array( size ),
        perlin = new ImprovedNoise(), z = Math.random() * 10;

    let quality = 1;

    for ( let j = 0; j < 2; j ++ ) {

        for ( let i = 0; i < size; i++ ) {

            const x = i % width, y = ~ ~ ( i / width );
            data[i] += Math.abs( perlin.noise( x / quality, y / quality, z ) * quality * 1.5 );

        }

        quality *= 5;

    }

    return data;

}

function generateTexture( data, width, height ) {

    // bake lighting into texture

    let context, image, imageData, shade;

    const vector3 = new THREE.Vector3( 0, 0, 0 );

    const sun = new THREE.Vector3( 1, 1, 1 );
    sun.normalize();

    const canvas = document.createElement( 'canvas' );
    canvas.width = width;
    canvas.height = height;

    context = canvas.getContext( '2d' );
    context.fillStyle = '#000';
    context.fillRect( 0, 0, width, height );

    image = context.getImageData( 0, 0, canvas.width, canvas.height );
    imageData = image.data;

    for ( let i = 0, j = 0, l = imageData.length; i < l; i += 4, j ++ ) {

        vector3.x = data[ j - 2 ] - data[ j + 2 ];
        vector3.y = 2;
        vector3.z = data[ j - width * 2 ] - data[ j + width * 2 ];
        vector3.normalize();

        shade = vector3.dot( sun );

        imageData[ i ] = ( 96 + shade * 128 ) * ( 0.5 + data[ j ] * 0.007 );
        imageData[ i + 1 ] = ( 32 + shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );
        imageData[ i + 2 ] = ( shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );

    }

    context.putImageData( image, 0, 0 );

    // Scaled 4x

    const canvasScaled = document.createElement('canvas');
    canvasScaled.width = width * 4;
    canvasScaled.height = height * 4;

    context = canvasScaled.getContext( '2d' );
    context.scale( 4, 4 );
    context.drawImage( canvas, 0, 0 );

    image = context.getImageData( 0, 0, canvasScaled.width, canvasScaled.height );
    imageData = image.data;

    for ( let i = 0, l = imageData.length; i < l; i += 4 ) {

        const v = ~ ~ ( Math.random() * 5 );

        imageData[ i ] += v;
        imageData[ i + 1 ] += v;
        imageData[ i + 2 ] += v;

    }

    context.putImageData( image, 0, 0 );

    return canvasScaled;
}

// Grid
const grid = new THREE.GridHelper(100, 20, 0x00ff00, 0x00ff00);
grid.position.set(0, -0.5, 0);

// Box
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const boxMaterial = new THREE.MeshBasicMaterial({
    color : 0x964B00,
    wireframe : false
});
const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);

// PointerLock Controls
const controls = new PointerLockControls(camera, renderer.domElement);
const blocker = document.getElementById('blocker');
const instructions = document.getElementById('instructions');

instructions.addEventListener('click', function(){

    controls.lock();

} );

controls.addEventListener('lock', function(){

    instructions.style.display = 'none';
    blocker.style.display = 'none';

} );

controls.addEventListener('unlock', function(){

    blocker.style.display = 'block';
    instructions.style.display = '';

} );

//Scene
scene.add(boxMesh);
scene.add(grid);
scene.add(ambientLight);
scene.add(controls.getObject());
// scene.add(planeMesh);
scene.add(mesh);

// Movement Controls
    let moveForward = false;
    let moveBackward = false;
    let moveLeft = false;
    let moveRight = false;
    let canJump = false;

const keyMovement = function(event){
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

const letgoMovement = function(event){
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

function onWindowResize(){

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
        direction.y = Number(canJump);
        direction.normalize(); // this ensures consistent movements in all directions

        if ( moveForward || moveBackward ) velocity.z -= direction.z * 10.0 * delta;
        if ( moveLeft || moveRight ) velocity.x -= direction.x * 10.0 * delta;

        controls.moveRight( - velocity.x * delta );
        controls.moveForward( - velocity.z * delta );
        
        if(controls.isLocked === false){
            velocity.y -= direction.y * 4.0 * delta;

            controls.canJump(velocity.y * delta); 
        }
    }
    prevTime = time;
}

animate()