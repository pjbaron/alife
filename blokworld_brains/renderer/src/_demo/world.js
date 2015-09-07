/**
 *
 * the voxel space world
 * static class
 *
 * code: Pete Baron 2015
 *
 */


World.sizeX = 0;
World.sizeY = 0;
World.imageData = null;



function World()
{
	this.space = null;
	this.data32 = null;
}


World.prototype.create = function( _x, _y, _imageData )
{
	console.log( "World.create", _x, "x", _y );

	// world size
	World.sizeX = _x;
	World.sizeY = _y;

	// world image data
	World.imageData = _imageData;
	this.data32 = new Uint32Array( World.imageData.buffer );

	// create the empty world creature space
	this.space = [];
	for ( var x = 0; x < _x; x++ )
	{
		this.space[ x ] = [];
	}
};


World.prototype.destroy = function()
{
	console.log( "World.destroy" );

	this.space = null;
	ctx.clearRect( 0, 0, World.sizeX, World.sizeY );
	World.imageData = null;
};


World.prototype.update = function()
{
	// lots of food at the very start to help initial random population survive
	// $9f makes it a bit seasonal with periods of famine vs plenty
	var grow = (pbPhaserRender.frameCount < 1000) || ( ( pbPhaserRender.frameCount & 0x09f ) === 0 );

	var sizeX = World.sizeX;
	
	// redraw the image surface with the world contents
	var x = sizeX;
	while(x--)
	{
		var sx = this.space[ x ];
		var y = World.sizeY;
		while(y--)
		{
			var thing = sx[ y ];
			var col = this.data32[ x + y * sizeX ];

			if ( thing )
			{
				// it's an active dot, draw it (creatures use the 'a' channel)
				this.data32[ x + y * sizeX ] = ( col & 0x00ffffff ) | ( ( thing.energy << 24 ) & 0xff000000 );
			}
			else
			{
				// it's inactive, clear the alpha bits to show there's no-one there
				this.data32[ x + y * sizeX ] &= 0x00ffffff;
			}

			if ( grow && ( col & 0x000000ff ) > 0 )
			{
				// increase food in this square (food uses the 'g' channel)
				var food = ( col + 0x00000100 ) & 0x0000ff00;
				// clamp it at maximum
				if ( food === 0 ) food = 0x0000ff00;
				// recolour the square
				this.data32[ x + y * sizeX ] = ( col & 0xffff00ff ) | food;
			}
		}
	}
};


World.prototype.seeFood = function( _x, _y )
{
	var x = Math.floor( _x );
	if ( x < 0 ) x = World.sizeX - 1;
	if ( x >= World.sizeX ) x = 0;

	var y = Math.floor( _y );
	if ( y < 0 ) y = World.sizeY - 1;
	if ( y > World.sizeY ) y = 0;

	var col = this.data32[ x + y * World.sizeX ];
	var food = ( col & 0x0000ff00 ) >> 8;
	return food;
};


World.prototype.seeTerrain = function( _x, _y )
{
	var x = Math.floor( _x );
	if ( x < 0 ) x = World.sizeX - 1;
	if ( x >= World.sizeX ) x = 0;

	var y = Math.floor( _y );
	if ( y < 0 ) y = World.sizeY - 1;
	if ( y > World.sizeY ) y = 0;

	var terrain = ( this.data32[ x + y * World.sizeX ] & 0x000000ff );
	return terrain;
};


World.prototype.seeDot = function( _x, _y )
{
	var x = Math.floor( _x );
	if ( x < 0 ) x = World.sizeX - 1;
	if ( x >= World.sizeX ) x = 0;

	var y = Math.floor( _y );
	if ( y < 0 ) y = World.sizeY - 1;
	if ( y > World.sizeY ) y = 0;

	var col = this.data32[ x + y * World.sizeX ];
	var energy = ( col & 0xff000000 ) >> 24;
	return energy;
};


World.prototype.eatFood = function( _x, _y, _maxEat )
{
	var x = Math.floor( _x );
	var y = Math.floor( _y );
	var col = this.data32[ x + y * World.sizeX ];
	var food = ( col & 0x0000ff00 ) >> 8;
	if ( food > 0 )
	{
		if ( food > _maxEat )
		{
			this.data32[ x + y * World.sizeX ] = ( col & 0xffff00ff ) | ( ( food - _maxEat ) << 8 );
			return _maxEat;
		}

		this.data32[ x + y * World.sizeX ] = col & 0xffff00ff;
		return food;
	}
	return 0;
};


World.prototype.addFood = function( _x, _y, _amount )
{
	var x = Math.floor( _x );
	var y = Math.floor( _y );
	var col = this.data32[ x + y * World.sizeX ];

	// increase food in this square (food uses the 'g' channel)
	var foodBefore = ( col & 0x0000ff00 ) >> 8;
	var foodNow = foodBefore + _amount;
	// clamp it at maximum
	if ( foodNow > 0xff ) foodNow = 0xff;
	// recolour the square
	this.data32[ x + y * World.sizeX ] = ( col & 0xffff00ff ) | ( foodNow << 8 );
};


World.prototype.findAdjacentCreatureSpace = function( _loc )
{
	var x = Math.floor( _loc.x );
	var y = Math.floor( _loc.y );
	var col;

	if ( x < World.sizeX - 1 )
	{
		col = this.data32[ x + 1 + y * World.sizeX ];
		if ( ( col & 0xff000000 ) === 0 ) return {
			x: x + 1,
			y: y
		};
		if ( y < World.sizeY - 1 )
		{
			col = this.data32[ x + 1 + ( y + 1 ) * World.sizeX ];
			if ( ( col & 0xff000000 ) === 0 ) return {
				x: x + 1,
				y: y + 1
			};
		}
		if ( y > 0 )
		{
			col = this.data32[ x + 1 + ( y - 1 ) * World.sizeX ];
			if ( ( col & 0xff000000 ) === 0 ) return {
				x: x + 1,
				y: y - 1
			};
		}
	}

	if ( x > 0 )
	{
		col = this.data32[ x - 1 + y * World.sizeX ];
		if ( ( col & 0xff000000 ) === 0 ) return {
			x: x - 1,
			y: y
		};
		if ( y < World.sizeY - 1 )
		{
			col = this.data32[ x - 1 + ( y + 1 ) * World.sizeX ];
			if ( ( col & 0xff000000 ) === 0 ) return {
				x: x - 1,
				y: y + 1
			};
		}
		if ( y > 0 )
		{
			col = this.data32[ x - 1 + ( y - 1 ) * World.sizeX ];
			if ( ( col & 0xff000000 ) === 0 ) return {
				x: x - 1,
				y: y - 1
			};
		}
	}

	if ( y < World.sizeY - 1 )
	{
		col = this.data32[ x + ( y + 1 ) * World.sizeX ];
		if ( ( col & 0xff000000 ) === 0 ) return {
			x: x,
			y: y + 1
		};
	}

	if ( y > 0 )
	{
		col = this.data32[ x + ( y - 1 ) * World.sizeX ];
		if ( ( col & 0xff000000 ) === 0 ) return {
			x: x,
			y: y - 1
		};
	}

	return null;
};