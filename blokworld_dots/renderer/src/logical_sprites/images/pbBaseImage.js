/**
 *
 * Surface holder with a single pbSurface and a cellFrame index for the current animation cell.
 * 
 * This information cannot be stored in pbSurface (they are reused so the cellFrame needs to be unique)
 * and should not be in pbTransformObject (it's a logical transform object with an optional image attached).
 *
 * These objects will usually be one per pbTransformObject, but can safely be shared if a large number of pbTransformObject
 * objects will animate entirely in sync.  Be careful not to update the cellFrame in every pbTransformObject though!
 *
 */


function pbBaseImage()
{
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


pbBaseImage.prototype.create = function(_surface, _cellFrame, _anchorX, _anchorY, _tiling, _fullScreen)
{
	if (_cellFrame === undefined || _cellFrame === null) _cellFrame = 0;
	if (_anchorX === undefined || _anchorX === null) _anchorX = 0.0;
	if (_anchorY === undefined || _anchorY === null) _anchorY = 0.0;
	if (_tiling === undefined || _tiling === null) _tiling = false;
	if (_fullScreen === undefined || _fullScreen === null) _fullScreen = false;

	this.surface = _surface;
	this.cellFrame = _cellFrame;
	this.gpuTexture = null;
	this.corners = null;
	this.anchorX = _anchorX;
	this.anchorY = _anchorY;
	this.fullScreen = _fullScreen;
	this.tiling = _tiling;		// TODO: move to pbSurface?? batch processing will be all or nothing so shared surface can't switch 'tiling' state on & off per pbBaseImage
	this.isParticle = false;
};


pbBaseImage.prototype.destroy = function()
{
	this.surface = null;
	this.gpuTexture = null;
	this.corners = null;
};


pbBaseImage.prototype.setCorners = function(ltx, lty, rtx, rty, lbx, lby, rbx, rby)
{
	alert("ERROR: render mode '", useRenderer, "' does not support setCorners!");
};


// allow this class to be extended
// permits multiple levels of inheritance 	http://jsfiddle.net/ZWZP6/2/  
// improvement over original answer at 		http://stackoverflow.com/questions/7300552/calling-overridden-methods-in-javascript
pbBaseImage.prototype.super = function(clazz, functionName)
{
	//console.log("pbBaseImage.super", functionName);
    var args = Array.prototype.slice.call(arguments, 2);
    clazz.prototype.__super__.prototype[functionName].apply(this, args);
};

