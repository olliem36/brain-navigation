// Neuron ----------------------------------------------------------------

function Neuron( x, y, z ) {

	this.connection = [];
	this.receivedSignal = false;
	this.lastSignalRelease = 0;
	this.releaseDelay = 0;
	this.fired = false;
	this.firedCount = 0;
	this.prevReleaseAxon = null;
	THREE.Vector3.call( this, x, y, z );

}

Neuron.prototype = Object.create( THREE.Vector3.prototype );

Neuron.prototype.connectNeuronTo = function ( neuronB ) {

	var neuronA = this;
	// create axon and establish connection
	var axon = new Axon( neuronA, neuronB );
	neuronA.connection.push( new Connection( axon, 'A' ) );
	neuronB.connection.push( new Connection( axon, 'B' ) );
	return axon;

};

Neuron.prototype.createSignal = function ( particlePool, minSpeed, maxSpeed ) {

	this.firedCount += 1;
	this.receivedSignal = false;

	var signals = [];

	var curVector;
	var prevVector;
	var curNeuron;
	var prevNeuron;

	// create signal to all connected axons
	for ( var i = 0; i < this.connection.length; i++ ) {

		// curNeuron = this;
		// console.log(this.prevReleaseAxon);
		// if (curNeuron.prevReleaseAxon) {
		// 	if (curNeuron === curNeuron.prevReleaseAxon.neuronA) {
		// 		prevNeuron = this.prevReleaseAxon.neuronB;
		// 	} else {
		// 		prevNeuron = this.prevReleaseAxon.neuronA;
		// 	}

		// 	console.log(curNeuron);
		// 	console.log(prevNeuron);
			
		// 	curVector =  new THREE.Vector3(n.x, n.y, n.z);
		// 	prevVector = new THREE.Vector3(n.x, n.y, n.z);
			
		// }

		if ( this.connection[ i ].axon !== this.prevReleaseAxon) {
			var c = new Signal( particlePool, minSpeed, maxSpeed );
			c.setConnection( this.connection[ i ] );
			signals.push( c );
		}
	}
	return signals;

};

Neuron.prototype.reset = function () {

	this.receivedSignal = false;
	this.lastSignalRelease = 0;
	this.releaseDelay = 0;
	this.fired = false;
	this.firedCount = 0;

};

// Signal extends THREE.Vector3 ----------------------------------------------------------------

function Signal( particlePool, minSpeed, maxSpeed ) {

	this.minSpeed = minSpeed;
	this.maxSpeed = maxSpeed;
	this.speed = THREE.Math.randFloat( this.minSpeed, this.maxSpeed );
	this.alive = true;
	this.t = null;
	this.startingPoint = null;
	this.axon = null;
	this.particle = particlePool.getParticle();
	THREE.Vector3.call( this );

}

Signal.prototype = Object.create( THREE.Vector3.prototype );

Signal.prototype.setConnection = function ( Connection ) {

	this.startingPoint = Connection.startingPoint;
	this.axon = Connection.axon;
	if ( this.startingPoint === 'A' ) this.t = 0;
	else if ( this.startingPoint === 'B' ) this.t = 1;

};

Signal.prototype.travel = function ( deltaTime ) {

	var pos;
	if ( this.startingPoint === 'A' ) {
		this.t += this.speed * deltaTime;
		if ( this.t >= 1 ) {
			this.t = 1;
			this.alive = false;
			this.axon.neuronB.receivedSignal = true;
			this.axon.neuronB.prevReleaseAxon = this.axon;
		}

	} else if ( this.startingPoint === 'B' ) {
		this.t -= this.speed * deltaTime;
		if ( this.t <= 0 ) {
			this.t = 0;
			this.alive = false;
			this.axon.neuronA.receivedSignal = true;
			this.axon.neuronA.prevReleaseAxon = this.axon;
		}
	}

	pos = this.axon.getPoint( this.t );
	
	// pos = this.axon.getPointAt(this.t);	// uniform point distribution but slower calculation

	this.particle.set( pos.x, pos.y, pos.z );
	

};

