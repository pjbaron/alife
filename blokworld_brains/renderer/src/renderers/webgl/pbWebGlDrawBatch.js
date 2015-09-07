/**
 * pbWebGlDrawBatch
 *
 * Contains methods for pbWebGl which draw a batch of ImageData or pbSurface sprites to the webGl display buffer
 *
 * TODO: keep an eye on this file, it may need to be broken down further if it continues to grow much more...
 * 
 */




// TODO: test variation of blitSimpleDrawImages that uses non-indexed triangle list instead of tri-strips... overhead of degenerate triangles might be greater than the extra vertex data, especially as the JS will become shorter/simpler too!

// batch images, one full surface cell only, no transforms, pbSimpleLayer, pbBunnyDemo
// requires _list to be alternately x and y coordinate values
pbWebGl.prototype.blitSimpleDrawImages = function( _list, _listLength, _surface, _textureNumber )
{
	this.shaders.setProgram(this.shaders.blitShaderProgram, _textureNumber);

	if (this.textures.prepare( _surface.imageData, null, _surface.isNPOT ))
	{
		this.prepareBuffer();
		this.shaders.prepare(_textureNumber);
	}

	var screenWide2 = gl.drawingBufferWidth * 0.5;
	var screenHigh2 = gl.drawingBufferHeight * 0.5;

	// calculate inverse to avoid division in loop
	var iWide = 1.0 / screenWide2;
	var iHigh = 1.0 / screenHigh2;

	// TODO: generate warning if length is capped
	var len = Math.min(_listLength, MAX_SPRITES * 2);

	var scale = 1.0;
	var wide = _surface.cellSourceSize[0].wide * scale * 0.5 / screenWide2;
	var high = _surface.cellSourceSize[0].high * scale * 0.5 / screenHigh2;

	var old_t;
	var old_r;

	// store local reference to avoid extra scope resolution (http://www.slideshare.net/nzakas/java-script-variable-performance-presentation)
    var buffer = this.drawingArray.subarray(0, len * 24 - 8);

	// weird loop speed-up (http://www.paulirish.com/i/d9f0.png) gained 2fps on my rig!
	for ( var i = -2, c = 0; (i += 2) < len; c += 16 )
	{
		var x = _list[i] * iWide - 1;
		var y = 1 - _list[i + 1] * iHigh;
		var l = x - wide;
		var b = y + high;

		if ( c > 0 )
		{
			// degenerate triangle: repeat the last vertex
			buffer[ c     ] = old_r;
			buffer[ c + 1 ] = old_t;
		 	// repeat the next vertex
			buffer[ c + 4 ] = l;
		 	buffer[ c + 5 ] = b;
		 	// texture coordinates are unused
			//buffer[ c + 2 ] = buffer[ c + 3 ] = buffer[ c + 6 ] = buffer[ c + 7 ] = 0;
			c += 8;
		}

		// screen destination position
		// l, b,		0,1
		// l, t,		4,5
		// r, b,		8,9
		// r, t,		12,13

		buffer[ c     ] = buffer[ c + 4 ] = l;
		buffer[ c + 1 ] = buffer[ c + 9 ] = b;
		buffer[ c + 8 ] = buffer[ c + 12] = old_r = x + wide;
		buffer[ c + 5 ] = buffer[ c + 13] = old_t = y - high;

		// texture source position
		// 0, 0,		2,3
		// 0, 1,		6,7
		// 1, 0,		10,11
		// 1, 1,		14,15
		buffer[ c + 2 ] = buffer[ c + 6] = buffer[ c + 3 ] = buffer[ c + 11] = 0;
		buffer[ c + 10] = buffer[ c + 14] = buffer[ c + 7 ] = buffer[ c + 15] = 1;
	}


    gl.bufferData( gl.ARRAY_BUFFER, buffer, gl.STATIC_DRAW );
    gl.vertexAttribPointer( this.shaders.getAttribute( "aPosition" ), 4, gl.FLOAT, false, 0, 0 );

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, len / 2 * 6 - 2);		// four vertices per sprite plus two degenerate points
};


