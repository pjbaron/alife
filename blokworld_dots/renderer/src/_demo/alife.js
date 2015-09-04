/**
 * alife.js
 *
 * 23/08/2015 Pete Baron
 * 
 */



function Alife()
{
	this.percentFull = 1.0;
	this.desiredPopulation = 0;
}


Alife.prototype.create = function(_worldWide, _worldHigh, _worldImage)
{
	World.create(_worldWide, _worldHigh, _worldImage);

	// dat.GUI controlled variables and callbacks
	var _this = this;

	this.numCtrl = gui.add(this, "percentFull").min(0.1).max(20.0).step(0.1).listen();
	this.numCtrl.onFinishChange(function(value) { if (!value) _this.percentFull = 1; _this.restart(); });

	this.desiredPopulation = this.numDots = World.sizeX * World.sizeY * this.percentFull / 100;
	this.dotsCtrl = gui.add(this, "numDots").listen();

	this.dots = new Dots();
	this.dots.create(this.numDots);
};


Alife.prototype.destroy = function()
{
	gui.remove(this.numCtrl);
	this.numCtrl = null;
	gui.remove(this.dotsCtrl);
	this.dotsCtrl = null;

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
	this.numDots = this.dots.update( this.numDots < this.desiredPopulation );
	World.update();
};