// Particle Pool ---------------------------------------------------------

function ParticlePool( poolSize ) {

	this.spriteTextureSignal = TEXTURES.electric;

	this.poolSize = poolSize;
	this.pGeom = new THREE.Geometry();
	this.particles = this.pGeom.vertices;

	this.offScreenPos = new THREE.Vector3( 9999, 9999, 9999 );

	this.pColor = '#ff4400';
	this.pSize = 2;

	for ( var ii = 0; ii < this.poolSize; ii++ ) {
		this.particles[ ii ] = new Particle( this );
	}

	this.meshComponents = new THREE.Object3D();

	// inner particle
	this.pMat = new THREE.PointCloudMaterial( {
		map: this.spriteTextureSignal,
		size: this.pSize,
		color: this.pColor,
		blending: THREE.AdditiveBlending,
		depthTest: false,
		transparent: true
	} );

	this.pMesh = new THREE.PointCloud( this.pGeom, this.pMat );
	this.pMesh.frustumCulled = false;

	this.meshComponents.add( this.pMesh );


	// outer particle glow
	this.pMat_outer = this.pMat.clone();
	this.pMat_outer.size = this.pSize * 10;
	this.pMat_outer.opacity = 0.04;

	this.pMesh_outer = new THREE.PointCloud( this.pGeom, this.pMat_outer );
	this.pMesh_outer.frustumCulled = false;

	this.meshComponents.add( this.pMesh_outer );

}

ParticlePool.prototype.getAvgExecutionTime = function () {
	return this.profTime / this.itt;
};

ParticlePool.prototype.getParticle = function () {

	for ( var ii = 0; ii < this.poolSize; ii++ ) {
		var p = this.particles[ ii ];
		if ( p.available ) {
			this.lastAvailableIdx = ii;
			p.available = false;
			return p;
		}
	}

	console.error( "ParticlePool.prototype.getParticle return null" );
	return null;

};

ParticlePool.prototype.update = function () {

	this.pGeom.verticesNeedUpdate = true;

};

ParticlePool.prototype.updateSettings = function () {

	// inner particle
	this.pMat.color.setStyle( this.pColor );
	this.pMat.size = this.pSize;
	// outer particle
	this.pMat_outer.color.setStyle( this.pColor );
	this.pMat_outer.size = this.pSize * 10;

};

// Particle --------------------------------------------------------------
// Private class for particle pool

function Particle( particlePool ) {

	this.particlePool = particlePool;
	this.available = true;
	THREE.Vector3.call( this, this.particlePool.offScreenPos.x, this.particlePool.offScreenPos.y, this.particlePool.offScreenPos.z );

}

Particle.prototype = Object.create( THREE.Vector3.prototype );

Particle.prototype.free = function () {

	this.available = true;
	this.set( this.particlePool.offScreenPos.x, this.particlePool.offScreenPos.y, this.particlePool.offScreenPos.z );

};

// Axon extends THREE.CubicBezierCurve3 ------------------------------------------------------------------
/* exported Axon, Connection */

function Axon( neuronA, neuronB ) {

	this.bezierSubdivision = 8;
	this.neuronA = neuronA;
	this.neuronB = neuronB;
	this.cpLength = neuronA.distanceTo( neuronB ) / THREE.Math.randFloat( 1.5, 4.0 );
	this.controlPointA = this.getControlPoint( neuronA, neuronB );
	this.controlPointB = this.getControlPoint( neuronB, neuronA );
	THREE.CubicBezierCurve3.call( this, this.neuronA, this.controlPointA, this.controlPointB, this.neuronB );

	this.vertices = this.getSubdividedVertices();

}

Axon.prototype = Object.create( THREE.CubicBezierCurve3.prototype );

Axon.prototype.getSubdividedVertices = function () {
	return this.getSpacedPoints( this.bezierSubdivision );
};

