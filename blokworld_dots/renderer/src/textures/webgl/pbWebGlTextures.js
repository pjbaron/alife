/**
 *
 * pbWebGlTextures.js - texture handler for the pbWebGl drawing functions
 * 
 */


function pbWebGlTextures()
{
	this.onGPU = null;
	this.fb = null;
	this.currentSrcTexture = null;
	this.canReadTexture = false;
	this.rttFb = null;
	this.currentDstTexture = null;
	this.rtDepth = null;
}


pbWebGlTextures.prototype.create = function()
{
	this.onGPU = [];
	this.fb = null;
	this.currentSrcTexture = null;
	this.canReadTexture = false;
	this.rttFb = null;
	this.currentDstTexture = null;
	this.rtDepth = null;
};


pbWebGlTextures.prototype.destroy = function()
{
	this.onGPU = null;
	this.fb = null;
	this.currentSrcTexture = null;
	this.rttFb = null;
	this.currentDstTexture = null;
	this.rtDepth = null;
};


/**
 * prepareOnGPU - prepare a texture which is on the GPU to be used as a source surface
 *
 */
pbWebGlTextures.prototype.prepareOnGPU = function(_texture, _tiling, _npot, _textureNumber)
{
	// activate the texture
	if (_textureNumber === undefined)
    	_textureNumber = 0;
   	gl.activeTexture( gl.TEXTURE0 + _textureNumber );
	
	// bind the texture to the currently active texture register
   	gl.bindTexture(gl.TEXTURE_2D, _texture);

   	// specify parameters for the texture
    if (_npot)
    {
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
    else if (_tiling)
    {
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
	    gl.generateMipmap(gl.TEXTURE_2D);
    }
	else
	{
	    // with smoothing off
	    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_ANISOTROPY_EXT, 1.0);
	    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	    // with smoothing on
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
	    gl.generateMipmap(gl.TEXTURE_2D);
	}

	// remember which texture is currently active
    this.currentSrcTexture = _texture;
};


/**
 * prepare - prepare a texture (ImageData) to be rendered with webGl
 *
 * @param  {ImageData} _imageData  [description]
 * @param  {Boolean} _tiling - true if the image will repeat to tile a larger area
 * @param  {Boolean} _npot - true if the image has a non-power-of-two dimension
 *
 * @return {Boolean} true if successfully prepared a new texture, false if failed or it was already prepared
 */
pbWebGlTextures.prototype.prepare = function( _imageData, _tiling, _npot, _textureNumber, _flipy )
{
	// exit immediately if this _imageData is already the selected texture
	if (this.currentSrcTexture && this.currentSrcTexture.imageData === _imageData)
		return false;

	var texture = null;

	// activate the texture (default to use texture register zero if it's not specified)
	// TODO: if we keep a log of all textureRegisters which have been used so far and what is in them...
	// ...and we know how many registers are available, we can reduce the frequency of texture uploading.
	if (_textureNumber === undefined)
    	_textureNumber = 0;
   	gl.activeTexture( gl.TEXTURE0 + _textureNumber );

	var index = this.onGPU.indexOf(_imageData);
    if (index != -1 && !_imageData.isDirty)
    {
		// the _imageData is already on the GPU
		texture = this.onGPU[index].gpuTexture;
		// bind the texture to the currently active texture register
	    gl.bindTexture(gl.TEXTURE_2D, texture);
    }
    else
    {
    	// upload it to the GPU
    	
	    var maxSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
	    if (_imageData.width > maxSize || _imageData.height > maxSize)
	    {
		    alert("ERROR: Texture size not supported by this video card!", _imageData.width, _imageData.height, " > ", maxSize);
		    return false;
	    }

	    if (!_imageData.isDirty)	// only debug when a new texture is sent, not when an old texture is marked 'dirty' (because spam will slow things down)
			console.log( "pbWebGlTextures.prepare uploading source texture : ", _imageData.width, "x", _imageData.height );

	    // link the texture object to the imageData and vice-versa
		texture = gl.createTexture();
		texture.imageData = _imageData;
		texture.register = _textureNumber;
		_imageData.gpuTexture = texture;
	    _imageData.isDirty = false;

		// bind the texture to the currently active texture register
	    gl.bindTexture(gl.TEXTURE_2D, texture);
   
   		// optionally flip the texture vertically
	    if (_flipy === undefined) _flipy = false;
	    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, _flipy);

	    if (_npot)
	    {
		    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	    }
	    else if (_tiling)
	    {
		    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
		    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
		    gl.generateMipmap(gl.TEXTURE_2D);
	    }
    	else
    	{
		    // with smoothing off
		    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_ANISOTROPY_EXT, 1.0);
		    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		    // with smoothing on
		    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
		    // gl.generateMipmap(gl.TEXTURE_2D);
    	}

   		// upload the texture to the GPU
	    // target, level, internalformat, format, type, pixels
	    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, _imageData);

	    // remember that this texture has been uploaded
	    this.onGPU.push(_imageData);
	}

    this.currentSrcTexture = texture;

    return true;
};


