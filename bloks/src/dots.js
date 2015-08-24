/**
 *
 * the 'dots' demo
 *
 * code: Pete Baron 2015
 * 
 */



function Dots( docId )
{
	console.log("Dots c'tor: ", docId);

	// initialise
	this.list = null;
	this.numDots = 0;
}



Dots.prototype.create = function(_numDots)
{
	console.log("Dots.create");
	this.numDots = _numDots;

	// create the dots list
	this.list = [];

	// initialise all dots
	for(var i = 0; i < this.numDots; i++)
	{
		// create a dot
		this.list[i] = new Dot();

		// keep trying until we find an empty location in the world
		var x, y, vx, vy;
		var tries = 100;
		do{
			x = Math.random() * World.sizeX;
			y = Math.random() * World.sizeY;
			var r = Math.floor(Math.random() * (360 / 30)) * 30 * Math.PI / 180;
			var c = Math.cos(r);
			var s = Math.sin(r);
			var speed = 0.25;
			vx = c * speed;
			vy = s * speed;

			flag = this.list[i].create(x, y, vx, vy);

			// time to give up on random if this world is nearly full
			if (--tries < 0 && !flag)
			{
				var firstx = x;
				var firsty = y;
search: 		{
					// search starting at the last random x,y location
					for(; x < World.sizeX; x++)
					{
						for(; y < World.sizeY; y++)
							if ((flag = this.list[i].create(x, y, vx, vy)) === true)
								break search;
						y = 0;
					}

					for(x = 0; x < World.sizeX; x++)
					{
						// back to starting point... we didn't find a slot
						if (x > firstx || (x == firstx && y >= firsty))
							break search;
						for(y = 0; y < World.sizeY; y++)
							if ((flag = this.list[i].create(x, y, vx, vy)) === true)
								break search;
					}
				}
				tries = 100;
			}
		}while(!flag);
	}

	console.log("Dots.create finished", this.list.length);
};


Dots.prototype.destroy = function()
{
	console.log("Dots.destroy");

	this.list = null;
};


Dots.prototype.update = function()
{
	for(var i = 0, l = this.list.length; i < l; i++)
	{
		if (this.list[i])
			this.list[i].update();
	}
};