// generate uniformly distribute vector within x-theta cone from arbitrary vector v1, v2
Axon.prototype.getControlPoint = function ( v1, v2 ) {

	var dirVec = new THREE.Vector3().copy( v2 ).sub( v1 ).normalize();
	var northPole = new THREE.Vector3( 0, 0, 1 ); // this is original axis where point get sampled
	var axis = new THREE.Vector3().crossVectors( northPole, dirVec ).normalize(); // get axis of rotation from original axis to dirVec
	var axisTheta = dirVec.angleTo( northPole ); // get angle
	var rotMat = new THREE.Matrix4().makeRotationAxis( axis, axisTheta ); // build rotation matrix

	var minz = Math.cos( THREE.Math.degToRad( 45 ) ); // cone spread in degrees
	var z = THREE.Math.randFloat( minz, 1 );
	var theta = THREE.Math.randFloat( 0, Math.PI * 2 );
	var r = Math.sqrt( 1 - z * z );
	var cpPos = new THREE.Vector3( r * Math.cos( theta ), r * Math.sin( theta ), z );
	cpPos.multiplyScalar( this.cpLength ); // length of cpPoint
	cpPos.applyMatrix4( rotMat ); // rotate to dirVec
	cpPos.add( v1 ); // translate to v1
	return cpPos;

};

// Connection ------------------------------------------------------------
function Connection( axon, startingPoint ) {
	this.axon = axon;
	this.startingPoint = startingPoint;
}

