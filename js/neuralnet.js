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
		var navPointSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		var text = document.createElement( 'div' );
		item = navItems[i];

		navPointSvg.classList.add('nav-point');
		navPointSvg.setAttribute('width', '320');
		navPointSvg.setAttribute('height', '300');
		navPointSvg.setAttribute('data-id', i);
		navPointSvg.innerHTML = '<polygon class="hex" stroke-width="10" fill="none" stroke="rgba(255,255,255,0)" points="310,150 235,280 85,280 10,150 85,20 235,20"></polygon><circle class="circle" cx="160" cy="150" r="90" fill="rgba(255,255,255,0.7)" />'
		
		text.classList.add('nav-label');
		text.setAttribute('data-id', i);
		text.innerHTML = item.label;

    	document.body.insertBefore(text, canvas);
    	document.body.insertBefore(navPointSvg, text);

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
		var svg = document.querySelectorAll('.nav-point')[i];
		var text = document.querySelectorAll('.nav-label')[i];

		item = navItems[i];

		divObj.x = item.position.x;
		divObj.y = item.position.y;
		divObj.z = item.position.z;

		var res = this.toScreenPosition( divObj, camera );

		svg.style.position = 'absolute';
		svg.style.left = res.x + 'px';
		svg.style.top = res.y + 'px';		
		svg.style.transform = 'scale(0.1,0.1)';
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
