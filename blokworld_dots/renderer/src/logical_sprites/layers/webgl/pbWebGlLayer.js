/**
 *
 * pbWebGlLayer - Contains one layer of multiple pbTransformObject objects, uses a pbDictionary to present them to webGl in batches based on source surface.
 * Extends pbBaseLayer
 * 
 * All sprites held in a webgl layer are z-sorted using the pbTransformObject.z coordinate which uses a shader hack for depth buffering.
 * Sprites held in a layer are therefore eligible for high-speed batch drawing when they share a source surface.
 * 
 * TODO: Layers will inherit from pbTransformObject to acquire the nested hierarchy and transform inheritance already implemented there.
 * Layers will not have a surface though, so they use pbTransformObject purely as a logical construct and not as a display object.
 * TODO: Check if 'layers' are even necessary as a unique object, pbTransformObject might already contain the full requisite functionality!
 *
 * TODO: given rootLayer -> layer1 -> layer2 -> layer3, rotating all layers except layer3 works as expected... what's wrong with layer3?!
 * 
 */


function pbWebGlLayer()
{
	// this.list = null;
	// this.parent = null;
	// this.phaserRender = null;
	// this.clip = null;

	this.drawDictionary = null;
}

// pbWebGlLayer extends from the pbBaseLayer prototype chain
// permits multiple levels of inheritance 	http://jsfiddle.net/ZWZP6/2/  
// improvement over original answer at 		http://stackoverflow.com/questions/7300552/calling-overridden-methods-in-javascript
pbWebGlLayer.prototype = new pbBaseLayer();
pbWebGlLayer.prototype.constructor = pbWebGlLayer;
pbWebGlLayer.prototype.__super__ = pbBaseLayer;


pbWebGlLayer.prototype.create = function(_parent, _renderer, _x, _y, _z, _angleInRadians, _scaleX, _scaleY)
{
	// console.log("pbWebGlLayer.create", _x, _y);
	
	// call the pbBaseLayer create for this pbWebGlLayer
	this.super(pbWebGlLayer, 'create', _parent, _renderer, _x, _y, _z, _angleInRadians, _scaleX, _scaleY);

	// create dictionary to store drawing commands in the correct order, indexed by the source surface
	// to prepare the data for fast batch drawing
	this.drawDictionary = new pbDictionary();
	this.drawDictionary.create();
};


pbWebGlLayer.prototype.destroy = function()
{
	// call the pbBaseLayer destroy for this pbWebGlLayer
	this.super(pbWebGlLayer, 'destroy');

	this.drawDictionary = null;
};


pbWebGlLayer.prototype.update = function(_dictionary)
{
	// TODO: check this dictionary implementation works correctly with nested layers, nested sprites, and combinations of both
	// prepare the dictionary
	if (!this.drawDictionary)
		console.log("ERROR: no dictionary on layer!");

	this.drawDictionary.clear();

	// call the pbBaseLayer update for this pbWebGlLayer to access the child hierarchy
	this.super(pbWebGlLayer, 'update', this.drawDictionary);

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

	// iterate the drawDictionary to obtain all values for each key
	// draw the queued objects in the callback
	this.drawDictionary.iterateKeys(this.draw, this);

	// call update for all members of this layer
	// (pbImage adds drawing data to the drawDictionary)
	var i = this.list.length;
	while(i--)
	{
		var member = this.list[i];

		if (!member.update(this.drawDictionary))
		{
			member.destroy();
			this.list.splice(i, 1);
		}
	}

	return true;
};

