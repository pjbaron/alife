/**
 * Brain.js
 *
 * This class manages a set of 'boxes' each of which is a perceptron style Neural Network
 *
 * The NN generally starts off with each layer fully connected to the next.
 * Modification of the connection 'weights' can remove unused connections.
 * TODO: this approach may be needlessly computationally expensive, try using less connections with connection growth as a possibility.
 *
 */


Brain.minThreshold = -256.0;
Brain.maxThreshold = 1024.0;
Brain.minWeight = -128.0;
Brain.maxWeight = 255.0;

Brain.boxDescriptions =
[
	{
		inputs: 9,
		layerSize: [ 12, 6 ],
		outputs: 1
	},
	{
		inputs: 7,
		layerSize: [ 10, 4 ],
		outputs: 2
	},
	{
		inputs: 7,
		layerSize: [ 10, 4 ],
		outputs: 2
	}
 ];


// Brain.connections =
// [
// 	// all inputs connected to 8 in layer 0
// 	// all layer 0 connected to 4 in layer 1
// 	// all layer 1 connected to the output
// 	[ 8, 9, 10, 11, 12, 13, 14, 15],
// 	[16, 17, 18, 19],
// 	[20]
// ];



function Brain()
{
	this.boxes = null;
	this.results = null;
}


Brain.prototype.create = function( _boxes )
{
	var j;

	this.results = null;
	this.boxes = [];

	for ( var i = 0; i < _boxes; i++ )
	{
		// calculate total size of box in Nodes, and create the connections structure
		var c = Brain.boxDescriptions[ i ].inputs;
		var connections = [];
		var size = Brain.boxDescriptions[ i ].inputs + Brain.boxDescriptions[ i ].outputs;
		for ( j = 0; j < Brain.boxDescriptions[ i ].layerSize.length; j++ )
		{
			size += Brain.boxDescriptions[ i ].layerSize[ j ];
			connections[ j ] = [];
			for ( k = 0; k < Brain.boxDescriptions[ i ].layerSize[ j ]; k++ )
				connections[ j ].push( c++ );
		}
		connections[ j ] = [];
		for ( k = 0; k < Brain.boxDescriptions[ i ].outputs; k++ )
			connections[ j ].push( c++ );

		var b = new Box();
		b.create( Brain.boxDescriptions[ i ].inputs, Brain.boxDescriptions[ i ].outputs, size );
		b.connect( connections );
		this.boxes.push( b );
	}
};


Brain.prototype.destroy = function()
{
	this.results = null;
	if ( this.boxes )
		for ( var i = 0, l = this.boxes.length; i < l; i++ )
			this.boxes[ i ].destroy();
	this.boxes = null;
};


// set inputs for all boxes using the _values list
Brain.prototype.setInputs = function( _values )
{
	// clone the _values list
	var list = _values.slice();

	var b = -1, l = this.boxes.length;
	while(++b < l)
	{
		this.boxes[ b ].setInputs( list );
		// chop off the input values we just used
		list.splice( 0, this.boxes[ b ].inputs );
	}
};


Brain.prototype.update = function()
{
	// TODO: deal with boxes overlapping, allow cross-communications between boxes
	this.results = [];
	var i = -1, l = this.boxes.length;
	while(++i < l)
	{
		this.results.push( this.boxes[ i ].update() );
	}
};


Brain.prototype.toJSON = function()
{
	return {
		boxes: this.boxes,
		results: this.results
	};
};