// batch images with animation cells on the surface, no transforms, pbSimpleLayer, pbBunnyDemo
// requires _list to be x, y, u, v coordinate values
// infers width and height for all by using the first cell of the surface (they must all be the same sizes)
pbWebGl.prototype.blitSimpleDrawAnimImages = function( _list, _listLength, _surface, _textureNumber )
{
	this.shaders.setProgram(this.shaders.blitShaderProgram, _textureNumber);

	if (this.textures.prepare( _surface.imageData, null, _surface.isNPOT ))
	{
		this.prepareBuffer();
		this.shaders.prepare(_textureNumber);
	}

	var screenWide2 = gl.drawingBufferWidth * 0.5;
	var screenHigh2 = gl.drawingBufferHeight * 0.5;

	// calculate inverse to avoid division in loop
	var iWide = 1.0 / screenWide2;
	var iHigh = 1.0 / screenHigh2;

	// TODO: generate warning if length is capped
	var len = Math.min(_listLength, MAX_SPRITES * 4);

	// NOTE: assumes that all cell sources on a pbSimpleLayer surface are equally sized
	var scale = 1.0;
	var wide = _surface.cellSourceSize[0].wide * scale * 0.5 / screenWide2;
	var high = _surface.cellSourceSize[0].high * scale * 0.5 / screenHigh2;

	var old_t;
	var old_r;

	// NOTE: assumes that all cell textures on a pbSimpleLayer surface are equally sized
	var uWide = _surface.cellTextureBounds[0].width;
	var vHigh = _surface.cellTextureBounds[0].height;

	// store local reference to avoid extra scope resolution (http://www.slideshare.net/nzakas/java-script-variable-performance-presentation)
    var buffer = this.drawingArray.subarray(0, len * 24 - 8);

	// weird loop speed-up (http://www.paulirish.com/i/d9f0.png) gained 2fps on my rig!
	for ( var i = -4, c = 0; (i += 4) < len; c += 16 )
	{
		var x = _list[i] * iWide - 1;
		var y = 1 - _list[i + 1] * iHigh;
		var l = x - wide;
		var b = y + high;

		var u = _list[i + 2];
		var v = _list[i + 3];

		if ( c > 0 )
		{
			// degenerate triangle: repeat the last vertex
			buffer[ c     ] = old_r;
			buffer[ c + 1 ] = old_t;
		 	// repeat the next vertex
			buffer[ c + 4 ] = l;
		 	buffer[ c + 5 ] = b;
		 	// texture coordinates
			buffer[ c + 2 ] = u;
			buffer[ c + 3 ] = v;
			buffer[ c + 6 ] = u;
			buffer[ c + 7 ] = v;
			c += 8;
		}

		// screen destination position
		// l, b,		0,1
		// l, t,		4,5
		// r, b,		8,9
		// r, t,		12,13

		buffer[ c     ] = buffer[ c + 4 ] = l;
		buffer[ c + 1 ] = buffer[ c + 9 ] = b;
		buffer[ c + 8 ] = buffer[ c + 12] = old_r = x + wide;
		buffer[ c + 5 ] = buffer[ c + 13] = old_t = y - high;

		// texture source position
		// l, b,		2,3
		// l, t,		6,7
		// r, b,		10,11
		// r, t,		14,15
		buffer[ c + 2 ] = buffer[ c + 6 ] = u;				// l
		buffer[ c + 3 ] = buffer[ c + 11] = v;				// b
		buffer[ c + 10] = buffer[ c + 14] = u + uWide;		// r
		buffer[ c + 7 ] = buffer[ c + 15] = v + vHigh;		// t
	}


    gl.bufferData( gl.ARRAY_BUFFER, buffer, gl.STATIC_DRAW );
    gl.vertexAttribPointer( this.shaders.getAttribute( "aPosition" ), 4, gl.FLOAT, false, 0, 0 );

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, len / 4 * 6 - 2);		// four vertices per sprite plus two degenerate points
};


// batch images, no transforms
// _list contains objects with an .x and .y property
pbWebGl.prototype.blitListDirect = function( _list, _listLength, _surface, _textureNumber )
{
	this.shaders.setProgram(this.shaders.blitShaderProgram, _textureNumber);

	if (this.textures.prepare( _surface.imageData, null, _surface.isNPOT, _textureNumber ))
	{
		this.prepareBuffer();
		this.shaders.prepare(_textureNumber);
	}

	var screenWide2 = gl.drawingBufferWidth * 0.5;
	var screenHigh2 = gl.drawingBufferHeight * 0.5;

	// calculate inverse to avoid division in loop
	var iWide = 1.0 / screenWide2;
	var iHigh = 1.0 / screenHigh2;

	// TODO: generate warning if length is capped
	var len = Math.min(_listLength, MAX_SPRITES);

	var scale = 1.0;
	var wide = _surface.cellSourceSize[0].wide * scale * 0.5 / screenWide2;
	var high = _surface.cellSourceSize[0].high * scale * 0.5 / screenHigh2;

	var old_t;
	var old_r;

	// store local reference to avoid extra scope resolution (http://www.slideshare.net/nzakas/java-script-variable-performance-presentation)
    var buffer = this.drawingArray.subarray(0, len * 24 - 8);

	// weird loop speed-up (http://www.paulirish.com/i/d9f0.png) gained 2fps on my rig!
	for ( var i = -1, c = 0; ++i < len; c += 16 )
	{
		var x = _list[i].x * iWide - 1;
		var y = 1 - _list[i].y * iHigh;
		var l = x - wide;
		var b = y + high;

		if ( i > 0 )
		{
			// degenerate triangle: repeat the last vertex
			buffer[ c     ] = old_r;
			buffer[ c + 1 ] = old_t;
		 	// repeat the next vertex
			buffer[ c + 4 ] = l;
		 	buffer[ c + 5 ] = b;
		 	// texture coordinates are unused
			//buffer[ c + 2 ] = buffer[ c + 3 ] = buffer[ c + 6 ] = buffer[ c + 7 ] = 0;
			c += 8;
		}

		// screen destination position
		// l, b,		0,1
		// l, t,		4,5
		// r, b,		8,9
		// r, t,		12,13

		buffer[ c     ] = buffer[ c + 4 ] = l;
		buffer[ c + 1 ] = buffer[ c + 9 ] = b;
		buffer[ c + 8 ] = buffer[ c + 12] = old_r = x + wide;
		buffer[ c + 5 ] = buffer[ c + 13] = old_t = y - high;

		// texture source position
		// 0, 0,		2,3
		// 0, 1,		6,7
		// 1, 0,		10,11
		// 1, 1,		14,15
		buffer[ c + 2 ] = buffer[ c + 6] = buffer[ c + 3 ] = buffer[ c + 11] = 0;
		buffer[ c + 10] = buffer[ c + 14] = buffer[ c + 7 ] = buffer[ c + 15] = 1;
	}


    gl.bufferData( gl.ARRAY_BUFFER, buffer, gl.STATIC_DRAW );
    gl.vertexAttribPointer( this.shaders.getAttribute( "aPosition" ), 4, gl.FLOAT, false, 0, 0 );

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, len * 6 - 2);		// four vertices per sprite plus two degenerate points
};


