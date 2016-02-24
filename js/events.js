// Events --------------------------------------------------------

window.addEventListener( 'keypress', function ( event ) {

	var key = event.keyCode;

	switch ( key ) {

		case 32:/*space bar*/ sceneSettings.pause = !sceneSettings.pause;
			break;

		case 65:/*A*/
		case 97:/*a*/ sceneSettings.enableGridHelper = !sceneSettings.enableGridHelper;
			break;

		case 83 :/*S*/
		case 115:/*s*/ sceneSettings.enableAxisHelper = !sceneSettings.enableAxisHelper;
			break;

	}

} );

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
// var mesh = new THREE.Object3D();
// var cloud = new THREE.PointCloud();
// cloud.children.push(navNeuronsPointCloud);
// mesh.children.push(cloud);

window.addEventListener( 'mousemove', function ( event ) {
	event.preventDefault();

	renderer.domElement.getContext('2d').fillText("Hello", 50, 50);

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

	raycaster.setFromCamera( mouse, camera );

	var intersects = raycaster.intersectObjects([neuralNet.navNeuronsCloud]);
	if (intersects.length > 0) {
		console.log(intersects);

		intersects[0].object.geometry.colors[intersects[0].index] = new THREE.Color( '#ff2000' );
		intersects[0].object.geometry.colorsNeedUpdate = true;

	} else {
		/*for ( i = 0; i < neuralNet.navNeuronsPos.length; i++) {
			neuralNet.navNeuronsCloud.geometry.colors[i] = new THREE.Color( '#8600ff' );
			neuralNet.navNeuronsCloud.geometry.colorsNeedUpdate = true;
		}*/
	}

}, false );


$( function () {
	var timerID;
	$( window ).resize( function () {
		clearTimeout( timerID );
		timerID = setTimeout( function () {
			onWindowResize();
		}, 250 );
	} );
} );


function onWindowResize() {

	WIDTH = window.innerWidth;
	HEIGHT = window.innerHeight;

	pixelRatio = window.devicePixelRatio || 1;
	screenRatio = WIDTH / HEIGHT;

	camera.aspect = screenRatio;
	camera.updateProjectionMatrix();

	renderer.setSize( WIDTH, HEIGHT );
	renderer.setPixelRatio( pixelRatio );

}