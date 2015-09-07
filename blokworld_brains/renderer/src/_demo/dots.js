/**
 *
 * the 'dots' demo
 *
 * code: Pete Baron 2015
 *
 */



Dots.MAX_EAT = 64.0;
Dots.CORPSE_FOOD = 16.0;
Dots.CHILD_ENERGY = 64.0;



function Dots( _world )
{
	console.log( "Dots c'tor" );

	// initialise
	this.world = _world;
	this.list = null;
	this.oldest = 0;
	this.average = 0;

	// breeding parameters
	this.mutateThreshold = 0.01;
	this.crossOverThreshold = 0.20;
	this.crossOverWeights = 0.20;
	this.zeroWeight = 0.001;
}



Dots.prototype.create = function( _numDots )
{
	console.log( "Dots.create", _numDots );

	// create the dots list
	this.list = [];

	// initialise all dots
	var i = _numDots;
	while(i--)
	{
		// create a dot
		this.list[ i ] = new Dot( this );

		// keep trying until we find an empty location in the world
		var x, y, vx, vy;
		var tries = 100;
		do {
			x = Math.random() * World.sizeX;
			y = Math.random() * World.sizeY;
			var r = Math.floor( Math.random() * ( 360 / 30 ) ) * 30 * Math.PI / 180;
			var c = Math.cos( r );
			var s = Math.sin( r );
			var speed = 0.25;
			vx = c * speed;
			vy = s * speed;

			flag = this.list[ i ].create( x, y, vx, vy );

			// time to give up on random if this world is nearly full
			if ( --tries < 0 && !flag )
			{
				var firstx = x;
				var firsty = y;
				search:
				{
					// search starting at the last random x,y location
					for ( ; x < World.sizeX; x++ )
					{
						for ( ; y < World.sizeY; y++ )
							if ( ( flag = this.list[ i ].create( x, y, vx, vy ) ) === true )
								break search;
						y = 0;
					}

					for ( x = 0; x < World.sizeX; x++ )
					{
						// back to starting point... we didn't find a slot
						if ( x > firstx || ( x == firstx && y >= firsty ) )
							break search;
						for ( y = 0; y < World.sizeY; y++ )
							if ( ( flag = this.list[ i ].create( x, y, vx, vy ) ) === true )
								break search;
					}
				}
				tries = 100;
			}
		} while ( !flag );
	}

	console.log( "Dots.create finished", this.list.length );
};


Dots.prototype.destroy = function()
{
	console.log( "Dots.destroy" );

	this.list = null;
	this.world = null;
};


Dots.prototype.update = function( _breed )
{
	var oldest = 0;
	var average = 0;
	var i = this.list.length;
	while(i--)
	{
		var dot = this.list[i];
		if ( dot )
		{
			if ( !dot.update( _breed ) )
			{
				this.list.splice( i, 1 );
			}
			else
			{
				if (dot.age > oldest)
					oldest = dot.age;
				average += dot.age;
			}
		}
	}

	this.oldest = oldest;
	this.average = average / this.list.length;
	return this.list.length;
};


Dots.prototype.createDot = function( _parent1, _parent2 )
{
	var where = this.world.findAdjacentCreatureSpace( _parent1 );
	if ( !where ) where = this.world.findAdjacentCreatureSpace( _parent2 );
	if ( where )
	{
		_parent1.energy -= Dots.CHILD_ENERGY;
		_parent2.energy -= Dots.CHILD_ENERGY;
		var r = Math.floor( Math.random() * ( 360 / 30 ) ) * 30 * Math.PI / 180;
		var c = Math.cos( r );
		var s = Math.sin( r );
		var speed = 0.25;
		var vx = c * speed;
		var vy = s * speed;
		var child = new Dot( this );
		if ( !child.create( where.x, where.y, vx, vy ) )
			return false;
		child.energy = Dots.CHILD_ENERGY;

		this.breedBrains( _parent1.brain, _parent2.brain, child.brain );

		this.list.push( child );
	}
	return true;
};


Dots.prototype.breedBrains = function( _brain1, _brain2, _child )
{
	for ( var bx = 0, xl = _brain1.boxes.length; bx < xl; bx++ )
	{
		this.breedBoxes( _brain1.boxes[ bx ], _brain2.boxes[ bx ], _child.boxes[ bx ] );
	}
};


Dots.prototype.breedBoxes = function( boxParent1, boxParent2, boxChild )
{
	for ( var nd = 0, nl = boxParent1.nodes.length; nd < nl; nd++ )
		this.breedNodes( boxParent1.nodes[ nd ], boxParent2.nodes[ nd ], boxChild.nodes[ nd ] );
};


Dots.prototype.breedNodes = function( nodeParent1, nodeParent2, nodeChild )
{
	var range;

	if ( Math.random() < this.mutateThreshold )
	{
		// set child node's threshold to new value
		nodeChild.threshold = Math.randRange( Brain.minThreshold, Brain.maxThreshold );
	}
	else if ( Math.random() < this.crossOverThreshold )
	{
		// copy parent2 node's threshold to child with mutation
		range = Brain.maxThreshold - Brain.minThreshold;
		nodeChild.threshold = nodeParent2.threshold + Math.random() * 0.250 * range - 0.125 * range;
		if ( nodeChild.threshold < Brain.minThreshold ) nodeChild.threshold = Brain.minThreshold;
		if ( nodeChild.threshold > Brain.maxThreshold ) nodeChild.threshold = Brain.maxThreshold;
	}
	else
	{
		// copy parent1 node's threshold to child
		nodeChild.threshold = nodeParent1.threshold;
	}

	var i = nodeChild.weightList.length;
	while(i--)
	{
		if ( Math.random() < this.zeroWeight )
		{
			// cancel this link by setting the weight to zero
			nodeChild.weightList[ i ] = 0;
		}
		else if ( Math.random() < this.crossOverWeights )
		{
			if ( nodeParent2.weightList[ i ] === 0 )
			{
				// if parent2 weight is zero, copy it to the child
				nodeChild.weightList[ i ] = 0;
			}
			else
			{
				// if parent2 weight is not zero, copy it to the child with mutation
				range = Brain.maxWeight - Brain.minWeight;
				nodeChild.weightList[ i ] = nodeParent2.weightList[ i ] + Math.random() * 0.100 * range - 0.050 * range;
				if ( nodeChild.weightList[ i ] < Brain.minWeight ) nodeChild.weightList[ i ] = Brain.minWeight;
				if ( nodeChild.weightList[ i ] > Brain.maxWeight ) nodeChild.weightList[ i ] = Brain.maxWeight;
			}
		}
		else
		{
			// copy parent1 weight to child
			nodeChild.weightList[ i ] = nodeParent1.weightList[ i ];
		}
	}
};


Dots.prototype.toJSON = function()
{
	return {
		mutateThreshold: this.mutateThreshold,
		crossOverThreshold: this.crossOverThreshold,
		crossOverWeights: this.crossOverWeights,
		zeroWeight: this.zeroWeight,
		list: this.list
	};
};