// currently unused in demos.  pbImage.isParticle through pbWebGlLayer, sends four floats per vertex (x,y,u,v) to gl, no sprite sheet
// TODO: don't need u,v stream if it's always 0 & 1 values??
pbWebGl.prototype.blitDrawImages = function( _textureNumber, _list, _surface )
{
	this.shaders.setProgram(this.shaders.blitShaderProgram, _textureNumber);

	if (this.textures.prepare( _surface.imageData, null, _surface.isNPOT ))
	{
		this.prepareBuffer();
		this.shaders.prepare(_textureNumber);
	}

	var screenWide2 = gl.drawingBufferWidth * 0.5;
	var screenHigh2 = gl.drawingBufferHeight * 0.5;

	// calculate inverse to avoid division in loop
	var iWide = 1.0 / screenWide2;
	var iHigh = 1.0 / screenHigh2;

	// TODO: generate warning if length is capped
	var len = Math.min(_list.length, MAX_SPRITES);

	var scale = 1.0;
	var wide = _surface.cellSourceSize[0].wide * scale * 0.5 / screenWide2;
	var high = _surface.cellSourceSize[0].high * scale * 0.5 / screenHigh2;

	var old_t;
	var old_r;

	// store local reference to avoid extra scope resolution (http://www.slideshare.net/nzakas/java-script-variable-performance-presentation)
    var buffer = this.drawingArray.subarray(0, len * 24 - 8);

	// weird loop speed-up (http://www.paulirish.com/i/d9f0.png) gained 2fps on my rig!
	for ( var i = -1, c = 0; ++i < len; c += 16 )
	{
		var t = _list[ i ].transform;
		var x = t[6] * iWide - 1;
		var y = 1 - t[7] * iHigh;
		var l = x - wide;
		var b = y + high;

		if ( i > 0 )
		{
			// degenerate triangle: repeat the last vertex
			buffer[ c     ] = old_r;
			buffer[ c + 1 ] = old_t;
		 	// repeat the next vertex
			buffer[ c + 4 ] = l;
		 	buffer[ c + 5 ] = b;
		 	// texture coordinates are unused
			//buffer[ c + 2 ] = buffer[ c + 3 ] = buffer[ c + 6 ] = buffer[ c + 7 ] = 0;
			c += 8;
		}

		// screen destination position
		// l, b,		0,1
		// l, t,		4,5
		// r, b,		8,9
		// r, t,		12,13

		buffer[ c     ] = buffer[ c + 4 ] = l;
		buffer[ c + 1 ] = buffer[ c + 9 ] = b;
		buffer[ c + 8 ] = buffer[ c + 12] = old_r = x + wide;
		buffer[ c + 5 ] = buffer[ c + 13] = old_t = y - high;

		// texture source position
		// 0, 0,		2,3
		// 0, 1,		6,7
		// 1, 0,		10,11
		// 1, 1,		14,15
		buffer[ c + 2 ] = buffer[ c + 6] = buffer[ c + 3 ] = buffer[ c + 11] = 0;
		buffer[ c + 10] = buffer[ c + 14] = buffer[ c + 7 ] = buffer[ c + 15] = 1;
	}


    gl.bufferData( gl.ARRAY_BUFFER, buffer, gl.STATIC_DRAW );
    gl.vertexAttribPointer( this.shaders.getAttribute( "aPosition" ), 4, gl.FLOAT, false, 0, 0 );

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, len * 6 - 2);		// four vertices per sprite plus two degenerate points
};


