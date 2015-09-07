/**
 * Box.js
 *
 * Each Box is a perceptron style Neural Network, composed of a number of Nodes.
 * On each 'update' all non-input Node accumulators are set to zero,
 * the Nodes are processed in list index order, with the list being set
 * to inputs, then layers of nodes, then outputs.  This enforces strict
 * forwards propogation and does not permit recurrent networks.
 * TODO: try changing this structure to something much more flexible, linked lists & follow links for X steps perhaps?
 * After all Nodes have been processed, the section of the list containing
 * the output nodes is duplicated and returned.
 *
 */



function Box()
{
	this.size = 0;
	this.inputs = 0;
	this.outputs = 0;
	this.nodes = null;
}


// create the NN in this Box entirely randomly
Box.prototype.create = function( _inputs, _outputs, _size )
{
	this.size = _size;
	this.inputs = _inputs;
	this.outputs = _outputs;

	this.nodes = [];
	for ( var i = 0; i < this.size; i++ )
	{
		var n = new Node();
		n.create( Math.randRange( Brain.minThreshold, Brain.maxThreshold ) );
		this.nodes.push( n );
	}
};


Box.prototype.destroy = function()
{
	if ( this.nodes )
		for ( var i = 0, l = this.nodes.length; i < l; i++ )
			this.nodes[ i ].destroy();
	this.nodes = null;
};


// create the NN in this Box according to the _connections list provided and
// the static values specified in the Brain class
// initially use random thresholds for all Nodes
Box.prototype.connect = function( _connections )
{
	var i, c, l, n;
	var range = Brain.maxWeight - Brain.minWeight;

	// connect each input to all the input connections
	for ( i = 0; i < this.inputs; i++ )
	{
		for ( c = 0; c < _connections[ 0 ].length; c++ )
		{
			this.nodes[ i ].connect( _connections[ 0 ][ c ], Math.randRange( Brain.minWeight, Brain.maxWeight ) );
		}
	}

	// connect each node in a layer to all the connections for that layer
	n = this.inputs;
	for ( l = 0; l < _connections.length - 1; l++ )
	{
		for ( i = 0; i < _connections[ l ].length; i++ )
		{
			for ( c = 0; c < _connections[ l + 1 ].length; c++ )
			{
				this.nodes[ n ].connect( _connections[ l + 1 ][ c ], Math.randRange( Brain.minWeight, Brain.maxWeight ) );
			}
			n++;
		}
	}

	// outputs are left with their random thresholds from the Box.create function
};


// set the inputs to the NN by copying _values to the input Node accumulators
Box.prototype.setInputs = function( _values )
{
	for ( var i = 0, l = Math.min( this.inputs, _values.length ); i < l; i++ )
	{
		this.nodes[ i ].accumulate = _values[ i ];
	}
};


// clear all Non-input accumulator values to zero
Box.prototype.clearAccumulators = function()
{
	for ( var i = this.inputs, l = this.nodes.length; i < l; i++ )
	{
		this.nodes[ i ].accumulate = 0;
	}
};


// process all Nodes in this Box and return the Outputs (shallow copy)
Box.prototype.update = function()
{
	this.clearAccumulators();

	var list = [];
	var i = -1, l = this.size - this.outputs;
	while(++i < l)
	{
		this.nodes[ i ].update( this.nodes );
	}

	// return the outputs from the box
	// NOTE: shallow copy of the output part of the array... can we instead return a reference to the array starting at the Nth element?
	return this.nodes.slice( this.nodes.length - this.outputs );
};


Box.prototype.toJSON = function()
{
	return {
		size: this.size,
		inputs: this.inputs,
		outputs: this.outputs,
		nodes: this.nodes
	};
};