// http://stackoverflow.com/questions/13626465/how-to-create-a-new-imagedata-object-independently
function ImageData(_width, _height)
{
	console.log("ImageData", _width, "x", _height);

    var canvas = document.createElement('canvas');
    canvas.width = _width;
    canvas.height = _height;
    var ctx = canvas.getContext('2d');
    var imageData = ctx.createImageData(canvas.width, canvas.height);
    return imageData;
}


/**
 * prepareRenderToTexture - prepare a texture for webGl to render to it, leave it bound to the framebuffer so future drawing will go there
 *
 */
pbWebGlTextures.prototype.prepareRenderToTexture = function( _width, _height )
{
	console.log( "pbWebGlTextures.prepareRenderToTexture creating new target texture : ", _width, "x", _height );

	// create a render-to-texture frame buffer
	this.rttFb = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, this.rttFb);
	this.rttFb.width = _width;
	this.rttFb.height = _height;

	// create a texture surface to render to
	this.currentDstTexture = gl.createTexture();
	// bind the texture to the currently active texture register
    gl.bindTexture(gl.TEXTURE_2D, this.currentDstTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    //gl.generateMipmap(gl.TEXTURE_2D);

	// create a new ImageData to hold the texture pixels
	this.currentDstTexture.imageData = new ImageData(_width, _height);
	// link the imageData to the destination texture
	this.currentDstTexture.imageData.gpuTexture = this.currentDstTexture;

	var dataTypedArray = new Uint8Array(this.currentDstTexture.imageData.data);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.rttFb.width, this.rttFb.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, dataTypedArray);


    // create a depth buffer
    this.rtDepth = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.rtDepth);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.rttFb.width, this.rttFb.height);

    // attach the texture and depth buffers to the frame buffer
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.currentDstTexture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.rtDepth);

    // unbind everything
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
};


/**
 * setRenderTargetToTexture - rebind the rttFb frame buffer to render to currentDstTexture
 * 
 */
pbWebGlTextures.prototype.setRenderTargetToTexture = function(_width, _height)
{
	if (!this.rttFb)
	{
		// create the destination texture
		this.prepareRenderToTexture(_width, _height);
	}
	console.log("pbWebGlTextures.setRenderTargetToTexture", _width, "x", _height);

	// rebind the frame buffer containing the destination texture
	gl.bindFramebuffer(gl.FRAMEBUFFER, this.rttFb);
};


/**
 * stopRenderTexture - stop future rendering going to the render texture
 *
 */
pbWebGlTextures.prototype.stopRenderTexture = function()
{
	// unbind the frame buffer to stop rendering to a texture and resume rendering to the display
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
};


pbWebGlTextures.prototype.setRenderSourceImage = function( _textureNumber, _imageData )
{
	// make sure that _imageData is the current source texture
	if (!this.currentSrcTexture || this.currentSrcTexture.imageData !== _imageData)
	{
		console.log("pbWebGlTextures.setRenderSourceImage", _textureNumber, _imageData.width, "x", _imageData.height);

		var index = this.onGPU.indexOf(_imageData);
		if (index == -1)
			this.onGPU.push(_imageData);
		texture = _imageData.gpuTexture;
		if (texture === null)
			console.log("WARNING: imageData has null for gpuTexture.");
		gl.activeTexture(gl.TEXTURE0 + _textureNumber);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		this.currentSrcTexture = texture;
	}
};


/**
 * prepareTextureForAccess - prepare a webGl texture as currentSrcTexture, ready to transfer it's content to system memory
 *
 */
