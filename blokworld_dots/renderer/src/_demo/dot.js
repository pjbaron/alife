/**
 * 
 * a 'dot' object
 * 
 * code: Pete Baron 2015
 * 
 */


function Dot(_parent)
{
	this.parent = _parent;
	this.x = this.ix = -1;
	this.y = this.iy = -1;
	this.vx = 0;
	this.vy = 0;
	this.energy = 0;
}


Dot.prototype.create = function(_x, _y, _vx, _vy)
{
	this.x = _x;
	this.ix = this.x | 0;
	this.y = _y;
	this.iy = this.y | 0;

	// use the move function with no offsets to verify that x, y are within the world boundaries
	this.move(0, 0);

	if (this.getWorld())
		return false;

	this.vx = _vx;
	this.vy = _vy;

	this.energy = Math.random() * 200 + 55;

	this.setWorld( this );

	return true;
};


Dot.prototype.destroy = function()
{
	if (this.ix > -1 && this.iy > -1)
	{
		if (this.getWorld() === this)
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
Dot.prototype.update = function(_breed)
{
	// erase this dot
	this.setWorld( null );

	// move it
	this.saveState();
	this.move(this.vx, this.vy);

	// if new location is occupied
	var hit = this.getWorld();
	if (hit)
	{
		// back up to prior position
		this.restoreState();
		// react to collision
		this.collisionResponse(hit, _breed);
	}

	// eat food if there's any here
	this.energy += World.eatFood(this.x, this.y, Dots.MAX_EAT);
	if (this.energy > 255) this.energy = 255;

	// use energy over time (with random variation)
	if (this.energy > 0) this.energy -= Math.random() * 0.75 + 0.25;
	// ran out of energy... dead!
	if (this.energy <= 0)
	{
		// drop my corpse into the world as 'energy'
		World.addFood(this.x, this.y, Dots.CORPSE_FOOD);
		return false;	
	}

	// add this dot back into the world
	this.setWorld(this);
	return true;
};


Dot.prototype.collisionResponse = function(_hit, _breed)
{
	// transfer my momentum to whatever I hit
	_hit.vx = this.vx;
	_hit.vy = this.vy;
	// make me turn right a bit
	this.turn(30.0);

	if (_breed)
	{
		if (this.energy >= Dots.CHILD_ENERGY * 2.0 && _hit.energy >= Dots.CHILD_ENERGY * 2.0)
		{
			// TODO: genetic cross-over between this and _hit
			this.parent.createDot(this, _hit);
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


Dot.prototype.move = function(_x, _y)
{
	this.x += _x;

	// wrap around at world boundaries
	while (this.x < 0) this.x += World.sizeX;
	while (this.x >= World.sizeX) this.x -= World.sizeX;
	this.ix = this.x | 0;

	this.y += _y;

	// wrap around at world boundaries
	while (this.y < 0) this.y += World.sizeY;
	while (this.y >= World.sizeY) this.y -= World.sizeY;
	this.iy = this.y | 0;
};


Dot.prototype.turn = function(_degrees)
{
	var r = _degrees * Math.PI / 180.0;
	var c = Math.cos(r);
	var s = Math.sin(r);
	var vx = this.vx * c - this.vy * s;
	var vy = this.vx * s + this.vy * c;
	this.vx = vx;
	this.vy = vy;
};


Dot.prototype.setWorld = function(_value)
{
	World.space[this.ix][this.iy] = _value;
};


Dot.prototype.getWorld = function()
{
	return World.space[this.ix][this.iy];
};


