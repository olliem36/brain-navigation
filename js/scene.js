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
	x: 0,
	y: -200,
	z: -1200
};

// ---- Settings
var sceneSettings = {
	pause: false,
	bgColor: 0x111113,
	enableGridHelper: false,
	enableAxisHelper: false
};

// ---- Scene
container = document.getElementById( 'canvas-container' );
scene = new THREE.Scene();

// ---- Camera
camera = new THREE.PerspectiveCamera( 10, screenRatio, 10, 5000 );
// camera orbit control
// cameraCtrl = new THREE.TrackballControls( camera );

// cameraCtrl.rotateSpeed = 1.0;
// cameraCtrl.zoomSpeed = 1.2;
// cameraCtrl.panSpeed = 0.8;

// cameraCtrl.noZoom = false;
// cameraCtrl.noPan = false;

// cameraCtrl.staticMoving = true;
// cameraCtrl.dynamicDampingFactor = 0.3;
cameraCtrl = new THREE.OrbitControls( camera, container );

camera.position.set( cameraInitialPos.x, cameraInitialPos.y, cameraInitialPos.z );
cameraCtrl.update();

var requestAnimationFrame = window.requestAnimationFrame ||
							window.mozRequestAnimationFrame ||
							window.webkitRequestAnimationFrame ||
							window.msRequestAnimationFrame;

var step = 0;							

requestAnimationFrame(function(){
	//animateCamera([cameraInitialPos.x, cameraInitialPos.y, cameraInitialPos.z], [-337, 547, -1200], 4000);
	animateCamera([cameraInitialPos.x, cameraInitialPos.y, cameraInitialPos.z], [-527, 705, -1022], 4000);
});

//camera.rotateOnAxis(new THREE.Vector3(1, 0, 0), degInRad(90));
scene.rotation.x += 0.1;


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
function animateCamera(ia, oa, t) { 
	var interval = t/60;

	var xi = ia[0];
	var xo = oa[0];	
	var xDelta = (xo - xi)/interval;

	var yi = ia[1];
	var yo = oa[1];
	var yDelta = (yo - yi)/interval;

	var zi = ia[2];
	var zo = oa[2];
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
		animateCamera(ia, oa, t);
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