// called when pbSimpleLayer.setDrawingFunctions is directed to pbSimpleLayer.drawPoint
// sends points directly to gl from the source array (no further JS looping required)
// draws the whole of _surface at the point locations, extremely quickly
pbWebGl.prototype.blitDrawImagesPoint = function( _list, _listLength, _surface, _textureNumber )
{
	this.shaders.setProgram(this.shaders.blitShaderPointProgram, _textureNumber);

	if (this.textures.prepare( _surface.imageData, null, _surface.isNPOT ))
	{
		this.prepareBuffer();
		this.shaders.prepare(_textureNumber);

		var w = _surface.cellSourceSize[0].wide;
		var h = _surface.cellSourceSize[0].high;
		var max = Math.max(w, h);
		// set the size of the 'point' (it's square)
		if (this.shaders.getUniform( "uSize" ))
		{
			gl.uniform1f( this.shaders.getUniform( "uSize" ), max );
		}
		// set the dimensions of the actual texture (can be rectangular)
		if (this.shaders.getUniform( "uTextureSize" ))
		{
			gl.uniform2f( this.shaders.getUniform( "uTextureSize" ), max / w, max / h );
		}
	}

	// TODO: generate warning if length is capped
	var len = Math.min(_listLength, MAX_SPRITES * 2);

	// make a buffer view of the _list which is only as long as we need
    var buffer = _list.subarray(0, len);
    gl.bufferData( gl.ARRAY_BUFFER, buffer, gl.STATIC_DRAW );
    gl.vertexAttribPointer( this.shaders.getAttribute( "aPosition" ), 2, gl.FLOAT, false, 0, 0 );
    gl.drawArrays(gl.POINTS, 0, len / 2);
};


// sends points and texture locations to gl
// draws a single animation frame from _surface at the point locations, very quickly
// _list contains x,y,u,v values, repeated for each point sprite
pbWebGl.prototype.blitDrawImagesPointAnim = function(_list, _listLength, _surface, _textureNumber )
{
	this.shaders.setProgram(this.shaders.blitShaderPointAnimProgram, _textureNumber);

	if (this.textures.prepare( _surface.imageData, null, _surface.isNPOT ))
	{
		this.prepareBuffer();
		this.shaders.prepare(_textureNumber);

		var max = Math.max(_surface.cellSourceSize[0].wide, _surface.cellSourceSize[0].high);
		// set the size of the 'point' (it's square)
		if (this.shaders.getUniform( "uSize" ))
		{
			gl.uniform1f( this.shaders.getUniform( "uSize" ), max );
		}
		// set the dimensions of the actual texture (can be rectangular)
		if (this.shaders.getUniform( "uTextureSize" ))
		{
			gl.uniform2f( this.shaders.getUniform( "uTextureSize" ), 1 / _surface.cellsWide, 1 / _surface.cellsHigh );
		}
	}

	// TODO: generate warning if length is capped
	var len = Math.min(_listLength, MAX_SPRITES * 4);

	// make a buffer view of the _list which is only as long as we need
    var buffer = _list.subarray(0, len);
    gl.bufferData( gl.ARRAY_BUFFER, buffer, gl.STATIC_DRAW );
    gl.vertexAttribPointer( this.shaders.getAttribute( "aPosition" ), 2, gl.FLOAT, false, 4 * 4, 0 * 4 );
    gl.vertexAttribPointer( this.shaders.getAttribute( "aTextureCoord" ), 2, gl.FLOAT, false, 4 * 4, 2 * 4 );
    gl.drawArrays(gl.POINTS, 0, len / 4);
};


// TODO: turns out we can use multiple bindBuffers instead of interleaving the data... give it a test for speed!  (I suspect this will cause additional stalls when transmitting the data)
    // gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    // gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 0, 0);
    // gl.enableVertexAttribArray(colorLoc);
    // gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
    // gl.vertexAttribPointer(vertLoc, 2, gl.FLOAT, false, 0, 0);
    // gl.enableVertexAttribArray(vertLoc);
    // gl.drawArrays(gl.POINTS, 0, numPoints);


