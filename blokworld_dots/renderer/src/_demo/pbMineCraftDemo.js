/**
 *
 * A demo of a minecraft world drawn by the GPU shaders.
 *
 * Based on the shader at https://www.shadertoy.com/view/4ds3WS",
 *
 * - removed many colour tricks and ambient occlusion lighting (for speed)
 * - increased draw distance
 * - improved draw distance cut-off to be distance based
 * - added code to take terrain heights from a source image (instead of procedural)
 * - added animating water textures
 * - removed tree hack
 * - removed house hack
 * - added colour tinting of grass depending on altitude
 * - modified haze equation to remain clear until just before the draw distance cut-off then increase rapidly to opaque
 * - added user controlled camera (removed fixed path based camera)
 * - renamed some functions and variables for readability
 */




// created while the data is loading (preloader)
function pbMineCraftDemo( docId )
{
	console.log( "pbMineCraftDemo c'tor entry" );

	this.rttTexture = null;
	this.rttFramebuffer = null;
	this.shaderProgram = null;
	this.srcWidth = 0;
	this.srcHeight = 0;
	this.srcImage = null;
	this.srcTexture = null;

	this.mousex = 0;
	this.mousey = 0;
	this.mouseDown = false;
	this.keyUp = false;
	this.keyDown = false;
	this.keyLeft = false;
	this.keyRight = false;
	this.keyVert = false;

	this.camera = new Camera();
	this.camera.create(0, 50, 0, 22, 39, 34);

	this.phaserRender = new pbPhaserRender( docId );
	this.phaserRender.create( 'webgl', this.create, this.update, this );

	this.shaderJSON = pbPhaserRender.loader.loadFile( "../json/minecraftShaderSources.json" );
	this.mapImg = pbPhaserRender.loader.loadImage( "image", "../img/island.png" );

	console.log( "pbMineCraftDemo c'tor exit" );
}


pbMineCraftDemo.prototype.create = function()
{
	console.log("pbMineCraftDemo.create");

	// add the shader
	var jsonString = pbPhaserRender.loader.getFile( this.shaderJSON ).responseText;
	this.shaderProgram = pbPhaserRender.renderer.graphics.shaders.addJSON( jsonString );

	// get the fully loaded map image
	var img = pbPhaserRender.loader.getFile( this.mapImg );

	// create a temporary in-memory canvas and grab the image, so we can access the image data
	var canvas = document.createElement('canvas');
	canvas.width = img.width;
	canvas.height = img.height;
	var context = canvas.getContext('2d');
	context.imageSmoothingEnabled = false;
	context.drawImage(img, 0, 0);
	this.srcImage = context.getImageData(0, 0, img.width, img.height);
	this.srcImageData = new Uint8Array(this.srcImage.data);

	// send the map image to webgl so the shader can access it
	this.srcWidth = this.srcImage.width;
	this.srcHeight = this.srcImage.height;
	this.srcTexture = gl.createTexture();
	this.srcTextureNumber = 2;
	gl.activeTexture(gl.TEXTURE2);
	gl.bindTexture(gl.TEXTURE_2D, this.srcTexture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.srcWidth, this.srcHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.srcImageData);

	// create the render-to-texture, depth buffer, and a frame buffer to hold them
	this.rttTextureNumber = 3;
	this.rttTexture = pbWebGlTextures.initTexture(this.rttTextureNumber, pbPhaserRender.width, pbPhaserRender.height);
	this.rttFramebuffer = pbWebGlTextures.initFramebuffer(this.rttTexture, null);

	// create the 'dots' simulation control system
	this.alife = new Alife();
	this.alife.create(this.srcWidth, this.srcHeight, this.srcImageData);

	// register mouse and keyboard listeners for user control of camera
	this.element = document.getElementById('alife');

	var _this = this;
	document.body.onmousemove = function(e) {
		_this.mousex = e.clientX;
		_this.mousey = e.clientY;
	};
	document.body.onmousedown = function(e) {
		if (e.clientX < pbPhaserRender.width)
			if (e.clientY < pbPhaserRender.height)
			{
				_this.mouseDown = true;
				// set cursor style
				if (_this.element && _this.element.style)
					_this.element.style.cursor = 'move';
			}
	};
	document.body.onmouseup = function(e) {
		if (e.clientX < pbPhaserRender.width)
			if (e.clientY < pbPhaserRender.height)
			{
				_this.mouseDown = false;
				// set cursor style
				if (_this.element && _this.element.style)
					_this.element.style.cursor = 'default';
			}
	};
	document.body.onkeydown = function(e) {
		var evt = window.event ? window.event : e;
		switch(evt.keyCode)
		{
			case 37: // left
			case 65: // A
				_this.keyLeft = true;
				break;
			case 39: // right
			case 68: // D
				_this.keyRight = true;
				break;
			case 38: // up
			case 87: // W
				_this.keyUp = true;
				break;
			case 40: // down
			case 83: // S
				_this.keyDown = true;
				break;
			case 32: // space
				_this.keyVert = true;
				break;
		}
	};
	document.body.onkeyup = function(e) {
		var evt = window.event ? window.event : e;
		switch(evt.keyCode)
		{
			case 37: // left
			case 65: // A
				_this.keyLeft = false;
				break;
			case 39: // right
			case 68: // D
				_this.keyRight = false;
				break;
			case 38: // up
			case 87: // W
				_this.keyUp = false;
				break;
			case 40: // down
			case 83: // S
				_this.keyDown = false;
				break;
			case 32: // space
				_this.keyVert = false;
				break;
		}
	};
};


