/**
 *
 * a 'dot' object
 *
 * code: Pete Baron 2015
 *
 */


function Dot( _parent )
{
	this.parent = _parent;
	this.world = this.parent.world;

	this.x = this.ix = -1;
	this.y = this.iy = -1;
	this.vx = 0;
	this.vy = 0;
	this.energy = 0;
	this.brain = null;
	this.age = 0;
	this.terrain = 0;
	this.visionRange = 0;
}


Dot.prototype.create = function( _x, _y, _vx, _vy )
{
	this.x = _x;
	this.ix = this.x | 0;
	this.y = _y;
	this.iy = this.y | 0;

	// use the move function with no offsets to verify that x, y are within the world boundaries
	this.move( 0, 0 );

	if ( this.getWorld() )
		return false;

	this.vx = _vx;
	this.vy = _vy;

	this.energy = Math.random() * 200 + 55;
	this.brain = new Brain();

	// brains have three boxes, first is vision for food, second is vision for terrain, third is vision for dots
	// the second and third brain boxes can optionally override the output of the previous boxes
	this.brain.create( 3 );

	// set vision range to the number of inputs for the first brain box / 3
	// because we'll scan three separate lines at different angles
	this.visionRange = Math.floor( this.brain.boxes[ 0 ].inputs / 3 );

	this.setWorld( this );

	this.terrain = this.world.seeTerrain( this.x, this.y );

	return true;
};


Dot.prototype.destroy = function()
{
	this.brain.destroy();
	this.brain = null;

	if ( this.ix > -1 && this.iy > -1 )
	{
		this.setWorld( null );
	}

	this.x = this.ix = -1;
	this.y = this.iy = -1;
};


/**
 * update - intelligence and movement for a Dot
 *
 * @return {Boolean} false if this Dot just died
 */
Dot.prototype.update = function( _breed )
{
	// track my age (in updates)
	this.age++;

	// erase me from the world before movement
	this.setWorld( null );

	// move me after remembering where I was
	this.saveState();
	this.move( this.vx, this.vy );

	// if my new location is occupied
	var hit = this.getWorld();
	if ( hit )
	{
		// back up to my prior position
		this.restoreState();
		// react to collision (possible breeding)
		this.collisionResponse( hit, _breed );
	}

	var newTerrain = this.world.seeTerrain( this.x, this.y );

	// use extra energy when moving uphill
	if ( newTerrain > this.terrain )
	{
		this.energy -= 0.25;
	}

	// use lots of energy if I'm in the water
	if ( newTerrain === 0 )
	{
		this.energy -= 4.0;
	}

	// slowly use energy just existing (with random variation)
	// use more energy when getting old...
	this.energy -= Math.random() * 0.75 + 0.25 + this.age / 2000.0;

	// I ran out of energy... I'm dead!
	if ( this.energy <= 0 )
	{
		// corpses in water sink immediately
		if ( newTerrain !== 0 )
		{
			// drop my corpse into the world as 'energy'
			this.world.addFood( this.x, this.y, Dots.CORPSE_FOOD );
		}
		return false;
	}

	this.terrain = newTerrain;
	var angle = Math.atan2( this.vy, this.vx );

	// set up all inputs to my brain boxes
	var inputs = [];

	// create vision lists of food as inputs for box 0
	this.look( inputs, angle - 0.1, this.visionRange, this.world.seeFood );
	this.look( inputs, angle      , this.visionRange, this.world.seeFood );
	this.look( inputs, angle + 0.1, this.visionRange, this.world.seeFood );

	// be aware of terrain where I'm standing for box 1
	inputs.push( this.terrain );

	// look at terrain ahead
	this.look( inputs, angle - 0.1, 2, this.world.seeTerrain );
	this.look( inputs, angle      , 2, this.world.seeTerrain );
	this.look( inputs, angle + 0.1, 2, this.world.seeTerrain );

	// be aware of my own energy levels for box 2
	inputs.push( this.energy );

	// look at other dots in front
	this.look( inputs, angle - 0.1, 2, this.world.seeDot );
	this.look( inputs, angle      , 2, this.world.seeDot );
	this.look( inputs, angle + 0.1, 2, this.world.seeDot );

	// be aware of my facing direction (in degrees)
	// inputs.push( angle * 180.0 / Math.PI );

	// set the brain inputs
	this.brain.setInputs( inputs );
	// do braining
	this.brain.update();
	// turn according to brain boxes output
	var turn = this.brain.results[ 0 ][ 0 ].accumulate;		// default turn based on output 0 from box 0
	if ( this.brain.results[ 1 ][ 0 ].accumulate >= 1.0)	// if output 0 of box 1 is >= 1, overwrite the turn value
		turn = this.brain.results[ 1 ][ 1 ].accumulate;		// with output 1 of box 1
	if ( this.brain.results[ 2 ][ 0 ].accumulate >= 1.0)	// if output 0 of box 2 is >= 1, overwrite the turn value
		turn = this.brain.results[ 2 ][ 1 ].accumulate;		// with output 1 of box 2
	this.turn( turn );

	// eat food if there's any here
	this.energy = Math.min( this.energy + this.world.eatFood( this.x, this.y, Dots.MAX_EAT ), 255 );

	// add my dot back into the world
	this.setWorld( this );

	// I'm still alive...
	return true;
};


