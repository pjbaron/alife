/**
 *
 * WebGL support code
 *
 * A great many drawing methods have been broken out of this file but are still members of the object.
 * See pbWebGlDrawImageSingle etc for these methods.
 *
 */



var MAX_SPRITES = 300000;

var gl = null;


function pbWebGl()
{
	console.log( "pbWebGl c'tor" );
	gl = null;
	this.shaders = null;
	this.bgVertexBuffer = null;
	this.bgColorBuffer = null;
	this.positionBuffer = null;
	// pre-allocate the this.drawingArray to avoid memory errors from fragmentation (seen on Chrome (debug Version 39.0.2171.71 m) after running 75000 sprite demo for ~15 seconds)
	this.drawingArray = new Float32Array( MAX_SPRITES * (44 + 22) - 22 );
}



// pbWebGl extends from the pbBaseGraphics prototype chain
pbWebGl.prototype = new pbBaseGraphics();
// create property to store the class' parent
pbWebGl.prototype.__super__ = pbBaseGraphics;		// http://stackoverflow.com/questions/7300552/calling-overridden-methods-in-javascript



pbWebGl.prototype.create = function( _canvas )
{
	// https://www.khronos.org/webgl/wiki/FAQ
	if ( window.WebGLRenderingContext )
	{
		console.log( "pbWebGl.initGl" );
		
		try
		{
			gl = _canvas.getContext( "webgl", { alpha: false } );
			if (!gl)	// support IE11, lagging behind as usual
				gl = _canvas.getContext( "experimental-webgl", { alpha: false } );
		}
		catch ( e )
		{
			console.log( "WebGL initialisation error:\n", e.message );
			alert( "WebGL initialisation error:\n", e.message );
			return false;
		}

		if (!gl)
		{
			console.log( "WebGL did not initialise!");
			alert( "WebGL did not initialise!");
			return false;
		}

		// if this version of webGl can't use textures, it's useless to us
		var numTexturesAvailableInVertexShader = gl.getParameter( gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS );
		if ( numTexturesAvailableInVertexShader === 0 )
		{
			gl = null;
			return false;
		}

		// create the texture handler
		this.textures = new pbWebGlTextures();
		this.textures.create();

		// create the shader handler
		this.shaders = new pbWebGlShaders();
		this.shaders.create();

		// enable the depth buffer so we can order our sprites
		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL);

		// set blending mode
		gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );
		gl.enable( gl.BLEND );

		// set the parameters to clear the render area
		gl.clearColor( 0.0, 0.0, 0.0, 0.0 );
		gl.clearDepth( 1.0 );

		// precalculate the drawing buffer's half-width and height values
		this.screenWide2 = gl.drawingBufferWidth * 0.5;
		this.screenHigh2 = gl.drawingBufferHeight * 0.5;
		// calculate inverse to avoid division in loop
		this.iWide = 1.0 / this.screenWide2;
		this.iHigh = 1.0 / this.screenHigh2;

		return true;
	}
	return false;
};


pbWebGl.prototype.destroy = function()
{
	if (this.shaders)
		this.shaders.destroy();
	this.shaders = null;

	if (this.textures)
		this.textures.destroy();
	this.textures = null;

	this.bgVertexBuffer = null;
	this.bgColorBuffer = null;
	this.positionBuffer = null;
	this.drawingArray = null;

	gl = null;
};


pbWebGl.prototype.preRender = function(_width, _height, _fb, _rb)
{
	// make sure that all drawing goes to the correct place
	gl.bindFramebuffer(gl.FRAMEBUFFER, _fb);
	gl.bindRenderbuffer(gl.RENDERBUFFER, _rb);

	// clear the viewport
	gl.disable( gl.SCISSOR_TEST );
	gl.viewport( 0, 0, _width, _height);
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
};


pbWebGl.prototype.prepareBuffer = function()
{
	// create a GL buffer to transfer all the vertex position data through
	this.positionBuffer = gl.createBuffer();

	// bind the buffer to the RAM resident positionBuffer
    gl.bindBuffer( gl.ARRAY_BUFFER, this.positionBuffer );
};



pbWebGl.prototype.reset = function()
{
    gl.bindBuffer( gl.ARRAY_BUFFER, null );
   	gl.bindTexture( gl.TEXTURE_2D, null );
   	this.shaders.clearProgram();
	this.textures.currentSrcTexture = null;
};



pbWebGl.prototype.scissor = function(_x, _y, _width, _height)
{
	if (_x === undefined)
	{
		gl.disable(gl.SCISSOR_TEST);
	}
	else
	{
		gl.enable(gl.SCISSOR_TEST);
		// vertical coordinate system is inverted (0,0) is left, bottom of the screen
		gl.scissor(_x, gl.drawingBufferHeight - 1 - (_y + _height), _width, _height);
	}
};



// check if value is a power of two 
function isPowerOfTwo(x)
{
    return ((x & (x - 1)) === 0);
}

 
// return the next highest power of two from this value (keep the value if it is already a power of two)
function nextHighestPowerOfTwo(x)
{
    --x;
    for (var i = 1; i < 32; i <<= 1)
    {
        x = x | x >> i;
    }
    return x + 1;
}
