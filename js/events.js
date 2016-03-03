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


window.addEventListener( 'mousemove', function ( event ) {
	//console.log(camera.position);
	//console.log(camera.rotation);
	//navLabelHover( event );
}, false );

// Setting event listeners with delay, otherwise nav-labels are not initialized
setTimeout(function(){
	var labels = document.querySelectorAll('.nav-label');

	for (var i = 0; i < labels.length; i++) {
		var label = labels[i];
		label.addEventListener('mouseenter', function ( event ) {
			labelMouseEnter( event );
		});
		label.addEventListener('mouseleave', function ( event ) {

		}) 
	}
}, 100);


// Cross browser mousewheel event
// if (document.addEventListener) {
// 	if ('onwheel' in document) {
// 		// IE9+, FF17+, Ch31+
// 		document.addEventListener('wheel', function ( event ) {
// 			event.preventDefault();
// 			console.log(camera.position.z);
// 		});
// 	} else if ('onmousewheel' in document) {
// 	// устаревший вариант события
// 	document.addEventListener("mousewheel", onDocumentMouseWheel);
// 	} else {
// 	// Firefox < 17
// 	document.addEventListener("MozMousePixelScroll", onDocumentMouseWheel);
// 	}
// } else { // IE8-
// 	document.attachEvent("onmousewheel", onDocumentMouseWheel);
// }

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

// function onDocumentMouseWheel( event ) {
// 	console.log(camera.position.z);
//     fov -= event.wheelDeltaY * 0.05;
//     camera.projectionMatrix = THREE.Matrix4.makePerspective( fov, window.innerWidth / window.innerHeight, 1, 1100 );
// }

// need both for FF and Webkit - others I haven't tested
var canvas = document.querySelector('canvas');

canvas.addEventListener('DOMMouseScroll', mousewheel, false);
canvas.addEventListener('mousewheel', mousewheel, false);

document.addEventListener('DOMMouseScroll', mousewheel, false);
document.body.addEventListener('mousewheel', mousewheel, false);

function mousewheel( e ) {
	console.log(camera.position.z);
  // var amount = 100; // parameter

  // // get wheel direction 
  //  var d = ((typeof e.wheelDelta != "undefined")?(-e.wheelDelta):e.detail);
  //   d = 100 * ((d>0)?1:-1);

  //   // do calculations, I'm not using any three.js internal methods here, maybe there is a better way of doing this
  //   // applies movement in the direction of (0,0,0), assuming this is where the camera is pointing
  //   var cPos = camera.position;
  //   var r = cPos.x*cPos.x + cPos.y*cPos.y;
  //   var sqr = Math.sqrt(r);
  //   var sqrZ = Math.sqrt(cPos.z*cPos.z + r);

  //   var nx = cPos.x + ((r==0)?0:(d * cPos.x/sqr));
  //   var ny = cPos.y + ((r==0)?0:(d * cPos.y/sqr));
  //   var nz = cPos.z + ((sqrZ==0)?0:(d * cPos.z/sqrZ));

  //   // verify we're applying valid numbers
  //   if (isNaN(nx) || isNaN(ny) || isNaN(nz))
  //     return;

  //   cPos.x = nx;
  //   cPos.y = ny;
  //   cPos.z = nz;
}

function navHover( event ) {
	event.preventDefault();

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

	var raycaster = new THREE.Raycaster();
	var mouse = new THREE.Vector2();

	var intersects = raycaster.intersectObjects([neuralNet.navNeuronsCloud]);
	
	var inactiveColor = neuralNet.navNeuronColor;
	var inactiveColorThree = new THREE.Color( inactiveColor );
	
	var activeColor = 'rgb(228,60,0)';
	var activeColorThree = new THREE.Color( activeColor );

	raycaster.setFromCamera( mouse, camera );

	if (intersects.length > 0) {
		var hoveredObj = intersects[0];
		var verticesCount = hoveredObj.object.geometry.vertices.length;
		console.log(verticesCount);
		hoveredObj.object.geometry.colors = [];
		
		for (var i = 0; i < verticesCount; i++ ) {
			
			var label = document.querySelectorAll('.nav-label')[i];

			if ( i === hoveredObj.index ) {
				console.log(intersects);
				var el = intersects[0].point;
				
				var matrix = intersects[0].object.matrix;
				var elPos = el.setFromMatrixPosition(matrix);
				
				console.log(elPos);


				// NTERSECTED = intersects[0].object;
	   //          INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
	   //          //INTERSECTED.material.emissive.setHex(0xff0000);
	            
	   //          tween = new TWEEN.Tween(INTERSECTED.material.color)
	   //          .to({r: 0, g: 25, b: 155}, 2000)
	   //          .easing(TWEEN.Easing.Quartic.In)
	   //          .start();


				hoveredObj.object.geometry.colors.push(activeColorThree);
				label.style.color = activeColor;

			} else {
				hoveredObj.object.geometry.colors.push(inactiveColorThree);
				label.style.color = inactiveColor;
			}
		}
		console.log(event.clientX, event.clientY);
		hoveredObj.object.geometry.colorsNeedUpdate = true;

	} else {
		neuralNet.navNeuronsCloud.geometry.colors = [];

		for (var i = 0; i < neuralNet.navItems.length; i++) {
			neuralNet.navNeuronsCloud.geometry.colors.push(inactiveColor);
		}

		neuralNet.navNeuronsCloud.geometry.colorsNeedUpdate = true;
	}
}

function labelMouseEnter ( event ) {
	var el = event.target;
	var elId = el.getAttribute('id');

	
}

function _labelMouseEnter ( event ) {
	var hoveredObj = event.target;
	var verticesCount = hoveredObj.object.geometry.vertices.length;

	hoveredObj.object.geometry.colors = [];
	
	for (var i = 0; i < verticesCount; i++ ) {
		
		var label = document.querySelectorAll('.nav-label')[i];

		if ( i === hoveredObj.index ) {
			console.log(intersects);
			var el = intersects[0].point;
			
			var matrix = intersects[0].object.matrix;
			var elPos = el.setFromMatrixPosition(matrix);
			
			console.log(elPos);


			// NTERSECTED = intersects[0].object;
   //          INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
   //          //INTERSECTED.material.emissive.setHex(0xff0000);
            
   //          tween = new TWEEN.Tween(INTERSECTED.material.color)
   //          .to({r: 0, g: 25, b: 155}, 2000)
   //          .easing(TWEEN.Easing.Quartic.In)
   //          .start();


			hoveredObj.object.geometry.colors.push(activeColorThree);
			label.style.color = activeColor;

		} else {
			hoveredObj.object.geometry.colors.push(inactiveColorThree);
			label.style.color = inactiveColor;
		}
	}
	console.log(event.clientX, event.clientY);
	hoveredObj.object.geometry.colorsNeedUpdate = true;
}