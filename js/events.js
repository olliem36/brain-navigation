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


// Setting event listeners with delay, otherwise nav-labels are not initialized
setTimeout(function(){
	var navWrappers = document.querySelectorAll('.nav-wrapper');

	for (var i = 0; i < navWrappers.length; i++) {
		var navWrapper = navWrappers[i];
		navWrapper.addEventListener('mouseenter', function ( event ) {
			navWrapperMouseEnter( event );
			
		});
		navWrapper.addEventListener('mouseleave', function ( event ) {
			navWrapperMouseLeave( event );
		}) 
	}
}, 100);


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

// need both for FF and Webkit - others I haven't tested
var canvas = document.querySelector('canvas');

canvas.addEventListener('DOMMouseScroll', mousewheel, false);
canvas.addEventListener('mousewheel', mousewheel, false);

document.addEventListener('DOMMouseScroll', mousewheel, false);
document.body.addEventListener('mousewheel', mousewheel, false);

function mousewheel( e ) {
	console.log(camera.position.z);
}

function navWrapperMouseEnter ( event ) {
	var el = event.target;
	var elImg = el.querySelector('img');
	elImg.setAttribute('src', '../css/icons/hex-active.svg');
	
}


function navWrapperMouseLeave ( event ) {
	var el = event.target;
	var elImg = el.querySelector('img');
	elImg.setAttribute('src', '../css/icons/hex.svg');
	
}