// unused.  Sends tx,ty,sin,cos,sx,sy and u,v to gl.
pbWebGl.prototype.batchDrawImages = function( _textureNumber, _list, _surface )
{
	this.shaders.setProgram(this.shaders.batchImageShaderProgram, _textureNumber);

	if (this.textures.prepare( _surface.imageData, null, _surface.isNPOT ))
	{
		this.prepareBuffer();
		this.shaders.prepare(_textureNumber);
	}

	// TODO: generate warning if length is capped
	var len = Math.min(_list.length, MAX_SPRITES);

	// store local reference to avoid extra scope resolution (http://www.slideshare.net/nzakas/java-script-variable-performance-presentation)
    var buffer = this.drawingArray.subarray(0, len * (44 + 22) - 22);

	// weird loop speed-up (http://www.paulirish.com/i/d9f0.png) gained 2fps on my rig (chrome)!
	for ( var i = -1, c = 0; ++i < len; c += 44 )
	{
		// set up texture reference coordinates based on the image frame number
		var img = _list[i].image;
		var cell = Math.floor(img.cellFrame);
		var surface = img.surface;
		// half width, half height (of source frame)
		var wide = surface.cellSourceSize[cell].wide * 0.5;
		var high = surface.cellSourceSize[cell].high * 0.5;
		var rect = surface.cellTextureBounds[cell];
		var tex_x = rect.x;
		var tex_y = rect.y;
		var tex_r = rect.x + rect.width;
		var tex_b = rect.y + rect.height;

		var cos = -Math.cos(_list[i].angle);
		var sin = Math.sin(_list[i].angle);
		var scale = _list[i].scale;
		var x = Math.round(_list[i].x);
		var y = Math.round(_list[i].y);
		var z = _list[i].z;

		if ( i > 0)
		{
			// degenerate triangle: repeat the last vertex and the next vertex
			// 
			// screen destination position
			buffer[ c     ] = buffer[ c - 44 + 33 ];
			buffer[ c + 1 ] = buffer[ c - 44 + 34 ];
			buffer[ c + 11] = -wide;
			buffer[ c + 12] =  high;

			// texture source position and size
			buffer[ c + 2 ] = buffer[c - 44 + 35];
			buffer[ c + 3 ] = buffer[c - 44 + 36];
			buffer[ c + 15] = tex_x;
			buffer[ c + 16] = tex_y;

			// rotation cos & sin components
			buffer[ c + 4 ] = buffer[c - 44 + 37];
			buffer[ c + 5 ] = buffer[c - 44 + 38];
			buffer[ c + 15] = sin;
			buffer[ c + 16] = cos;

			// scaling sx & sy components
			buffer[ c + 6 ] = buffer[ c - 44 + 39];
			buffer[ c + 7 ] = buffer[ c - 44 + 40];
			buffer[ c + 17] = scale;
			buffer[ c + 18] = scale;

			// world translation
			buffer[ c + 8 ] = buffer[c - 44 + 41];
			buffer[ c + 9 ] = buffer[c - 44 + 42];
			buffer[ c + 10] = buffer[c - 44 + 43];
			buffer[ c + 19] = x;
			buffer[ c + 20] = y;
			buffer[ c + 21] = z;

			c += 22;
		}

		// screen destination position
		// l, b,		0,1
		// l, t,		11,12
		// r, b,		22,23
		// r, t,		33,34
		buffer[ c     ] = buffer[ c + 11] = -wide;		// l
		buffer[ c + 1 ] = buffer[ c + 23] =  high;		// b
		buffer[ c + 22] = buffer[ c + 33] =  wide;		// r
		buffer[ c + 12] = buffer[ c + 34] = -high;		// t

		// texture source position
		// l, b,		2,3
		// l, t,		13,14
		// r, b,		24,25
		// r, t,		35,36
		buffer[ c + 2 ] = buffer[ c + 13] = tex_x;		// l
		buffer[ c + 3 ] = buffer[ c + 25] = tex_y;		// b
		buffer[ c + 24] = buffer[ c + 35] = tex_r;		// r
		buffer[ c + 14] = buffer[ c + 36] = tex_b;		// t

		// rotation cos & sin components
		//  4, 5
		// 15,16
		// 26,27
		// 37,38
		buffer[ c + 4 ] = buffer[ c + 15] = buffer[ c + 26] = buffer[ c + 37] = cos;
		buffer[ c + 5 ] = buffer[ c + 16] = buffer[ c + 27] = buffer[ c + 38] = sin;

		// scaling sx & sy components
		//  6, 7
		// 17,18
		// 28,29
		// 39,40
		buffer[ c + 6 ] = buffer[ c + 17] = buffer[ c + 28] = buffer[ c + 39] = scale;
		buffer[ c + 7 ] = buffer[ c + 18] = buffer[ c + 29] = buffer[ c + 40] = scale;

		// world translation
		buffer[ c + 8 ] = buffer[ c + 19] = buffer[ c + 30] = buffer[ c + 41] = x;
		buffer[ c + 9 ] = buffer[ c + 20] = buffer[ c + 31] = buffer[ c + 42] = y;

		// world depth (0 = front, 1 = back)
		buffer[ c + 10] = buffer[ c + 21] = buffer[ c + 32] = buffer[ c + 43] = z;
	}

	// point the attributes at the buffer (stride and offset are in bytes, there are 4 bytes per gl.FLOAT)
    gl.bufferData( gl.ARRAY_BUFFER, buffer, gl.STATIC_DRAW );
	gl.vertexAttribPointer( this.shaders.getAttribute( "aPosition" ) , 4, gl.FLOAT, false, 11 * 4, 0 * 4 );
	gl.vertexAttribPointer( this.shaders.getAttribute( "aTransform" ), 4, gl.FLOAT, false, 11 * 4, 4 * 4 );
	gl.vertexAttribPointer( this.shaders.getAttribute( "aTranslate" ), 3, gl.FLOAT, false, 11 * 4, 8 * 4 );

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, len * 6 - 2);		// four vertices per sprite plus two degenerate points
};