Dot.prototype.collisionResponse = function( _hit, _breed )
{
	// chance to breed based on population density (0.0 <= _breed <= 1.0)
	// weighted in favour of older population (proven survivability)
	if ( Math.max( Math.random() - Math.min( this.age / 1000.0, 1.0 ), 0 ) < _breed )
	{
		if ( this.energy >= Dots.CHILD_ENERGY * 2.0 && _hit.energy >= Dots.CHILD_ENERGY * 2.0 )
		{
			// TODO: genetic cross-over between this and _hit
			this.parent.createDot( this, _hit );
		}
	}
};


/**
 * Helper functions
 */

Dot.prototype.saveState = function()
{
	this.memX = this.x;
	this.memY = this.y;
};


Dot.prototype.restoreState = function()
{
	this.x = this.memX;
	this.ix = this.x | 0;
	this.y = this.memY;
	this.iy = this.y | 0;
};


Dot.prototype.move = function( _x, _y )
{
	this.x += _x;

	// wrap around at world boundaries
	while ( this.x < 0 ) this.x += World.sizeX;
	while ( this.x >= World.sizeX ) this.x -= World.sizeX;
	this.ix = this.x | 0;

	this.y += _y;

	// wrap around at world boundaries
	while ( this.y < 0 ) this.y += World.sizeY;
	while ( this.y >= World.sizeY ) this.y -= World.sizeY;
	this.iy = this.y | 0;
};


Dot.prototype.turn = function( _degrees )
{
	var r = _degrees * Math.PI / 180.0;
	var c = Math.cos( r );
	var s = Math.sin( r );
	var vx = this.vx * c - this.vy * s;
	var vy = this.vx * s + this.vy * c;
	this.vx = vx;
	this.vy = vy;
};


Dot.prototype.setWorld = function( _value )
{
	this.world.space[ this.ix ][ this.iy ] = _value;
};


Dot.prototype.getWorld = function()
{
	return this.world.space[ this.ix ][ this.iy ];
};


// append what I see onto _list
// always adds exactly _range items
Dot.prototype.look = function( _list, _angle, _range, _visionFunction )
{
	var see, i, l;

	var vision = this.lineTo( this.x + Math.cos( _angle ) * _range, this.y + Math.sin( _angle ) * _range );
	for ( i = 0, l = Math.min( vision.length, _range ); i < l; i++ )
	{
		see = _visionFunction.call( this.world, vision[ i ].x, vision[ i ].y );
		_list.push( see );
	}
	// if there aren't enough values pad out the input list by repeating the last thing seen
	while ( i++ < _range )
		_list.push( see );
};


// returns a line which starts at this.ix, iy and ends at x1, y1
Dot.prototype.lineTo = function( x1, y1 )
{
	var coordList = [];

	var x0 = this.ix;
	var y0 = this.iy;
	x1 |= 0;
	y1 |= 0;
	var dx = Math.abs( x1 - this.ix );
	var dy = Math.abs( y1 - this.iy );
	var sx = ( this.ix < x1 ) ? 1 : -1;
	var sy = ( this.iy < y1 ) ? 1 : -1;
	var err = dx - dy;

	while ( true )
	{
		coordList.push(
		{
			x: x0,
			y: y0
		} );

		if ( ( x0 == x1 ) && ( y0 == y1 ) )
			break;

		var e2 = 2 * err;
		if ( e2 > -dy )
		{
			err -= dy;
			x0 += sx;
		}

		if ( e2 < dx )
		{
			err += dx;
			y0 += sy;
		}
	}

	return coordList;
};


Dot.prototype.toJSON = function()
{
	return {
		x: this.x,
		ix: this.ix,
		y: this.y,
		iy: this.iy,
		vx: this.vx,
		vy: this.vy,
		energy: this.energy,
		age: this.age,
		terrain: this.terrain,
		brain: this.brain
	};
};