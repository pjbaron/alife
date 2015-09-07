/**
 * Node.js
 *
 * A single perceptron style Node.
 * Each node has an accumulator which must be zeroed before processing.
 * If a Node's accumulator value >= threshold, it is enabled.
 * When a Node is enabled, each connection in the nodeList will be activated
 * and the weight of that connection will be added to the accumulator of its
 * destination Node.
 * With this forward connected design there is no difference between input,
 * mid-layer and output Nodes.
 *
 * NOTE: nodeList and weightList are parallel
 *
 */


function Node()
{
	this.threshold = 0;
	this.accumulate = 0;
	this.nodeList = null;
	this.weightList = null;
}


Node.prototype.create = function( _threshold )
{
	this.threshold = _threshold;
	this.accumulate = 0;
	this.nodeList = [];
	this.weightList = [];
};


Node.prototype.destroy = function()
{
	this.nodeList = null;
	this.weightList = null;
};


// return a duplicate of this Node
Node.prototype.clone = function()
{
	var node = new Node();
	node.create();
	node.copyData( this );
	node.copyLists( this );
	return node;
};


// copy the connections of the Node _from to this Node
Node.prototype.copyLists = function( _from )
{
	this.nodeList = [];
	this.weightList = [];
	for ( var i = 0, l = _from.nodeList.length; i < l; i++ )
	{
		this.nodeList[ i ] = _from.nodeList[ i ];
		this.weightList[ i ] = _from.weightList[ i ];
	}
};


// copy the threshold and accumulator of the Node _from to this Node
Node.prototype.copyData = function( _from )
{
	this.threshold = _from.threshold;
	this.accumulate = _from.accumulate;
};


// connect this Node to _nodeIndex and apply _weight to the connection
Node.prototype.connect = function( _nodeIndex, _weight )
{
	if ( this.nodeList.indexOf( _nodeIndex ) == -1 )
	{
		// fill gaps in the list before adding new links to the end
		var i = this.nodeList.indexOf( undefined );
		if ( i != -1 )
		{
			this.nodeList[ i ] = _nodeIndex;
			this.weightList[ i ] = _weight;
		}
		else
		{
			this.nodeList.push( _nodeIndex );
			this.weightList.push( _weight );
		}
	}
};


// process this Node's output through all of it's connections
Node.prototype.update = function( _nodes )
{
	// if this node is firing, propagate signals through all connections
	if ( this.accumulate >= this.threshold )
	{
		var i = -1, l = this.nodeList.length;
		while(++i < l)
		{
			_nodes[ this.nodeList[ i ] ].accumulate += this.weightList[ i ];
		}
	}
};


Node.prototype.toJSON = function()
{
	return {
		threshold: this.threshold,
		accumulate: this.accumulate,
		nodeList: this.nodeList,
		weightList: this.weightList
	};
};