// Used by pbWebGlLayer for multiple sprite instances which are not particles
// Sends transform matrix elements to gl.
// _list object format: { image: pbImage, transform: pbMatrix3, z_order: Number }
pbWebGl.prototype.rawBatchDrawImages = function( _textureNumber, _list )
{
	var surface = _list[0].image.surface;

	this.shaders.setProgram(this.shaders.rawBatchImageShaderProgram, _textureNumber);

	if (this.textures.prepare( surface.imageData, _list[0].image.tiling, surface.isNPOT ))
	{
		this.prepareBuffer();
		this.shaders.prepare(_textureNumber);
	}

	// TODO: generate warning if length is capped
	var len = Math.min(_list.length, MAX_SPRITES);

	// store local reference to avoid extra scope resolution (http://www.slideshare.net/nzakas/java-script-variable-performance-presentation)
    var buffer = this.drawingArray.subarray(0, len * (44 + 22) - 22);

	// weird loop speed-up (http://www.paulirish.com/i/d9f0.png) gained 2fps on my rig!
	for ( var i = -1, c = 0; ++i < len; c += 44 )
	{
		var obj = _list[i];
		var img = obj.image;

		// set up texture reference coordinates based on the image frame number
		var cell = Math.floor(img.cellFrame);
		// half width, half height (of source frame)
		var wide = surface.cellSourceSize[cell].wide;
		var high = surface.cellSourceSize[cell].high;
		var oWide = surface.srcSize[cell].wide;
		var oHigh = surface.srcSize[cell].high;
		var off = { x:0, y:0 };
		if (surface.cellOffsets)
		{
			off = surface.cellOffsets[cell];
		}
		var rect = surface.cellTextureBounds[cell];
		if (!rect)
			console.log("ERROR: invalid cellFrame", cell);
		var tex_x = rect.x;
		var tex_y = rect.y;
		var tex_r = rect.x + rect.width;
		var tex_b = rect.y + rect.height;

		if ( i > 0)
		{
			// degenerate triangle: repeat the last vertex and the next vertex
			// 
			// screen destination position
			buffer[ c     ] = buffer[ c - 44 + 33 ];
			buffer[ c + 1 ] = buffer[ c - 44 + 34 ];

			// last transform matrix
			buffer[ c + 4 ] = buffer[ c + 4  - 44 ];
			buffer[ c + 5 ] = buffer[ c + 5  - 44 ];
			buffer[ c + 6 ] = buffer[ c + 6  - 44 ];
			buffer[ c + 7 ] = buffer[ c + 7  - 44 ];
			buffer[ c + 8 ] = buffer[ c + 8  - 44 ];
			buffer[ c + 9 ] = buffer[ c + 9  - 44 ];
			buffer[ c + 10] = buffer[ c + 10 - 44 ];

			c += 22;
		}

		// screen destination position
		// l, b,		0,1
		// l, t,		11,12
		// r, b,		22,23
		// r, t,		33,34
		var l = -oWide * img.anchorX + off.x;
		var r = wide + l;
		var t = -oHigh * img.anchorY + off.y;
		var b = high + t;
		if (img.corners)
		{
			var cnr = img.corners;
			// object has corner offets (skewing/perspective etc)
			buffer[ c     ] = cnr.lbx * l; buffer[ c + 1 ] = cnr.lby * b;
			buffer[ c + 11] = cnr.ltx * l; buffer[ c + 12] = cnr.lty * t;
			buffer[ c + 22] = cnr.rbx * r; buffer[ c + 23] = cnr.rby * b;
			buffer[ c + 33] = cnr.rtx * r; buffer[ c + 34] = cnr.rty * t;
		}
		else
		{
			buffer[ c     ] = l; buffer[ c + 1 ] = b;
			buffer[ c + 11] = l; buffer[ c + 12] = t;
			buffer[ c + 22] = r; buffer[ c + 23] = b;
			buffer[ c + 33] = r; buffer[ c + 34] = t;
		}

		// texture source position
		// l, b,		2,3
		// l, t,		13,14
		// r, b,		24,25
		// r, t,		35,36
		buffer[ c + 2 ] = buffer[ c + 13] = tex_x;		// l
		buffer[ c + 3 ] = buffer[ c + 25] = tex_b;		// b
		buffer[ c + 24] = buffer[ c + 35] = tex_r;		// r
		buffer[ c + 14] = buffer[ c + 36] = tex_y;		// t


		if ( i > 0 )
		{
			// next transform matrix for degenerate triangle preceding this entry

			// destination corner (left, bottom)
			buffer[ c - 22 + 11] = buffer[ c     ];
			buffer[ c - 22 + 12] = buffer[ c + 1 ];

			// model matrix and z_order
			buffer[ c - 22 + 15 ] = buffer[ c + 4 ] = buffer[ c + 15] = buffer[ c + 26] = buffer[ c + 37] = obj.transform[0];
			buffer[ c - 22 + 16 ] = buffer[ c + 5 ] = buffer[ c + 16] = buffer[ c + 27] = buffer[ c + 38] = obj.transform[1];
			buffer[ c - 22 + 17 ] = buffer[ c + 6 ] = buffer[ c + 17] = buffer[ c + 28] = buffer[ c + 39] = obj.transform[3];
			buffer[ c - 22 + 18 ] = buffer[ c + 7 ] = buffer[ c + 18] = buffer[ c + 29] = buffer[ c + 40] = obj.transform[4];
			buffer[ c - 22 + 19 ] = buffer[ c + 8 ] = buffer[ c + 19] = buffer[ c + 30] = buffer[ c + 41] = obj.transform[6];
			buffer[ c - 22 + 20 ] = buffer[ c + 9 ] = buffer[ c + 20] = buffer[ c + 31] = buffer[ c + 42] = obj.transform[7];
			buffer[ c - 22 + 21 ] = buffer[ c + 10] = buffer[ c + 21] = buffer[ c + 32] = buffer[ c + 43] = obj.z_order;
		}
		else
		{
			// model matrix and z_order (no degenerate triangle preceeds the first triangle in the strip)
			buffer[ c + 4 ] = buffer[ c + 15] = buffer[ c + 26] = buffer[ c + 37] = obj.transform[0];
			buffer[ c + 5 ] = buffer[ c + 16] = buffer[ c + 27] = buffer[ c + 38] = obj.transform[1];
			buffer[ c + 6 ] = buffer[ c + 17] = buffer[ c + 28] = buffer[ c + 39] = obj.transform[3];
			buffer[ c + 7 ] = buffer[ c + 18] = buffer[ c + 29] = buffer[ c + 40] = obj.transform[4];
			buffer[ c + 8 ] = buffer[ c + 19] = buffer[ c + 30] = buffer[ c + 41] = obj.transform[6];
			buffer[ c + 9 ] = buffer[ c + 20] = buffer[ c + 31] = buffer[ c + 42] = obj.transform[7];
			buffer[ c + 10] = buffer[ c + 21] = buffer[ c + 32] = buffer[ c + 43] = obj.z_order;
		}
	}

	// point the attributes at the buffer (stride and offset are in bytes, there are 4 bytes per gl.FLOAT)
    gl.bufferData( gl.ARRAY_BUFFER, buffer, gl.STATIC_DRAW );
	gl.vertexAttribPointer( this.shaders.getAttribute( "aPosition" ),     4, gl.FLOAT, false, 11 * 4,  0 * 4 );
	gl.vertexAttribPointer( this.shaders.getAttribute( "aModelMatrix0" ), 2, gl.FLOAT, false, 11 * 4,  4 * 4 );
	gl.vertexAttribPointer( this.shaders.getAttribute( "aModelMatrix1" ), 2, gl.FLOAT, false, 11 * 4,  6 * 4 );
	gl.vertexAttribPointer( this.shaders.getAttribute( "aModelMatrix2" ), 3, gl.FLOAT, false, 11 * 4,  8 * 4 );

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, len * 6 - 2);		// four vertices per sprite plus two degenerate points, except for the last one
};


