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

window.addEventListener( 'mousemove', function ( event ) {
	event.preventDefault();
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

	raycaster.setFromCamera( mouse, camera );
	//console.log(navNeuronsPos);

	console.log(navNeuronsObj);

	// var navNeurons = [];
	// navNeuronsPos.forEach(function(item){
	// 	var obj = new THREE.Object3D();
	// 	console.log(item);
	// 	obj.position.x = item.x;
	// 	obj.position.y = item.y;
	// 	obj.position.z = item.z;
	// 	navNeurons.push(obj);
	// });

	// console.log(navNeurons);

	var intersects = raycaster.intersectObjects(navNeuronsObj);
	console.log(intersects);

	// for ( var i = 0; i < intersects.length; i++ ) {
	// 	var obj = intersects[i];
	// 	if (obj.object instanceof THREE.Object3D) {

	// 		console.log(obj.index);
	// 		console.log( getObjectById(obj.index) );
	// 	}
	// 	//console.log(intersects[i]);
	// 	//intersects[ i ].object.material.color.set( 0xff0000 );
	
	// }
	// intersects.forEach(function(item){
	// 	console.log(item);
	// });
	//var vector  = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
	//var raycaster = new THREE.Raycaster();
	//console.log(vector, raycaster);
	//var ray         = projector.pickingRay( vector, this._camera );
	//var intersects  = ray.intersectObjects( boundObjs );
} );

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