function NeuralNetwork() {

	this.initialized = false;

	this.settings = {
		/*default
		verticesSkipStep       : 2,
		maxAxonDist            : 10,
		maxConnectionsPerNeuron: 6,
		signalMinSpeed         : 1.75,
		signalMaxSpeed         : 3.25,
		currentMaxSignals      : 3000,
		limitSignals           : 10000
		*/

		verticesSkipStep: 3,
		maxAxonDist: 10,
		maxConnectionsPerNeuron: 6,
		signalMinSpeed: 1.75,
		signalMaxSpeed: 3.25,
		currentMaxSignals: 4000,
		limitSignals: 10000,
		navNeurons: []
	};

	this.meshComponents = new THREE.Object3D();
	this.particlePool = new ParticlePool( this.settings.limitSignals );
	this.meshComponents.add( this.particlePool.meshComponents );

	// NN component containers
	this.components = {
		neurons: [],
		allSignals: [],
		allAxons: []
	};

	// axon
	this.axonOpacityMultiplier = 1;
	this.axonColor = '#0099ff';
	this.axonGeom = new THREE.BufferGeometry();
	this.axonPositions = [];
	this.axonIndices = [];
	this.axonNextPositionsIndex = 0;

	this.axonUniforms = {
		color: {
			type: 'c',
			value: new THREE.Color( this.axonColor )
		},
		opacityMultiplier: {
			type: 'f',
			value: this.axonOpacityMultiplier
		}
	};

	this.axonAttributes = {
		opacity: {
			type: 'f',
			value: []
		}
	};

	// neuron
	this.neuronSizeMultiplier = 0.7;
	this.spriteTextureNeuron = TEXTURES.electric;
	this.spriteTextureNavNeuron = TEXTURES.circle; //TEXTURES.circle
	this.spriteTextureActiveNavNeuron = TEXTURES.hex; //TEXTURES.hex
	this.neuronColor = '#00ffff';
	this.navNeuronColor = '#ffffff';
	this.neuronOpacity = 1;
	this.navNeuronOpacity = 0.6;
	this.neuronsGeom = new THREE.Geometry();
	this.navNeuronsGeom = new THREE.Geometry();

	this.neuronUniforms = {
		sizeMultiplier: {
			type: 'f',
			value: this.neuronSizeMultiplier
		},
		opacity: {
			type: 'f',
			value: this.neuronOpacity
		},
		texture: {
			type: 't',
			value: this.spriteTextureNeuron
		}
	};

/*	this.navNeuronUniforms = {
		sizeMultiplier: {
			type: 'f',
			value: 1
		},
		opacity: {
			type: 'f',
			value: this.navNeuronOpacity
		},
		texture: {
			type: 't',
			value: this.spriteTextureNavNeuron
		}
	};

	this.activeNavNeuronUniforms = {
		sizeMultiplier: {
			type: 'f',
			value: 4
		},
		opacity: {
			type: 'f',
			value: this.navNeuronOpacity
		},
		texture: {
			type: 't',
			value: this.spriteTextureActiveNavNeuron
		}
	};*/

	this.neuronAttributes = {
		color: {
			type: 'c',
			value: []
		},
		size: {
			type: 'f',
			value: []
		}
	};

/*	this.navNeuronAttributes = {
		color: {
			type: 'c',
			value: []
		},
		size: {
			type: 'f',
			value: []
		}
	};
*/

	this.neuronShaderMaterial = new THREE.ShaderMaterial( {
		uniforms: this.neuronUniforms,
		attributes: this.neuronAttributes,
		vertexShader: null,
		fragmentShader: null,
		blending: THREE.AdditiveBlending,
		transparent: true,
		depthTest: false
	});

/*	this.navNeuronShaderMaterial = new THREE.ShaderMaterial( {
		uniforms: this.navNeuronUniforms,
		attributes: this.navNeuronAttributes,
		vertexShader: null,
		fragmentShader: null,
		blending: THREE.AdditiveBlending,
		transparent: true,
		depthTest: false
	});

	this.activeNavNeuronShaderMaterial = new THREE.ShaderMaterial( {
		uniforms: this.activeNavNeuronUniforms,
		attributes: this.navNeuronAttributes,
		vertexShader: null,
		fragmentShader: null,
		blending: THREE.AdditiveBlending,
		transparent: true,
		depthTest: false
	});*/

	// info api
	this.numNeurons = 0;
	this.numAxons = 0;
	this.numSignals = 0;
	this.numPassive = 0;

	this.navItems = [
		{position: {x: -35.41, y: -23.49, z: -17.47}, label: 'Cloud based platform<br>Облачная платформа'},
		{position: {x: -33.06, y: 23.56, z: 28.03}, label: 'Swarm of robots<br>Управление группировками'},
		{position: {x: 28.38, y: 16.76, z: 72.06}, label: 'Методология<br>"Эффективное предприятие"'},
		{position: {x: 29.4, y: -8.57, z: -51.10}, label: 'Smart enterprise<br>ИСУ РВА'}
	];

	var navPointSvg = '<object type="image/svg+xml" data="img/hex.svg">Your browser does not support SVG</object>';

	this.navStructure = {
		navItem: {
			position: {},
			label: '',
			navLevel: 1,
			hasSubnav: true,
			subnav: {
				navItem: {
					position: {},
					label: '',
					hasSubnav: false,
					navLevel: 2
				},
				navItem: {
					position: {},
					label: '',
					hasSubnav: false,
					navLevel: 2
				},
				navItem: {
					position: {},
					label: '',
					hasSubnav: false,
					navLevel: 2
				},
			}
		}
	}

	this.navNeuronsCloud = new THREE.PointCloud(this.navNeuronsGeom, this.neuronShaderMaterial);

	// initialize NN
	this.initNeuralNetwork();

}

NeuralNetwork.prototype.initNeuralNetwork = function () {
	var vertices = OBJ_MODELS.brain.geometry.vertices;
	this.initNeurons( vertices, this.navItems );

	this.initAxons();

	this.neuronShaderMaterial.vertexShader = SHADER_CONTAINER.neuronVert;
	this.neuronShaderMaterial.fragmentShader = SHADER_CONTAINER.neuronFrag;

	this.axonShaderMaterial.vertexShader = SHADER_CONTAINER.axonVert;
	this.axonShaderMaterial.fragmentShader = SHADER_CONTAINER.axonFrag;

	this.initialized = true;

};

NeuralNetwork.prototype.createNavCloud = function(){

	this.navItems.forEach(function(item){
	
		var obj = new THREE.Object3D();
		
		obj.position.x = item.position.x;
		obj.position.y = item.position.y;
		obj.position.z = item.position.z;
		navNeurons.push(obj);

	});
	return navNeurons;
};

