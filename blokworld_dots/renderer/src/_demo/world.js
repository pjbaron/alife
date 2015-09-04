/**
 *
 * the voxel space world
 * static class
 *
 * code: Pete Baron 2015
 * 
 */


var data32 = null;

World.sizeX = 0;
World.sizeY = 0;
World.space = null;
World.imageData = null;



function World()
{
}


World.create = function(_x, _y, _imageData)
{
	console.log("World.create", _x, "x", _y);

	// world size
	World.sizeX = _x;
	World.sizeY = _y;

	// world image data
	World.imageData = _imageData;
	data32 = new Uint32Array(World.imageData.buffer);
	
	// create the empty world creature space
	World.space = [];
	for(var x = 0; x < _x; x++)
	{
		World.space[x] = [];
	}
};


World.destroy = function()
{
	console.log("World.destroy");

	World.space = null;
	ctx.clearRect(0, 0, World.sizeX, World.sizeY);
	World.imageData = null;
};


World.update = function()
{
	// time to grow more food yet?
	var grow = ((pbPhaserRender.frameCount & 0x2f) === 0);

	var space = World.space;
	var sizeX = World.sizeX;

	// redraw the image surface with the world contents
	for(var x = 0; x < sizeX; x++)
	{
		var sx = space[x];
		for(var y = 0; y < World.sizeY; y++)
		{
			var thing = sx[y];
			var col = data32[x + y * sizeX];

			if (thing)
			{
				// it's an active dot, draw it (creatures use the 'a' channel)
				data32[x + y * sizeX] = (col & 0x00ffffff) | ((thing.energy << 24) & 0xff000000);
			}
			else
			{
				// it's inactive, clear the alpha bits to show there's no-one there
				data32[x + y * sizeX] &= 0x00ffffff;
			}

			if (grow)
			{
				// increase food in this square (food uses the 'g' channel)
				var food = (col + 0x00000100) & 0x0000ff00;
				// clamp it at maximum
				if (food === 0) food = 0x0000ff00;
				// recolour the square
				data32[x + y * sizeX] = (col & 0xffff00ff) | food;
			}
		}
	}
};


World.eatFood = function(_x, _y, _maxEat)
{
	var x = Math.floor(_x);
	var y = Math.floor(_y);
	var col = data32[x + y * World.sizeX];
	var food = (col & 0x0000ff00) >> 8;
	if (food > 0)
	{
		if (food > _maxEat)
		{
			data32[x + y * World.sizeX] = (col & 0xffff00ff) | ((food - _maxEat) << 8);
			return _maxEat;
		}

		data32[x + y * World.sizeX] = col & 0xffff00ff;
		return food;
	}
	return 0;
};


World.addFood = function(_x, _y, _amount)
{
	var x = Math.floor(_x);
	var y = Math.floor(_y);
	var col = data32[x + y * World.sizeX];

	// increase food in this square (food uses the 'g' channel)
	var foodBefore = (col & 0x0000ff00) >> 8;
	var foodNow = foodBefore + _amount;
	// clamp it at maximum
	if (foodNow > 0xff) foodNow = 0xff;
	// recolour the square
	data32[x + y * World.sizeX] = (col & 0xffff00ff) | (foodNow << 8);
};


World.findAdjacentCreatureSpace = function(_loc)
{
	var x = Math.floor(_loc.x);
	var y = Math.floor(_loc.y);
	var col;

	if (x < World.sizeX - 1)
	{
		col = data32[x + 1 + y * World.sizeX];
		if ((col & 0xff000000) === 0) return { x: x + 1, y: y };
		if (y < World.sizeY - 1)
		{
			col = data32[x + 1 + (y + 1) * World.sizeX];
			if ((col & 0xff000000) === 0) return { x: x + 1, y: y + 1 };
		}
		if (y > 0)
		{
			col = data32[x + 1 + (y - 1) * World.sizeX];
			if ((col & 0xff000000) === 0) return { x: x + 1, y: y - 1 };
		}
	}

	if (x > 0)
	{
		col = data32[x - 1 + y * World.sizeX];
		if ((col & 0xff000000) === 0) return { x: x - 1, y: y };
		if (y < World.sizeY - 1)
		{
			col = data32[x - 1 + (y + 1) * World.sizeX];
			if ((col & 0xff000000) === 0) return { x: x - 1, y: y + 1 };
		}
		if (y > 0)
		{
			col = data32[x - 1 + (y - 1) * World.sizeX];
			if ((col & 0xff000000) === 0) return { x: x - 1, y: y - 1 };
		}
	}

	if (y < World.sizeY - 1)
	{
		col = data32[x + (y + 1) * World.sizeX];
		if ((col & 0xff000000) === 0) return { x: x, y: y + 1 };
	}

	if (y > 0)
	{
		col = data32[x + (y - 1) * World.sizeX];
		if ((col & 0xff000000) === 0) return { x: x, y: y - 1 };
	}

	return null;
};

