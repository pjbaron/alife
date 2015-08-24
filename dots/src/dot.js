/**
 * 
 * a 'dot' object
 * 
 * code: Pete Baron 2015
 * 
 */


var colourTemperatures =
[
	0xff600200,
	0xffae0200,
	0xfff40000,
	0xfffe1212,
	0xfffe383a,
	0xfffe5e5e,
	0xfffe7272,
	0xfffe8e8e,
	0xfffeaaaa,
	0xfffebcbc,
	0xfffed8d8,
	0xfffef4f4,
	0xffecfefe,
	0xff9cf8fc,
	0xff40eefa,
	0xff12eaf8,
	0xff0cdcfa,
	0xff04ccfc,
	0xff02bafe,
	0xff027efe,
	0xff00002e,
	0xff000070,
	0xff0200c2,
	0xff0008fe,
	0xff0034fe
];


function Dot()
{
	this.x = this.ix = -1;
	this.y = this.iy = -1;
	this.vx = 0;
	this.vy = 0;
	this.temperature = 0;
	this.colour = 0;
}


Dot.prototype.create = function(_x, _y, _vx, _vy)
{
	this.x = _x;
	this.ix = this.x | 0;
	this.y = _y;
	this.iy = this.y | 0;

	if (this.getWorld())
		return false;

	this.vx = _vx;
	this.vy = _vy;

	this.temperature = 50;
	this.colour = this.getColour(100);

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


Dot.prototype.update = function()
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
		this.collisionResponse(hit);
	}
	else
	{
		// cool off at rate of 1/8th (0.125) current temperature per tick
		this.temperature = (this.temperature * 7 + 0) * 0.125;
	}

	this.colour = this.getColour(100);

	// add this dot back into the world
	this.setWorld(this);
};


Dot.prototype.collisionResponse = function(_hit)
{
	var t = this.temperature;
	// transfer my momentum to whatever I hit
	_hit.vx = this.vx;
	_hit.vy = this.vy;
	// make me turn right a bit
	this.turn(30.0);
	// increase my temperature
	this.temperature = Math.min(100, this.temperature + 16);
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
	this.y += _y;

	// wrap around at world boundaries
	if (this.x < 0) this.x += World.sizeX;
	else if (this.x >= World.sizeX) this.x -= World.sizeX;
	this.ix = this.x | 0;

	if (this.y < 0) this.y += World.sizeY;
	else if (this.y >= World.sizeY) this.y -= World.sizeY;
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


Dot.prototype.getColour = function(_range)
{
	var i = (this.temperature / _range * (colourTemperatures.length - 1)) | 0;
	return colourTemperatures[i];
};