NeuralNetwork.prototype.initNeurons = function ( inputVertices, navItems ) {
	var i;
	var navNeurons = [];

	for (i = 0; i < inputVertices.length; i += this.settings.verticesSkipStep ) {
		var pos = inputVertices[ i ];
		var n = new Neuron( pos.x, pos.y, pos.z );
		
		this.components.neurons.push( n );
		this.neuronsGeom.vertices.push( n );
		// dont set neuron's property here because its skip vertices
	}

	for ( i = 0; i < navItems.length; i += 1) {

		var item = navItems[i];
		var n = new Neuron( item.position.x, item.position.y, item.position.z );

		n.isNavNeuron = true;
		this.components.neurons.push( n );
		this.navNeuronsGeom.vertices.push( n );

	}

	// neuron mesh
	this.neuronParticles = new THREE.PointCloud( this.neuronsGeom, this.neuronShaderMaterial );
	this.navNeuronParticles = new THREE.PointCloud( this.navNeuronsGeom, this.navNeuronShaderMaterial );
	this.meshComponents.add( this.neuronParticles );
	this.meshComponents.add( this.navNeuronParticles );

	// set neuron attributes value
	for ( i = 0; i < this.components.neurons.length; i++ ) {
		var pos = this.components.neurons[i];
		this.neuronAttributes.color.value[ i ] = new THREE.Color( '#ffffff' ); // initial neuron color
		this.neuronAttributes.size.value[ i ] = THREE.Math.randFloat( 1, 10.0 ); // initial neuron size
	}

	this.neuronShaderMaterial.needsUpdate = true;
	this.initLabels();

};

NeuralNetwork.prototype.initAxons = function () {

	var allNeuronsLength = this.components.neurons.length;

	for ( var j = 0; j < allNeuronsLength; j++ ) {
		var n1 = this.components.neurons[ j ];
		for ( var k = j + 1; k < allNeuronsLength; k++ ) {
			var n2 = this.components.neurons[ k ];
			// connect neuron if distance is within threshold and limit maximum connection per neuron
			if ( n1 !== n2 && n1.distanceTo( n2 ) < this.settings.maxAxonDist &&
				n1.connection.length < this.settings.maxConnectionsPerNeuron &&
				n2.connection.length < this.settings.maxConnectionsPerNeuron ) {
				var connectedAxon = n1.connectNeuronTo( n2 );
				this.constructAxonArrayBuffer( connectedAxon );
			}
		}
	}

	// enable WebGL 32 bit index buffer or get an error
	if ( !renderer.getContext().getExtension( "OES_element_index_uint" ) ) {
		console.error( "32bit index buffer not supported!" );
	}

	var axonIndices = new Uint32Array( this.axonIndices );
	var axonPositions = new Float32Array( this.axonPositions );
	var axonOpacities = new Float32Array( this.axonAttributes.opacity.value );

	this.axonGeom.addAttribute( 'index', new THREE.BufferAttribute( axonIndices, 1 ) );
	this.axonGeom.addAttribute( 'position', new THREE.BufferAttribute( axonPositions, 3 ) );
	this.axonGeom.addAttribute( 'opacity', new THREE.BufferAttribute( axonOpacities, 1 ) );
	this.axonGeom.computeBoundingSphere();

	this.axonShaderMaterial = new THREE.ShaderMaterial( {
		uniforms: this.axonUniforms,
		attributes: this.axonAttributes,
		vertexShader: null,
		fragmentShader: null,
		blending: THREE.AdditiveBlending,
		depthTest: false,
		transparent: true
	} );

	this.axonMesh = new THREE.Line( this.axonGeom, this.axonShaderMaterial, THREE.LinePieces );
	this.meshComponents.add( this.axonMesh );

	var numNotConnected = 0;
	for ( i = 0; i < allNeuronsLength; i++ ) {
		if ( !this.components.neurons[ i ].connection[ 0 ] ) {
			numNotConnected += 1;
		}
	}
	console.log( 'numNotConnected =', numNotConnected );

};

