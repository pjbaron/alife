/**
 *
 * pbCanvas - wrapper for all Canvas drawing function
 * Must extend pbCanvas.js
 * http://stackoverflow.com/questions/3710275/does-javascript-have-the-interface-type-such-as-javas-interface
 * (I know JS doesn't support interfaces... but it's easier to talk about that way than constant 'duck' references!)
 * 
 */

function pbCanvas()
{
	this.ctx = null;
	this.canvas = null;
}


// pbCanvas extends from the pbBaseGraphics prototype chain
pbCanvas.prototype = new pbCanvas();
// create property to store the class' parent
pbCanvas.prototype.__super__ = pbCanvas;		// http://stackoverflow.com/questions/7300552/calling-overridden-methods-in-javascript


pbCanvas.prototype.create = function( _canvas )
{
	if (_canvas)
	{
		this.canvas = _canvas;
		try
		{
			this.ctx = _canvas.getContext('2d');
		}
		catch ( e )
		{
			alert( "Canvas initialisation error: ", e.message );
			return false;
		}

		if (this.ctx)
			return true;

		alert( "Canvas Error: unable to getContext('2d')");
	}
	return false;
};


pbCanvas.prototype.destroy = function()
{
	this.ctx = null;
	this.canvas = null;
};


pbCanvas.prototype.preRender = function()
{
	// clear canvas before drawing contents
	this.ctx.fillStyle = '#000010';
	this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
};


// currently unused
pbCanvas.prototype.drawImage = function(_x, _y, _z, _surface, _cellFrame, _angle, _scale)
{
	console.log("ERROR: Canvas graphic mode does not yet extend drawImage from pbBaseGraphics!");
	alert("ERROR: Canvas graphic mode does not yet extend drawImage from pbBaseGraphics!");
};


// TODO: considerable optimisations available here!
// used by pbWebGlLayer for single sprite drawing
pbCanvas.prototype.drawImageWithTransform = function(_textureNumber, _image, _transform, _z_order)
{
	var srf = _image.surface;
	var srcImageData = srf.imageData;
	var w, h;

	// TODO: use the Pixi style 'object' matrix which is kept as elements so I don't need to extract from array.. after speed tests vs the glMatrix approach!
	var a = _transform[0];
	var b = _transform[3];
	var c = _transform[1];
	var d = _transform[4];
	var e = _transform[6];
	var f = _transform[7];


	// TODO: apply skew factors if set
	// TODO: animation frame selection and extraction from the sprite-sheet

	if (_image.fullScreen)
	{
		// TODO: 'fullScreen' flag... WRAP to fit (not stretch to fit)
		w = pbPhaserRender.width;
		h = pbPhaserRender.height;
		// a single stretched image, use 5 parameter drawImage call
		this.ctx.drawImage(srcImageData,
			e - w * _image.anchorX, f - h * _image.anchorY,
			w, h);
	}
	else if (srf.cellsWide === 1 && srf.cellsHigh === 1)
	{

		// TODO: store scale in pbMatrix3 when it's set to avoid sqrt here... how best to deal with matrix multiplication for transform tree though?
		// var sx = Math.sqrt(a * a + b * b);
		// var sy = Math.sqrt(c * c + d * d);	
		w = srf.cellSourceSize[0].wide;		// * sx;
		h = srf.cellSourceSize[0].high;		// * sy;  TODO: I think this scale factor should be required but it works without... try with some larger images to check

		// don't allow transforms to accumulate, save state and restore it...
		this.ctx.save();

		this.ctx.transform(a, b, c, d, e, f);
		// a single image, use 3 parameter drawImage call
		this.ctx.drawImage(srcImageData,
			-w * _image.anchorX, -h * _image.anchorY);

		this.ctx.restore();
	}
	else
	{
		var cell = Math.floor(_image.cellFrame);
		// TODO: modify cellTextureBounds for canvas to be cellWide/cellHigh factors instead of 0..1
		var rect = srf.cellTextureBounds[cell];

		// TODO: debug only
		if (!rect)
			console.log("WARNING: invalid cellFrame or error in cellTextureBounds!", cell, srcImageData.currentSrc);

		this.ctx.save();

		this.ctx.transform(a, b, c, d, e, f);
		var sx = Math.sqrt(a * a + b * b);
		var sy = Math.sqrt(c * c + d * d);	
		w = srf.cellSourceSize[0].wide * sx;
		h = srf.cellSourceSize[0].high * sy;
		// part of a sprite sheet, use 9 parameter drawImage call
		this.ctx.drawImage(srcImageData,
			rect.x * srcImageData.width, rect.y * srcImageData.height,
			rect.width * srcImageData.width, rect.height * srcImageData.height,
			-w * _image.anchorX, -h * _image.anchorY,
			w, h);
		this.ctx.restore();
	}
};


