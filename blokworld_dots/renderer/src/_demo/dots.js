/**
 *
 * the 'dots' demo
 *
 * code: Pete Baron 2015
 *
 */



Dots.MAX_EAT = 64.0;
Dots.CORPSE_FOOD = 16.0;
Dots.CHILD_ENERGY = 32.0;



function Dots( docId )
{
	console.log( "Dots c'tor: ", docId );

	// initialise
	this.list = null;
}



Dots.prototype.create = function( _numDots )
{
	console.log( "Dots.create" );

	// create the dots list
	this.list = [];

	// initialise all dots
	for ( var i = 0; i < _numDots; i++ )
	{
		// create a dot
		this.list[ i ] = new Dot(this);

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
};


Dots.prototype.update = function(_breed)
{
	for ( var i = this.list.length - 1; i >= 0; --i )
	{
		if ( this.list[ i ] )
			if ( !this.list[ i ].update(_breed) )
			{
				this.list.splice( i, 1 );
			}
	}

	return this.list.length;
};


Dots.prototype.createDot = function(_parent1, _parent2)
{
	var where = World.findAdjacentCreatureSpace(_parent1);
	if (!where) where = World.findAdjacentCreatureSpace(_parent2);
	if (where)
	{
		_parent1.energy -= Dots.CHILD_ENERGY;
		_parent2.energy -= Dots.CHILD_ENERGY;
		var r = Math.floor( Math.random() * ( 360 / 30 ) ) * 30 * Math.PI / 180;
		var c = Math.cos( r );
		var s = Math.sin( r );
		var speed = 0.25;
		var vx = c * speed;
		var vy = s * speed;
		var child = new Dot(this);
		if (!child.create( where.x, where.y, vx, vy ))
			return false;
		child.energy = Dots.CHILD_ENERGY;
		this.list.push(child);
	}
	return true;
};
