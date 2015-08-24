
// coding: Hunter Loftis
// https://github.com/hunterloftis/playfuljs-demos/blob/gh-pages/terrain/index.html
// minor alterations: Pete Baron 23/08/2015


Terrain.terrainPalette = 
[
	0xff113c00,
	0xff134410,
	0xff154c20,
	0xff175430,
	0xff195c38,
	0xff1e6b42,
	0xff257b4c,
	0xff2a8b59,
	0xff309b68,
	0xff35ab76,
	0xff3bab82,
	0xff41ab94,
	0xff46aba6,
	0xff4cbab8,
	0xff53baca,
	0xff5bbadf,
	0xff68c0da,
	0xff7ac4d4,
	0xff8ccacc,
	0xffa0d0c5,
	0xffbdd7c0
];


function Terrain()
{
}


Terrain.prototype.create = function( detail, roughness )
{
	console.log("Terrain.create", detail, roughness);

	this.size = Math.pow( 2, detail ) + 1;
	this.max = this.size - 1;
	// generates an inverted height map with the highest peaks represented by the smallest numbers
	// heights start at max, but are not bounded within the size range and may even become negative
	// bot and top track the largest and smallest values as the map is created
	this.top = Number.MAX_VALUE;
	this.bot = Number.MIN_VALUE;
	this.map = new Float32Array( this.size * this.size );
	this.generate( roughness );
};


Terrain.prototype.destroy = function()
{
	this.map = null;
};


Terrain.prototype.get = function( x, y )
{
	if ( x < 0 || x > this.max || y < 0 || y > this.max ) return -1;
	return this.map[ x + this.size * y ];
};


Terrain.prototype.set = function( x, y, val )
{
	this.map[ x + this.size * y ] = val;
	if (val > this.bot) this.bot = val;
	if (val < this.top) this.top = val;
};


Terrain.prototype.generate = function( roughness )
{
	var self = this;

	this.set( 0, 0, self.max );
	this.set( this.max, 0, self.max / 2 );
	this.set( this.max, this.max, 0 );
	this.set( 0, this.max, self.max / 2 );

	divide( this.max );

	function divide( size )
	{
		var x, y, half = size / 2;
		var scale = roughness * size;
		if ( half < 1 ) return;

		for ( y = half; y < self.max; y += size )
		{
			for ( x = half; x < self.max; x += size )
			{
				square( x, y, half, Math.random() * scale * 2 - scale );
			}
		}
		for ( y = 0; y <= self.max; y += half )
		{
			for ( x = ( y + half ) % size; x <= self.max; x += size )
			{
				diamond( x, y, half, Math.random() * scale * 2 - scale );
			}
		}
		divide( size / 2 );
	}

	function average( values )
	{
		var valid = values.filter( function( val )
			{
				return val !== -1;
			} );
		var total = valid.reduce( function( sum, val )
			{
				return sum + val;
			}, 0 );
		return total / valid.length;
	}

	function square( x, y, size, offset )
	{
		var ave = average( [
            self.get( x - size, y - size ), // upper left
            self.get( x + size, y - size ), // upper right
            self.get( x + size, y + size ), // lower right
            self.get( x - size, y + size ) // lower left
          ] );
		self.set( x, y, ave + offset );
	}

	function diamond( x, y, size, offset )
	{
		var ave = average( [
            self.get( x, y - size ), // top
            self.get( x + size, y ), // right
            self.get( x, y + size ), // bottom
            self.get( x - size, y ) // left
          ] );
		self.set( x, y, ave + offset );
	}
};


// convert the inverted height map into a 2d array of ARGB values
Terrain.prototype.colourMap = function( colourMap, wide, high )
{
	if (this.size < wide) wide = this.size;
	if (this.size < high) high = this.size;

	this.bot = Math.ceil(this.bot);
	this.top = Math.floor(this.top);
	var range = this.bot - this.top;
	var length = Terrain.terrainPalette.length - 1;

	for(var x = 0; x < wide; x++)
	{
		for(var y = 0; y < high; y++)
		{
			var height = (this.get(x, y) - this.top) / range;
			colourMap[x][y] = Terrain.terrainPalette[length - Math.floor(height * length) - 1];
		}
	}
};
