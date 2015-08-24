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
	this.y = _y;
	this.integerPosition();

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
	// erase this dot and leave a trail behind
	this.setWorld( 0xff000000 + trailColour );

	// move it
	this.saveState();
	this.move(this.vx, this.vy);

	// if new location is occupied
	var hit = this.getWorld();
	if (hit instanceof Dot)
	{
		// back up to prior position
		this.restoreState();
		// react to collision
		this.collisionResponse(hit);
	}
	else
	{
		this.temperature = (this.temperature * 7 + 0) * 0.125;
	}

	this.colour = this.getColour(100);

	// add this dot back into the world
	this.setWorld(this);
};


function ellipseRadius(ax, by, facing, angle)
{
	// find difference in angles so we can use non-rotated ellipse equations
	var t = angle - facing;
	while (t < -Math.PI / 2) t += Math.PI;
	while (t >= Math.PI / 2) t -= Math.PI;
	var s = Math.sin(t);
	var c = Math.cos(t);

	// equation from: http://math.stackexchange.com/questions/432902/how-to-get-the-radius-of-an-ellipse-at-a-specific-angle-by-knowing-its-semi-majo
	// r = (a.b) / sqrt(sqr(a).sqr(sin(theta)) + sqr(b).sqr(cos(theta)))
	var r = ax * by / Math.sqrt(ax * ax * s * s + by * by * c * c);
	return r;
}


Dot.prototype.collisionResponse = function(_hit)
{
	var t = this.temperature;
	_hit.vx = this.vx;
	_hit.vy = this.vy;
	this.turn(30.0);
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
	this.y = this.memY;
	this.integerPosition();
};


Dot.prototype.move = function(_x, _y)
{
	this.x += _x;
	this.y += _y;

	// wrap around at world boundaries
	if (this.x < 0) this.x += World.sizeX;
	if (this.x >= World.sizeX) this.x -= World.sizeX;
	if (this.y < 0) this.y += World.sizeY;
	if (this.y >= World.sizeY) this.y -= World.sizeY;

	this.integerPosition();
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


Dot.prototype.integerPosition = function()
{
	this.ix = Math.floor(this.x);
	this.iy = Math.floor(this.y);
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
	var i = Math.floor(this.temperature / _range * (colourTemperatures.length - 1));
	return colourTemperatures[i];
};
