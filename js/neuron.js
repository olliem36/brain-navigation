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