NeuralNetwork.prototype.initLabels = function() {
	var navItems = this.navItems;
	var canvas = document.getElementById('canvas-container');
	var item;
	for (i in navItems) {
		var text = document.createElement( 'div' );
		item = navItems[i];
		
		text.classList.add('nav-label');
		text.setAttribute('id', i);
		text.innerHTML = item.label;

    	document.body.insertBefore(text, canvas);

	}

	this.updateLabels();
};

NeuralNetwork.prototype.updateLabels = function() {
	var navItems = this.navItems;
	var canvas = document.getElementById('canvas-container');
	var item;
	var labelPadding = {
		top: -24,
		left: 24,
	}
	for (i in navItems) {
		var divObj = new THREE.Object3D();
		var text = document.querySelectorAll('.nav-label')[i];
		item = navItems[i];

		divObj.x = item.position.x;
		divObj.y = item.position.y;
		divObj.z = item.position.z;

		var res = this.toScreenPosition( divObj, camera );
		
		text.style.left = res.x + labelPadding.left + 'px';
		text.style.top = res.y + labelPadding.top + 'px';
	}
}

NeuralNetwork.prototype.update = function ( deltaTime ) {

	if ( !this.initialized ) return;

	var n;
	var ii;
	var currentTime = Date.now();
	//var curVector;
	//var prevVector;

	// update neurons state and release signal
	for ( ii = 0; ii < this.components.neurons.length; ii++ ) {

		n = this.components.neurons[ ii ];
		//curVector =  new THREE.Vector3(n.x, n.y, n.z);
		//prevVector = new THREE.Vector3(n.x, n.y, n.z);

		if (n.isNavNeuron) {
			//console.log(n.x, n.y);
		}

		if ( this.components.allSignals.length < this.settings.currentMaxSignals - this.settings.maxConnectionsPerNeuron ) { // limit total signals currentMaxSignals - maxConnectionsPerNeuron because allSignals can not bigger than particlePool size

			if ( n.receivedSignal && n.firedCount < 8) { // Traversal mode
				// if (n.receivedSignal && (currentTime - n.lastSignalRelease > n.releaseDelay) && n.firedCount < 8)  {	// Random mode
				n.lastSignalRelease = currentTime;
				n.releaseDelay = THREE.Math.randInt( 100, 1000 );
				this.releaseSignalAt( n );
			}

		}

		n.receivedSignal = false; // if neuron recieved signal but still in delay reset it
	}

	// reset all neurons and when there is no signal and trigger release signal at random neuron
	if ( this.components.allSignals.length === 0 ) {

		this.resetAllNeurons();
		this.releaseSignalAt( this.components.neurons[ THREE.Math.randInt( 0, this.components.neurons.length ) ] );

	}

	// update and remove dead signals
	for ( var j = this.components.allSignals.length - 1; j >= 0; j-- ) {
		var s = this.components.allSignals[ j ];
		s.travel( deltaTime );

		if ( !s.alive ) {
			s.particle.free();
			for ( var k = this.components.allSignals.length - 1; k >= 0; k-- ) {
				if ( s === this.components.allSignals[ k ] ) {
					this.components.allSignals.splice( k, 1 );
					break;
				}
			}
		}

	}

	this.updateLabels();

	// update particle pool vertices
	this.particlePool.update();

	// update info for GUI
	this.updateInfo();

};

NeuralNetwork.prototype.constructAxonArrayBuffer = function ( axon ) {
	this.components.allAxons.push( axon );
	var vertices = axon.vertices;

	for ( var i = 0; i < vertices.length; i++ ) {

		this.axonPositions.push( vertices[ i ].x, vertices[ i ].y, vertices[ i ].z );

		if ( i < vertices.length - 1 ) {
			var idx = this.axonNextPositionsIndex;
			this.axonIndices.push( idx, idx + 1 );

			var opacity = THREE.Math.randFloat( 0.005, 0.2 );
			this.axonAttributes.opacity.value.push( opacity, opacity );

		}

		this.axonNextPositionsIndex += 1;
	}
};

