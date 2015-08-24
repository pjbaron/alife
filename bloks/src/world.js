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
World.space = null;
World.image = null;


function World()
{
}


World.create = function(_x, _y)
{
	console.log("World.create", _x, "x", _y);

	// world size
	World.sizeX = _x;
	World.sizeY = _y;

	// create the empty world creature space
	World.space = [];
	// and the world terrain map
	World.terrain = [];
	for(var x = 0; x < _x; x++)
	{
		World.space[x] = [];
		World.terrain[x] = [];
	}

	// create an image surface to draw on
	World.image = ctx.createImageData(World.sizeX, World.sizeY);
};


World.destroy = function()
{
	console.log("World.destroy");

	World.space = null;
	World.terrain = null;
	ctx.clearRect(0, 0, World.sizeX, World.sizeY);
	World.image = null;
};


World.draw = function()
{
	// redraw the image surface with the world contents
	var data32 = new Uint32Array(World.image.data.buffer);
	for(var x = 0; x < World.sizeX; x++)
	{
		for(var y = 0; y < World.sizeY; y++)
		{
			var terrain = World.terrain[x][y];
			data32[x + y * World.sizeX] = terrain;

			var thing = World.space[x][y];
			if (thing)
			{
				if (thing instanceof Dot)
				{
					// it's an active dot, draw it
					data32[x + y * World.sizeX] = thing.colour;
				}
			}
		}
	}

	// copy the modified image surface to the display
	ctx.putImageData(World.image, 0, 0);
};


function FadeCol(col, speed)
{
	var b = col & 0xff0000;
	if (b) b -= (speed << 16);
	if (b < 0) b = 0;
	b &= 0xff0000;

	var g = col & 0x00ff00;
	if (g) g -= (speed << 8);
	if (g < 0) g = 0;
	g &= 0x00ff00;

	var r = col & 0x0000ff;
	if (r) r -= speed;
	if (r < 0) r = 0;

	return r | g | b;
}

