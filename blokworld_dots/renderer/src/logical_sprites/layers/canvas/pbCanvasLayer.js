/**
 *
 * pbCanvasLayer - Base class for Layers, contains one layer of multiple pbTransformObject objects.
 *
 */


function pbCanvasLayer()
{
	this.super(pbCanvasLayer, 'constructor');
	// this.parent = null;
	// this.phaserRender = null;
	// this.clip = null;
	this.drawList = null;
}

// pbCanvasLayer extends from the pbBaseLayer prototype chain
// permits multiple levels of inheritance 	http://jsfiddle.net/ZWZP6/2/  
// improvement over original answer at 		http://stackoverflow.com/questions/7300552/calling-overridden-methods-in-javascript
pbCanvasLayer.prototype = new pbBaseLayer();
pbCanvasLayer.prototype.constructor = pbCanvasLayer;
pbCanvasLayer.prototype.__super__ = pbBaseLayer;



pbCanvasLayer.prototype.update = function()
{
	// console.log("pbCanvasLayer.update");
	this.drawList = [];

	// call the pbBaseLayer update for this pbCanvasLayer to access the child hierarchy
	this.super(pbCanvasLayer, 'update', this.drawList);

	if (this.clip)
	{
		// apply clipping for this layer
		pbPhaserRender.renderer.graphics.scissor(Math.floor(this.clip.x), Math.floor(this.clip.y), Math.ceil(this.clip.width), Math.ceil(this.clip.height));
	}
	else
	{
		// disable clipping for this layer
		pbPhaserRender.renderer.graphics.scissor();
	}

	// draw all of the queued objects
	if (this.drawList && this.drawList.length > 0)
		this.draw(this.drawList);

	// call update for all members of this layer
	var i = this.list.length;
	while(i--)
	{
		var member = this.list[i];

		if (!member.update())
		{
			member.destroy();
			this.list.splice(i, 1);
		}
	}

	return true;
};