NeuralNetwork.prototype.releaseSignalAt = function ( neuron ) {
	var signals = neuron.createSignal( this.particlePool, this.settings.signalMinSpeed, this.settings.signalMaxSpeed );
	for ( var ii = 0; ii < signals.length; ii++ ) {
		var s = signals[ ii ];
		this.components.allSignals.push( s );
	}
};

NeuralNetwork.prototype.resetAllNeurons = function () {

	this.numPassive = 0;
	for ( var ii = 0; ii < this.components.neurons.length; ii++ ) { // reset all neuron state
		n = this.components.neurons[ ii ];

		if ( !n.fired ) {
			this.numPassive += 1;
		}

		n.reset();

	}
	// console.log( 'numPassive =', this.numPassive );

};

NeuralNetwork.prototype.updateInfo = function () {
	this.numNeurons = this.components.neurons.length;
	this.numAxons = this.components.allAxons.length;
	this.numSignals = this.components.allSignals.length;
};

NeuralNetwork.prototype.updateSettings = function () {

	this.neuronUniforms.opacity.value = this.neuronOpacity;

	for ( i = 0; i < this.components.neurons.length; i++ ) {
		this.neuronAttributes.color.value[ i ].setStyle( this.neuronColor ); // initial neuron color
		//this.navNeuronAttributes.color.value[ 0 ].setStyle( this.neuronColor ); // initial neuron color
	}

	/*for ( i = 0; i < navNeuronsPos.length; i++) {

		var pos = navNeuronsPos[i];

		//this.navNeuronAttributes.color.value[ i ].setStyle( this.neuronColor ); // initial neuron color
	}*/

	this.neuronAttributes.color.needsUpdate = true;
	this.navNeuronAttributes.color.needsUpdate = true;

	this.neuronUniforms.sizeMultiplier.value = this.neuronSizeMultiplier;

	this.axonUniforms.color.value.set( this.axonColor );
	this.axonUniforms.opacityMultiplier.value = this.axonOpacityMultiplier;

	this.particlePool.updateSettings();

};

NeuralNetwork.prototype.testChangOpcAttr = function () {

	var opcArr = this.axonGeom.attributes.opacity.array;
	for ( var i = 0; i < opcArr.length; i++ ) {
		opcArr[ i ] = THREE.Math.randFloat( 0, 0.5 );
	}
	this.axonGeom.attributes.opacity.needsUpdate = true;
};

NeuralNetwork.prototype.toScreenPosition = function (obj, camera) {
    var p3D = new THREE.Vector3(obj.x, obj.y, obj.z);
	var p2D = p3D.project(camera);

	p2D.x = (p2D.x + 1)/2 * window.innerWidth;
	p2D.y = - (p2D.y - 1)/2 * window.innerHeight;

    return { 
        x: p2D.x,
        y: p2D.y
    };

};

// Assets & Loaders --------------------------------------------------------

var loadingManager = new THREE.LoadingManager();
loadingManager.onLoad = function () {

	document.getElementById( 'loading' ).style.display = 'none'; // hide loading animation when finished
	console.log( 'Done.' );

	main();

};


loadingManager.onProgress = function ( item, loaded, total ) {

	console.log( loaded + '/' + total, item );

};


var shaderLoader = new THREE.XHRLoader( loadingManager );
shaderLoader.setResponseType( 'text' );

shaderLoader.loadMultiple = function ( SHADER_CONTAINER, urlObj ) {

	_.each( urlObj, function ( value, key ) {

		shaderLoader.load( value, function ( shader ) {

			SHADER_CONTAINER[ key ] = shader;

		} );

	} );

};

var SHADER_CONTAINER = {};
shaderLoader.loadMultiple( SHADER_CONTAINER, {

	neuronVert: 'shaders/neuron.vert',
	neuronFrag: 'shaders/neuron.frag',

	axonVert: 'shaders/axon.vert',
	axonFrag: 'shaders/axon.frag'

} );



var OBJ_MODELS = {};
var OBJloader = new THREE.OBJLoader( loadingManager );
OBJloader.load( 'models/brain_vertex_low.obj', function ( model ) {

	OBJ_MODELS.brain = model.children[ 0 ];

} );


