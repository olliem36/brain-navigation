// Scene --------------------------------------------------------
/* exported updateHelpers */

if ( !Detector.webgl ) {
	Detector.addGetWebGLMessage();
}

var container, stats;
var scene, light, camera, cameraCtrl, renderer;
var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;
var pixelRatio = window.devicePixelRatio || 1;
var screenRatio = WIDTH / HEIGHT;
var clock = new THREE.Clock();
var FRAME_COUNT = 0;
var cameraInitialPos = {
	x:  680, //0,
	y:  900, //-200,
	z: -1030 //-1200
};

var cameraToPos = {
	x: -780, //-527,
	y:  1030, //705,
	z:  -870, //-1022
};

// ---- Settings
var sceneSettings = {
	pause: false,
	bgColor: 0x151516,
	enableGridHelper: false,
	enableAxisHelper: false
};

// ---- Scene
container = document.getElementById( 'canvas-container' );
scene = new THREE.Scene();


// ---- Camera
camera = new THREE.PerspectiveCamera( 10, screenRatio, 10, 5000 );
cameraCtrl = new THREE.OrbitControls( camera, container );
// camera orbit control
// cameraCtrl = new THREE.TrackballControls( camera );

// cameraCtrl.rotateSpeed = 1.0;
// cameraCtrl.zoomSpeed = 1.2;
// cameraCtrl.panSpeed = 0.8;

cameraCtrl.noZoom = false;
// cameraCtrl.noPan = false;

// cameraCtrl.staticMoving = true;
// cameraCtrl.dynamicDampingFactor = 0.3;

camera.position.set( cameraInitialPos.x, cameraInitialPos.y, cameraInitialPos.z );
cameraCtrl.update();

var requestAnimationFrame = window.requestAnimationFrame ||
							window.mozRequestAnimationFrame ||
							window.webkitRequestAnimationFrame ||
							window.msRequestAnimationFrame;

var step = 0;							

requestAnimationFrame(function(){
	animateCamera(cameraInitialPos, cameraToPos, 5000);
});


var theta = 0;
var radius = 100;
theta += 0.1;

// camera.position.x *= Math.sin(THREE.Math.degToRad(theta));
// camera.position.y *= Math.sin(THREE.Math.degToRad(theta));
// camera.position.z *= Math.cos(THREE.Math.degToRad(theta));

// ---- Renderer
renderer = new THREE.WebGLRenderer( {
	antialias: true,
	alpha: true
} );
renderer.setSize( WIDTH, HEIGHT );
renderer.setPixelRatio( pixelRatio );
renderer.setClearColor( sceneSettings.bgColor, 1 );
renderer.autoClear = false;
container.appendChild( renderer.domElement );

// ---- Stats
stats = new Stats();
container.appendChild( stats.domElement );

// ---- grid & axis helper
var gridHelper = new THREE.GridHelper( 600, 50 );
gridHelper.setColors( 0x00bbff, 0xffffff );
gridHelper.material.opacity = 0.1;
gridHelper.material.transparent = true;
gridHelper.position.y = -300;
scene.add( gridHelper );

var axisHelper = new THREE.AxisHelper( 50 );
scene.add( axisHelper );

// ia - input array, oa - output array, t - time
function animateCamera(positionFrom, positionTo, t) { 
	var interval = t/60;

	var xi = positionFrom.x;
	var xo = positionTo.x;	
	var xDelta = (xo - xi)/interval;

	var yi = positionFrom.y;
	var yo = positionTo.y;	
	var yDelta = (yo - yi)/interval;

	var zi = positionFrom.z;
	var zo = positionTo.z;	
	var zDelta = (zo - zi)/interval;

	x = xi + xDelta*step;
	y = yi + yDelta*step;
	z = zi + zDelta*step;

	if (step <= interval) {
		camera.position.set(x, y, z);
		cameraCtrl.update();  
		step += 1;
	}

	requestAnimationFrame(function(){
		animateCamera(positionFrom, positionTo, t);
	});
}

function updateHelpers() {
	axisHelper.visible = sceneSettings.enableAxisHelper;
	gridHelper.visible = sceneSettings.enableGridHelper;
}

/*
// ---- Lights
// back light
light = new THREE.DirectionalLight( 0xffffff, 0.8 );
light.position.set( 100, 230, -100 );
scene.add( light );

// hemi
light = new THREE.HemisphereLight( 0x00ffff, 0x29295e, 1 );
light.position.set( 370, 200, 20 );
scene.add( light );

// ambient
light = new THREE.AmbientLight( 0x111111 );
scene.add( light );
*/