pbMineCraftDemo.prototype.destroy = function()
{
	console.log("pbMineCraftDemo.destroy");

	gui.remove(this.redCtrl);
	gui.remove(this.grnCtrl);
	gui.remove(this.bluCtrl);

	if (this.phaserRender)
		this.phaserRender.destroy();
	this.phaserRender = null;

	this.rttTexture = null;
	this.rttFramebuffer = null;
};


pbMineCraftDemo.prototype.restart = function()
{
	console.log("pbMineCraftDemo.restart");
	
	this.destroy();
	this.create();
};


pbMineCraftDemo.prototype.update = function()
{
	// update all dots in the world texture
	this.alife.update();

	// send the altered world texture to the GPU
	gl.activeTexture(gl.TEXTURE2);
	gl.bindTexture(gl.TEXTURE_2D, this.srcTexture);
	//gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.srcImage);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.srcWidth, this.srcHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.srcImageData);

	// apply the minecraft style shader to the empty rttTexture and display the result on screen
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	pbPhaserRender.renderer.graphics.applyShaderToTexture( this.rttTexture, this.setTint, this );


	//
	// camera controls
	//

	if (this.mouseDown)
	{
		// around the UP vector
		var dx = this.mousex - pbPhaserRender.width * 0.5;
		this.camera.rotate(0, 1, 0, dx * 0.007 * Math.PI / 180.0);

		// around the X axis
		var dy = this.mousey - pbPhaserRender.height * 0.5;
		var xa = this.camera.getXAxis();
		this.camera.rotate(xa[0], xa[1], xa[2], -dy * 0.003 * Math.PI / 180.0);
	}
	if (this.keyUp)
	{
		this.camera.moveForwards(1.0);
	}
	if (this.keyDown)
	{
		this.camera.moveForwards(-1.0);
	}
	if (this.keyLeft)
	{
		this.camera.moveSideways(1.0);
	}
	if (this.keyRight)
	{
		this.camera.moveSideways(-1.0);
	}
	if (this.keyVert)
	{
		this.camera.moveVertical(1.0);
	}
};


// callback required to set the correct shader program and it's associated attributes and/or uniforms
pbMineCraftDemo.prototype.setTint = function(_shaders)
{
   	// set the shader program
	_shaders.setProgram(this.shaderProgram, this.srcTextureNumber);
	// set the tint values in the shader program
	gl.uniform1f( _shaders.getUniform( "uGlobalTime"), pbPhaserRender.frameCount );
	gl.uniform3f( _shaders.getUniform( "uCameraLookAt"), this.camera.lx, this.camera.ly, this.camera.lz );
	gl.uniform3f( _shaders.getUniform( "uCameraPos"), this.camera.x, this.camera.y, this.camera.z );
	gl.uniform2f( _shaders.getUniform( "uImageSize"), this.srcWidth, this.srcHeight );
};