var TEXTURES = {};
var textureLoader = new THREE.TextureLoader( loadingManager );

textureLoader.load( 'sprites/electric.png', function ( tex ) {
	TEXTURES.electric = tex;
} );

textureLoader.load( 'sprites/hex.png', function ( tex ) {
	TEXTURES.hex = tex;
} );

textureLoader.load( 'sprites/circle.png', function ( tex ) {
	TEXTURES.circle = tex;
} );
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

// Main --------------------------------------------------------
/* exported main, updateGuiInfo */

var gui, gui_info, gui_settings;

function main() {

	var neuralNet = window.neuralNet = new NeuralNetwork();
	scene.add( neuralNet.meshComponents );

	initGui();

	run();

}

// GUI --------------------------------------------------------
/* exported iniGui, updateGuiInfo */

function initGui() {

	gui = new dat.GUI();
	gui.width = 270;

	gui_info = gui.addFolder( 'Info' );
	gui_info.add( neuralNet, 'numNeurons' ).name( 'Neurons' );
	gui_info.add( neuralNet, 'numAxons' ).name( 'Axons' );
	gui_info.add( neuralNet, 'numSignals', 0, neuralNet.settings.limitSignals ).name( 'Signals' );
	gui_info.autoListen = false;

	gui_settings = gui.addFolder( 'Settings' );
	gui_settings.add( neuralNet.settings, 'currentMaxSignals', 0, neuralNet.settings.limitSignals ).name( 'Max Signals' );
	gui_settings.add( neuralNet.particlePool, 'pSize', 0.2, 2 ).name( 'Signal Size' );
	gui_settings.add( neuralNet.settings, 'signalMinSpeed', 0.0, 8.0, 0.01 ).name( 'Signal Min Speed' );
	gui_settings.add( neuralNet.settings, 'signalMaxSpeed', 0.0, 8.0, 0.01 ).name( 'Signal Max Speed' );
	gui_settings.add( neuralNet, 'neuronSizeMultiplier', 0, 2 ).name( 'Neuron Size Mult' );
	gui_settings.add( neuralNet, 'neuronOpacity', 0, 1.0 ).name( 'Neuron Opacity' );
	gui_settings.add( neuralNet, 'axonOpacityMultiplier', 0.0, 5.0 ).name( 'Axon Opacity Mult' );
	gui_settings.addColor( neuralNet.particlePool, 'pColor' ).name( 'Signal Color' );
	gui_settings.addColor( neuralNet, 'neuronColor' ).name( 'Neuron Color' );
	gui_settings.addColor( neuralNet, 'axonColor' ).name( 'Axon Color' );
	gui_settings.addColor( sceneSettings, 'bgColor' ).name( 'Background' );

	gui_info.open();
	gui_settings.open();

	for ( var i = 0; i < gui_settings.__controllers.length; i++ ) {
		gui_settings.__controllers[ i ].onChange( updateNeuralNetworkSettings );
	}

}

function updateNeuralNetworkSettings() {
	neuralNet.updateSettings();
	if ( neuralNet.settings.signalMinSpeed > neuralNet.settings.signalMaxSpeed ) {
		neuralNet.settings.signalMaxSpeed = neuralNet.settings.signalMinSpeed;
		gui_settings.__controllers[ 3 ].updateDisplay();
	}
}

function updateGuiInfo() {
	for ( var i = 0; i < gui_info.__controllers.length; i++ ) {
		gui_info.__controllers[ i ].updateDisplay();
	}
}

// Run --------------------------------------------------------

function update() {

	updateHelpers();

	if ( !sceneSettings.pause ) {

		var deltaTime = clock.getDelta();
		neuralNet.update( deltaTime );
		updateGuiInfo();

	}

}

// ----  draw loop
function run() {

	requestAnimationFrame( run );
	renderer.setClearColor( sceneSettings.bgColor, 1 );
	renderer.clear();
	update();
	renderer.render( scene, camera );
	stats.update();
	FRAME_COUNT ++;

}

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