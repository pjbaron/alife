/**
 *
 * Surface holder with a single pbSurface and a cellFrame index for the current animation cell.
 * 
 * This information cannot be stored in pbSurface (they are reused so the cellFrame needs to be unique)
 * and should not be in pbTransformObject (it's a logical transform object with an optional image attached).
 *
 * These objects will usually be one per pbTransformObject, but can be shared safely if a large number of pbTransformObject
 * objects will animate entirely in sync (or not at all).
 * Be careful not to update the cellFrame in every pbTransformObject that shares it though!
 *
 */


function pbCanvasImage()
{
	// TODO: super call pbBaseImage instead of repeating code
	this.surface = null;
	this.cellFrame = 0;
	this.gpuTexture = null;
	this.corners = null;
	this.anchorX = 0.0;
	this.anchorY = 0.0;
	this.fullScreen = false;
	this.tiling = false;
	this.isParticle = false;
}


// pbCanvasImage extends from the pbBaseImage prototype chain
// permits multiple levels of inheritance 	http://jsfiddle.net/ZWZP6/2/  
// improvement over original answer at 		http://stackoverflow.com/questions/7300552/calling-overridden-methods-in-javascript
pbCanvasImage.prototype = new pbBaseImage();
pbCanvasImage.prototype.constructor = pbCanvasImage;
pbCanvasImage.prototype.__super__ = pbBaseImage;


pbCanvasImage.prototype.draw = function(_list, _transform, _z_order)
{
	_list.push(  { surface: this.surface, image: this, transform: _transform, z_order: _z_order } );
};


pbCanvasImage.prototype.simpleDraw = function(_list, _x, _y)
{
	_list.push(  { surface: this.surface, image: this, x: _x, y: _y } );
};