pbWebGlTextures.prototype.prepareTextureForAccess = function(_texture)
{
	// if (_texture.canvas)
	// 	console.log("pbWebGlTextures.prepareTextureForAccess", _texture.canvas.width, "x", _texture.canvas.height);
	// else if (_texture.imageData)
	// 	console.log("pbWebGlTextures.prepareTextureForAccess", _texture.imageData.width, "x", _texture.imageData.height);
	// else
	// 	console.log("pbWebGlTextures.prepareTextureForAccess", _texture.width, "x", _texture.height);

	if (!this.fb)
		// make a framebuffer
		this.fb = gl.createFramebuffer();

	// make this the current frame buffer
	gl.bindFramebuffer(gl.FRAMEBUFFER, this.fb);

	// attach the texture to the framebuffer.
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, _texture, 0);

	// check if you can read from this type of texture.
	this.canReadTexture = (gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE);

	// remember which texture we're working with
    this.currentSrcTexture = _texture;
};


/**
 * getCanvasFromTexture - transfer a webGl texture to the Canvas associated with the context provided
 * 
 */
// from http://www.html5rocks.com/en/tutorials/webgl/webgl_fundamentals/
// and https://html.spec.whatwg.org/multipage/scripting.html#pixel-manipulation
// and https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas
pbWebGlTextures.prototype.getCanvasFromTexture = function(_ctx)
{
	if (this.canReadTexture && this.fb)
	{
		var canvas = _ctx.canvas;
		var imageData = _ctx.createImageData(canvas.width, canvas.height);

		// get the texture data to the ImageData buffer
		this.getTextureData(this.fb, this.currentSrcTexture, imageData.data.buffer);

		// put the ImageData on the _canvas
		_ctx.putImageData(imageData, 0, 0);
	}
};


/**
 * getSurfaceFromTexture - grab the currentSrcTexture from the GPU into a pbSurface
 * 
 */
pbWebGlTextures.prototype.getSurfaceFromTexture = function(_surface)
{
	if (this.canReadTexture && this.fb)
	{
		var wide = this.currentSrcTexture.width;
		var high = this.currentSrcTexture.height;

		var imageData = _surface.imageData;
		if (!imageData || imageData.width != wide || imageData.height != high)
		{
			// create an ImageData to copy the pixels into
			imageData = new ImageData(wide, high);
		}

		// transfer the destination texture pixels from the GPU into the image data
		this.getTextureData(this.fb, this.currentSrcTexture, imageData.data.buffer);

		// associate the ImageData with the _surface
		_surface.imageData = imageData;
	}
};


/**
 * getTextureData - transfer a webGl texture from the GPU to a system RAM buffer (returns a Uint8Array)
 *
 */
// from http://learningwebgl.com/blog/?p=1786
pbWebGlTextures.prototype.getTextureData = function(_fb, _texture, _buffer)
{
	if (this.canReadTexture && _fb)
	{
		// make _fb the current frame buffer
		gl.bindFramebuffer(gl.FRAMEBUFFER, _fb);

		// attach the texture to the framebuffer again (to update the contents)
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, _texture, 0);

		// dimensions of the texture set depending on the original image source
		var wide, high;
		if (_texture.canvas)
		{
			wide = _texture.canvas.width;
			high = _texture.canvas.height;
		}
		else if (_texture.imageData)
		{
			wide = _texture.imageData.width;
			high = _texture.imageData.height;
		}
		else
		{
			wide = _texture.width;
			high = _texture.height;
		}

		var buf8;
		if (_buffer !== null && _buffer !== undefined)
		{
			// create an 8 bit view of the supplied _buffer
			// WARNING: if _buffer is a typed array, this will DUPLICATE it instead of creating a view (slow, and probably not what you wanted!)
			buf8 = new Uint8Array(_buffer);
		}
		else
		{
			// create an 8 bit array large enough to hold the data
			buf8 = new Uint8Array(wide * high * 4);

			// add width & height parameters (this buf8 will be used after it is returned)
			buf8.width = wide;
			buf8.height = high;
		}

		// read the texture pixels into the 8 bit array
		gl.readPixels(0, 0, wide, high, gl.RGBA, gl.UNSIGNED_BYTE, buf8);

		// unbind the framebuffer
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);

		return buf8;
	}
	return null;
};