// used by pbWebGlLayer for multiple sprite instances which are not particles
// list objects: { image: pbImage, transform: pbMatrix3, z_order: Number }
pbCanvas.prototype.rawBatchDrawImages = function(_list)
{
	// can't batch in Canvas mode, feed them to drawImageWithTransform one at a time

	// http://blog.vjeux.com/2009/javascript/speed-up-javascript-sort.html
	// var save = Object.prototype.toString;
	// Object.prototype.toString = function () { return this.z_order; };		// TODO: z_order needs to be a string of fixed length
	// _list.sort();
	// Object.prototype.toString = save;
	_list.sort(function(a,b) { return a.z_order - b.z_order; });

	var c = _list.length;
	while(c--)
	{
		var s = _list[c];
		this.drawImageWithTransform(0, s.image, s.transform, s.z_order);
	}
};


// used by pbWebGlLayer for multiple sprite instances which have the particle flag set
pbCanvas.prototype.blitDrawImages = function(_list, _surface)
{
	// can't batch in Canvas mode, feed them to drawImageWithTransform one at a time
	var c = _list.length;
	while(c--)
	{
		var s = _list[c];
		this.drawImageWithTransform(0, s.image, s.transform, s.z_order);
	}
};


pbCanvas.prototype.batchDrawImages = function(_list, _surface)
{
	console.log("ERROR: Canvas graphic mode does not yet extend batchDrawImages from pbBaseGraphics!");
	alert("ERROR: Canvas graphic mode does not yet extend batchDrawImages from pbBaseGraphics!");
};


pbCanvas.prototype.reset = function()
{
	console.log("ERROR: Canvas graphic mode does not yet extend reset from pbBaseGraphics!");
	alert("ERROR: Canvas graphic mode does not yet extend reset from pbBaseGraphics!");
};


pbCanvas.prototype.scissor = function(_x, _y, _width, _height)
{
	// TODO: can Canvas handle AABB clipping?  Ignoring this initially but will need to either support it or throw an error/warning.
};


pbCanvas.prototype.fillStyle = function(_fillColor, _lineColor)
{
	console.log("ERROR: Canvas graphic mode does not yet extend fillStyle from pbBaseGraphics!");
	alert("ERROR: Canvas graphic mode does not fillStyle from pbBaseGraphics!");
};


pbCanvas.prototype.fillRect = function( x, y, wide, high, color )
{
	console.log("ERROR: Canvas graphic mode does not yet extend fillRect from pbBaseGraphics!");
	alert("ERROR: Canvas graphic mode does not yet extend fillRect from pbBaseGraphics!");
};


pbCanvas.prototype.blitSimpleDrawImages = function( _list, _listLength, _surface )
{
	console.log("ERROR: Canvas graphic mode does not yet extend blitSimpleDrawImages from pbBaseGraphics!");
	alert("ERROR: Canvas graphic mode does not yet extend blitSimpleDrawImages from pbBaseGraphics!");
};


// batch images, no transforms
// _list contains objects with an .x and .y property
pbCanvas.prototype.blitListDirect = function( _list, _listLength, _surface )
{
	var c = _listLength;
	var w = _surface.cellSourceSize[0].wide * 0.5;
	var h = _surface.cellSourceSize[0].high * 0.5;
	while(c--)
	{
		// round to integer positions for faster rendering
		var x = (0.5 + _list[c].x - w) | 0;
		var y = (0.5 + _list[c].y - h) | 0;
		this.ctx.drawImage(_surface.imageData, x, y);
	}
};


// called when pbSimpleLayer.setDrawingFunctions is directed to pbSimpleLayer.drawPoint
// draws the whole of _surface at the _list locations
// _list is alternately x and y coordinates
// this is a wrapper for a webGl function that has no equivalent in Canvas
pbCanvas.prototype.blitDrawImagesPoint = function( _list, _listLength, _surface )
{
	var c = _listLength;
	var w = _surface.cellSourceSize[0].wide * 0.5;
	var h = _surface.cellSourceSize[0].high * 0.5;
	while(c--)
	{
		// round to integer positions for faster rendering
		var y = (0.5 + _list[c--] - h) | 0;
		var x = (0.5 + _list[c] - w) | 0;
		this.ctx.drawImage(_surface.imageData, x, y);
	}
};


// called when pbSimpleLayer.setDrawingFunctions is directed to pbSimpleLayer.drawPointAnim
// _list contains x,y,u,v values, repeated for each point sprite
// this is a wrapper for a webGl function that has no equivalent in Canvas
pbCanvas.prototype.blitDrawImagesPointAnim = function( _list, _listLength, _surface )
{
	var c = _listLength;
	var w = _surface.cellSourceSize[0].wide;
	var h = _surface.cellSourceSize[0].high;
	var w2 = w * 0.5;
	var h2 = h * 0.5;
	while(c--)
	{
		var v = _list[c--] * _surface.imageData.height;
		var u = _list[c--] * _surface.imageData.width;
		// round to integer positions for faster rendering
		var y = (0.5 + _list[c--] - h2) | 0;
		var x = (0.5 + _list[c] - w2) | 0;
		this.ctx.drawImage(_surface.imageData, u, v, w, h, x, y, w, h);
	}
};


pbCanvas.prototype.drawCanvasWithTransform = function( _canvas, _dirty, _transform, _z )
{
	console.log("ERROR: Canvas graphic mode does not yet extend drawCanvasWithTransform from pbBaseGraphics!");
	alert("ERROR: Canvas graphic mode does not yet extend drawCanvasWithTransform from pbBaseGraphics!");
};