// Used by pbBaseGlLayer for multiple sprite instances using GPU texture sources
// Sends transform matrix elements to gl.
// _list object format: { image: pbImage, transform: pbMatrix3, z_order: Number }
pbWebGl.prototype.rawBatchDrawTextures = function( _list )
{
	var surface = _list[0].image.surface;
	var srcTexture = surface.rttTexture;
	var srcTextureRegister = surface.rttTextureRegister;

	this.shaders.setProgram(this.shaders.rawBatchImageShaderProgram, srcTextureRegister);

	if (!this.positionBuffer)
		this.prepareBuffer();

	this.textures.prepareOnGPU( srcTexture, _list[0].image.tiling, _list[0].image.isNPOT, srcTextureRegister );
	this.shaders.prepare(srcTextureRegister);

	// TODO: generate warning if length is capped
	var len = Math.min(_list.length, MAX_SPRITES);
	// store local reference to avoid extra scope resolution (http://www.slideshare.net/nzakas/java-script-variable-performance-presentation)
    var buffer = this.drawingArray.subarray(0, len * (44 + 22) - 22);

	var wide, high;
	// half width, half height (of source frame)
	wide = srcTexture.width;
	high = srcTexture.height;

    var l, r, t, b;

	for ( var i = -1, c = 0; ++i < len; c += 44 )
	{
		var obj = _list[i];
		var img = obj.image;

		// set up texture reference coordinates based on the image frame number
		var cell = Math.floor(img.cellFrame);
		var rect = surface.cellTextureBounds[cell];
		if (!rect)
			console.log("ERROR: invalid cellFrame", cell);
		var tex_x = rect.x;
		var tex_y = rect.y;
		var tex_r = rect.x + rect.width;
		var tex_b = rect.y + rect.height;

		if ( i > 0)
		{
			// degenerate triangle: repeat the last vertex and the next vertex
			// 
			// screen destination position
			buffer[ c     ] = buffer[ c - 44 + 33 ];
			buffer[ c + 1 ] = buffer[ c - 44 + 34 ];

			// last transform matrix
			buffer[ c + 4 ] = buffer[ c + 4  - 44 ];
			buffer[ c + 5 ] = buffer[ c + 5  - 44 ];
			buffer[ c + 6 ] = buffer[ c + 6  - 44 ];
			buffer[ c + 7 ] = buffer[ c + 7  - 44 ];
			buffer[ c + 8 ] = buffer[ c + 8  - 44 ];
			buffer[ c + 9 ] = buffer[ c + 9  - 44 ];
			buffer[ c + 10] = buffer[ c + 10 - 44 ];

			c += 22;
		}

		// screen destination position
		// l, b,		0,1
		// l, t,		11,12
		// r, b,		22,23
		// r, t,		33,34
		if (img.corners)
		{
			var cnr = img.corners;
			l = -wide * img.anchorX;
			r = wide + l;
			t = -high * img.anchorY;
			b = high + t;
			// object has corner offets (skewing/perspective etc)
			buffer[ c     ] = cnr.lbx * l; buffer[ c + 1 ] = cnr.lby * b;
			buffer[ c + 11] = cnr.ltx * l; buffer[ c + 12] = cnr.lty * t;
			buffer[ c + 22] = cnr.rbx * r; buffer[ c + 23] = cnr.rby * b;
			buffer[ c + 33] = cnr.rtx * r; buffer[ c + 34] = cnr.rty * t;
		}
		else
		{
			l = -wide * img.anchorX;
			r = wide + l;
			t = -high * img.anchorY;
			b = high + t;
			buffer[ c     ] = l; buffer[ c + 1 ] = b;
			buffer[ c + 11] = l; buffer[ c + 12] = t;
			buffer[ c + 22] = r; buffer[ c + 23] = b;
			buffer[ c + 33] = r; buffer[ c + 34] = t;
		}

		// texture source position
		// l, b,		2,3
		// l, t,		13,14
		// r, b,		24,25
		// r, t,		35,36
		buffer[ c + 2 ] = buffer[ c + 13] = tex_x;		// l
		buffer[ c + 3 ] = buffer[ c + 25] = tex_b;		// b
		buffer[ c + 24] = buffer[ c + 35] = tex_r;		// r
		buffer[ c + 14] = buffer[ c + 36] = tex_y;		// t


		if ( i > 0 )
		{
			// next transform matrix for degenerate triangle preceding this entry

			// destination corner (left, bottom)
			buffer[ c - 22 + 11] = buffer[ c     ];
			buffer[ c - 22 + 12] = buffer[ c + 1 ];

			// model matrix and z_order
			buffer[ c - 22 + 15 ] = buffer[ c + 4 ] = buffer[ c + 15] = buffer[ c + 26] = buffer[ c + 37] = obj.transform[0];
			buffer[ c - 22 + 16 ] = buffer[ c + 5 ] = buffer[ c + 16] = buffer[ c + 27] = buffer[ c + 38] = obj.transform[1];
			buffer[ c - 22 + 17 ] = buffer[ c + 6 ] = buffer[ c + 17] = buffer[ c + 28] = buffer[ c + 39] = obj.transform[3];
			buffer[ c - 22 + 18 ] = buffer[ c + 7 ] = buffer[ c + 18] = buffer[ c + 29] = buffer[ c + 40] = obj.transform[4];
			buffer[ c - 22 + 19 ] = buffer[ c + 8 ] = buffer[ c + 19] = buffer[ c + 30] = buffer[ c + 41] = obj.transform[6];
			buffer[ c - 22 + 20 ] = buffer[ c + 9 ] = buffer[ c + 20] = buffer[ c + 31] = buffer[ c + 42] = obj.transform[7];
			buffer[ c - 22 + 21 ] = buffer[ c + 10] = buffer[ c + 21] = buffer[ c + 32] = buffer[ c + 43] = obj.z_order;
		}
		else
		{
			// model matrix and z_order (no degenerate triangle preceeds the first triangle in the strip)
			buffer[ c + 4 ] = buffer[ c + 15] = buffer[ c + 26] = buffer[ c + 37] = obj.transform[0];
			buffer[ c + 5 ] = buffer[ c + 16] = buffer[ c + 27] = buffer[ c + 38] = obj.transform[1];
			buffer[ c + 6 ] = buffer[ c + 17] = buffer[ c + 28] = buffer[ c + 39] = obj.transform[3];
			buffer[ c + 7 ] = buffer[ c + 18] = buffer[ c + 29] = buffer[ c + 40] = obj.transform[4];
			buffer[ c + 8 ] = buffer[ c + 19] = buffer[ c + 30] = buffer[ c + 41] = obj.transform[6];
			buffer[ c + 9 ] = buffer[ c + 20] = buffer[ c + 31] = buffer[ c + 42] = obj.transform[7];
			buffer[ c + 10] = buffer[ c + 21] = buffer[ c + 32] = buffer[ c + 43] = obj.z_order;
		}
	}

	// point the attributes at the buffer (stride and offset are in bytes, there are 4 bytes per gl.FLOAT)
    gl.bufferData( gl.ARRAY_BUFFER, buffer, gl.STATIC_DRAW );
	gl.vertexAttribPointer( this.shaders.getAttribute( "aPosition" ),     4, gl.FLOAT, false, 11 * 4,  0 * 4 );
	gl.vertexAttribPointer( this.shaders.getAttribute( "aModelMatrix0" ), 2, gl.FLOAT, false, 11 * 4,  4 * 4 );
	gl.vertexAttribPointer( this.shaders.getAttribute( "aModelMatrix1" ), 2, gl.FLOAT, false, 11 * 4,  6 * 4 );
	gl.vertexAttribPointer( this.shaders.getAttribute( "aModelMatrix2" ), 3, gl.FLOAT, false, 11 * 4,  8 * 4 );

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, len * 6 - 2);		// four vertices per sprite plus two degenerate points, except for the last one
};


