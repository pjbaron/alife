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
	for(var x = 0; x < _x; x++)
	{
		World.space[x] = [];
	}

	// create an image surface to draw on
	World.image = ctx.createImageData(World.sizeX, World.sizeY);
};


World.destroy = function()
{
	console.log("World.destroy");

	World.space = null;
	ctx.clearRect(0, 0, World.sizeX, World.sizeY);
	World.image = null;
};


World.draw = function()
{
	// redraw the image surface with the world contents
	var data32 = new Uint32Array(World.image.data.buffer);
	for(var x = 0; x < World.sizeX; x++)
	{
		var sx = World.space[x];
		for(var y = 0; y < World.sizeY; y++)
		{
			var thing = World.space[x][y];
			if (thing)
			{
				// it's an active dot, draw it
				data32[x + y * World.sizeX] = thing.colour;
			}
			else
			{
				// default to black
				data32[x + y * World.sizeX] = 0xff000000;
			}
		}
	}

	// copy the modified image surface to the display
	ctx.putImageData(World.image, 0, 0);
};

