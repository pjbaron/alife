/**
 *
 * pbRenderer - initialise the rendering system, callback when ready, and provide the main update tick callback
 * 
 */



function pbRenderer( _parent )
{
	console.log("pbRenderer c'tor");

	// parameters
	this.parent = _parent;
	this.useFramebuffer = null;
	this.useRenderbuffer = null;
	this.preUpdate = null;
	this.postUpdate = null;
	this.canvas = null;

	// drawing system
	this.graphics = null;
}


pbRenderer.prototype.destroy = function( )
{
	console.log("pbRenderer.destroy");

	if (this.graphics)
		this.graphics.destroy();
	this.graphics = null;

	this.updateCallback = null;
	this.gameContext = null;
	this.bootCallback = null;
};


/**
 * create - set the graphics mode (any extension of pbBaseGraphics)
 *
 * @param  {String} _preferredRenderer - 'webgl', 'canvas' or undefined.  undefined will try webGl and fall-back to canvas if it fails.
 *
 * TODO: expand for other graphics mode, ie. DOM sprites: http://buildnewgames.com/dom-sprites/
 */
pbRenderer.prototype.create = function( _preferredRenderer, _canvas, _gameContext )
{
	console.log("pbRenderer.create");

	this.canvas = _canvas;
	this.gameContext = _gameContext;
	
	// reset the canvas (erase its contents and set all properties to defaults)
	this.canvas.width = this.canvas.width;

	// useful stuff held local to renderer
	pbPhaserRender.width = this.canvas.width;
	pbPhaserRender.height = this.canvas.height;
	this.graphics = null;
	
	//
	// try to get the renderer set up
	// all drawing modes should be tried in a predetermined order with optional preference respected
	// order is: 'webgl', 'canvas'
	//
	var rendererTypes = [ 'webgl', 'canvas' ];

	useRenderer = 'none';
	// try the preferred renderer if there is one
	if (!_preferredRenderer || !this.tryRenderer(_preferredRenderer))
	{
		// it failed, try all the other renderers
		for(var i = 0, l = rendererTypes; i < l; i++)
		{
			// (don't try the failed preferred choice again)
			if (rendererTypes[i] != _preferredRenderer)
				// how about this one?
				if (this.tryRenderer(rendererTypes[i]))
					// yay! success
					break;
		}
	}
};


pbRenderer.prototype.tryRenderer = function(_which)
{
	if (_which == 'webgl')
	{
		// try to get a webGL context
		this.graphics = new pbWebGl();
		if (this.graphics.create(this.canvas))
		{
			// got one, now set up the support
			useRenderer = 'webgl';
			layerClass = pbWebGlLayer;
			imageClass = pbWebGlImage;
			pbMatrix3.rotationDirection = 1;
			return true;
		}
		this.graphics.destroy();
		this.graphics = null;
		return false;
	}

	if (_which == 'canvas')
	{
		// final case fallback, try canvas '2d'
		this.graphics = new pbCanvas();
		if (this.graphics.create(this.canvas))
		{
			// got one, now set up the support
			useRenderer = 'canvas';
			layerClass = pbCanvasLayer;
			imageClass = pbCanvasImage;
			pbMatrix3.rotationDirection = -1;
			return true;
		}
		this.graphics.destroy();
		this.graphics = null;
		return false;
	}

	return false;
};


pbRenderer.prototype.update = function( _callback, _context )
{
	// debug global to count how many sprites are being drawn each frame
	sprCountDbg = 0;

	// prepare to draw (erase screen)
	this.graphics.preRender( pbPhaserRender.width, pbPhaserRender.height, this.useFramebuffer, this.useRenderbuffer );
	
	// update game logic
	if ( _callback )
		_callback.call( _context );

	// update all object transforms then draw everything
	if ( rootLayer )
	{
		// the rootLayer update will iterate the entire display list
		rootLayer.update();
	}

	// postUpdate if required
	if ( this.postUpdate )
	{
		this.postUpdate.call(this.gameContext);
	}
};


