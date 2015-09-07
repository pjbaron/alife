/**
 * alife.js
 *
 * 23/08/2015 Pete Baron
 * 
 */



function Alife()
{
	this.tick = 0;
	this.percentFull = 2.0;
	this.desiredPopulation = 0;

	this.dots = null;
	this.numDots = 0;
	this.world = null;

	this.numCtrl = null;
	this.dotsCtrl = null;
}


Alife.prototype.create = function(_worldWide, _worldHigh, _worldImage)
{
	this.world = new World();
	this.world.create(_worldWide, _worldHigh, _worldImage);

	// dat.GUI controlled variables and callbacks
	var _this = this;
	this.numCtrl = gui.add(this, "percentFull").min(0.1).max(20.0).step(0.1);
	this.numCtrl.onFinishChange(function(value) { if (!value) _this.percentFull = 1; _this.restart(); });

	this.desiredPopulation = this.numDots = Math.floor(World.sizeX * World.sizeY * this.percentFull / 100);

	this.tickDiv = document.getElementById("tick");
	this.tickDiv.textContent = "Tick: 0";
	this.aliveDiv = document.getElementById("alive");
	this.aliveDiv.textContent = "Alive: 0";
	this.oldestDiv = document.getElementById("oldest");
	this.oldestDiv.textContent = "Oldest: 0";
	this.averageDiv = document.getElementById("average");
	this.averageDiv.textContent = "Average age: 0";

	this.dots = new Dots(this.world);
	this.dots.create(this.numDots);
};


Alife.prototype.destroy = function()
{
	gui.remove(this.numCtrl);
	this.numCtrl = null;
	gui.remove(this.dotsCtrl);
	this.dotsCtrl = null;
	gui.remove(this.tickCtrl);
	this.tickCtrl = null;

	this.dots.destroy();
	this.dots = null;
};


Alife.prototype.restart = function()
{
	this.destroy();
	this.create(World.sizeX, World.sizeY, World.imageData);
};


Alife.prototype.update = function()
{
	this.tick++;

	this.numDots = this.dots.update( 1.0 - this.numDots / this.desiredPopulation );
	this.world.update();

	this.tickDiv.textContent = "Tick: " + this.tick;
	this.aliveDiv.textContent = "Alive: " + this.numDots;
	this.oldestDiv.textContent = "Oldest: " + this.dots.oldest;
	this.averageDiv.textContent = "Average age: " + this.dots.average.toFixed(2);
};


Alife.prototype.toJSON = function()
{
	return	{
				percentFull: this.percentFull,
				desiredPopulation: this.desiredPopulation,
				numDots: this.numDots,
				dots: this.dots
			};
};