// useful link - http://www.goocreate.com/learn/procedural-textures/
pbWebGlTextures.prototype.createTextureFromCanvas = function(_textureNumber, _canvas)
{
	var texture = gl.createTexture();
	// bind the texture to the currently active texture register
	gl.activeTexture(gl.TEXTURE0 + _textureNumber);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // clamp to permit NPOT textures, no MIP mapping
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

	// upload the canvas ImageData into the texture
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, _canvas);

    this.currentSrcTexture = texture;
    this.currentSrcTexture.canvas = _canvas;

	// create a buffer to transfer all the vertex position data through
	this.positionBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, this.positionBuffer );
};


/**
 * drawSurfaceToTexture - create a GPU texture and draw the provided surface on it (centred and scaled)
 *
 * @param  {[type]} _surface            [description]
 * @param  {[type]} _textureWide        [description]
 * @param  {[type]} _textureHigh        [description]
 * @param  {[type]} _dstTextureRegister [description]
 *
 * @return {[type]}                     [description]
 */
pbWebGlTextures.prototype.drawSurfaceToTexture = function(_surface, _textureWide, _textureHigh, _dstTextureRegister)
{
	var img = new imageClass();
	// _surface, _cellFrame, _anchorX, _anchorY, _tiling, _fullScreen
	img.create(_surface, 0, 0.5, 0.5, false, false);

	// use GPU texture register 0 to hold the source image for this draw
	var srcTextureRegister = 0;

	// create the render-to-texture
	var rttTexture = pbWebGlTextures.initTexture(_dstTextureRegister, _textureWide, _textureHigh);
	var rttRenderbuffer = pbWebGlTextures.initDepth(rttTexture);
	var rttFramebuffer = pbWebGlTextures.initFramebuffer(rttTexture, rttRenderbuffer);

	// draw the loaded image into the render-to-texture
	gl.bindFramebuffer(gl.FRAMEBUFFER, rttFramebuffer);
	gl.bindRenderbuffer(gl.RENDERBUFFER, rttRenderbuffer);
	// TODO: setting the viewport to the texture size means everything has to be scaled up to compensate... try to find another way
	gl.viewport(0, 0, _textureWide, _textureHigh);
	// offset to the middle of the texture and scale it up
	var transform = pbMatrix3.makeTransform(pbPhaserRender.width/2 , pbPhaserRender.height/2, 0, pbPhaserRender.width/_textureWide, pbPhaserRender.height/_textureHigh);
	pbPhaserRender.renderer.graphics.drawImageWithTransform( srcTextureRegister, img, transform, 1.0 );
	pbWebGlTextures.cancelFramebuffer();

	return rttTexture;
};




/**
 *
 * static helper functions
 * 
 */

// create an empty webgl texture to draw to
pbWebGlTextures.initTexture = function(_textureRegister, _width, _height)
{
	var texture = gl.createTexture();
    texture.width = _width;
    texture.height = _height;
    texture.register = _textureRegister;
    gl.activeTexture(gl.TEXTURE0 + _textureRegister);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texture.width, texture.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	return texture;
};


// create a webgl 'render-to' depth buffer matching the _texture dimensions
pbWebGlTextures.initDepth = function(_texture)
{
    var depth = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depth);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, _texture.width, _texture.height);
    return depth;
};


// attach _texture and _depth to a webgl framebuffer
pbWebGlTextures.initFramebuffer = function(_texture, _depth)
{
    // attach the render-to-texture to a new framebuffer
	var fb = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, _texture, 0);
    // attach the depth buffer to the framebuffer
    if (_depth)
    	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, _depth);

    return fb;
};


// create both a framebuffer and a renderbuffer for this texture
// then plug them in as the render targets for the drawing system
pbWebGlTextures.useFramebufferRenderbuffer = function( _texture )
{
	// create buffers
	var rttRenderbuffer = pbWebGlTextures.initDepth( _texture );
	var rttFramebuffer = pbWebGlTextures.initFramebuffer( _texture, rttRenderbuffer );

	// use buffers as the destination for the renderer drawing
   	pbPhaserRender.renderer.useFramebuffer = rttFramebuffer;
   	pbPhaserRender.renderer.useRenderbuffer = rttRenderbuffer;

	return rttFramebuffer;
};


pbWebGlTextures.cancelFramebuffer = function()
{
	// don't render to texture any more, render to the display instead
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.bindRenderbuffer(gl.RENDERBUFFER, null);
};

