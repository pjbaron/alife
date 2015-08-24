/**
 * alife.js
 *
 * 23/08/2015 Pete Baron
 * 
 */


function Alife()
{
	this.worldSize = 700;
	this.percentFull = 30;
}


Alife.prototype.create = function()
{
	// create the world space
	this.setWorldSize();
	new World();
	World.create(this.worldSize, this.worldSize);

	// dat.GUI controlled variables and callbacks
	var _this = this;

	this.sizeCtrl = gui.add(this, "worldSize").min(10).max(MAX_WIDTH).step(10).listen();
	this.sizeCtrl.onFinishChange(function(value) { if (!value) _this.worldSize = 10; _this.setWorldSize(); _this.restart(); });

	this.numCtrl = gui.add(this, "percentFull").min(1).max(100).step(1).listen();
	this.numCtrl.onFinishChange(function(value) { if (!value) _this.percentFull = 1; _this.restart(); });

	this.numDots = this.worldSize * this.worldSize * this.percentFull / 100;
	this.dotsCtrl = gui.add(this, "numDots").listen();

	this.grass = new Grass();
	this.grass.create(World.terrain);

	this.dots = new Dots();
	this.dots.create(this.numDots);
};


Alife.prototype.destroy = function()
{
	gui.remove(this.sizeCtrl);
	this.sizeCtrl = null;
	gui.remove(this.numCtrl);
	this.numCtrl = null;
	gui.remove(this.dotsCtrl);
	this.dotsCtrl = null;

	this.dots.destroy();
	this.dots = null;
	this.grass.destroy();
	this.grass = null;

	World.destroy();
};


Alife.prototype.restart = function()
{
	this.destroy();
	this.create();
};


Alife.prototype.update = function()
{
	this.dots.update();
	World.draw();
};


Alife.prototype.setWorldSize = function()
{
	this.worldX = this.worldSize;
	this.worldY = this.worldSize;

	console.log("World size =", this.worldSize, "Number of dots =", this.numDots);
};

