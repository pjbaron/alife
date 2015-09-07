/**
 * pbWebGlDrawTextureSingle
 *
 * Contains methods for pbWebGl which draw a single sprite to the webGl display buffer, obtaining the data from a GPU texture
 *
 */




/**
 * drawTextureWithTransform - draw a texture that is on the GPU using the transform provided
 *
 * @param  {Object} _texture - the gl.createTexture reference to the texture, must have width, height and register members (eg. if pbWebGlTextures.initTexture created it)
 * @param  {pbMatrix3} _transform - the transform to apply, can specify translation, rotation and scaling, plus anything else that goes into a 3x3 homogenous matrix
 * @param  {Number} _z - the z depth at which to draw
 */
pbWebGl.prototype.drawTextureWithTransform = function( _texture, _transform, _z, _anchor )
{
	this.shaders.setProgram(this.shaders.imageShaderProgram, _texture.register);

	// console.log("drawTextureWithTransform", _texture);
	if (!this.positionBuffer)
		this.prepareBuffer();

	// _texture, _tiling, _npot, _texture.register
// TODO: set correct values for _tiling and _npot instead of hard-wiring them here
	this.textures.prepareOnGPU(_texture, false, true, _texture.register);
	this.shaders.prepare(_texture.register);

	// split off a small part of the big buffer, for a single display object
	var buffer = this.drawingArray.subarray(0, 16);

	var wide, high;
	// half width, half height (of source frame)
	wide = _texture.width;
	high = _texture.height;

	// screen destination position
	// l, b,		0,1
	// l, t,		4,5
	// r, b,		8,9
	// r, t,		12,13
	var l, r, t, b;
	if (_anchor)
	{
		l = -wide * _anchor.x;
		r = wide + l;
		t = high * _anchor.y;
		b = -high + t;
	}
	else
	{
		l = -wide * 0.5;
		r = wide + l;
		t = high * 0.5;
		b = -high + t;
	}
	buffer[ 0 ] = buffer[ 4 ] = l;
	buffer[ 1 ] = buffer[ 9 ] = b;
	buffer[ 8 ] = buffer[ 12] = r;
	buffer[ 5 ] = buffer[ 13] = t;

	// texture source position (use the whole texture)
	// x, b,		2,3
	// x, y,		6,7
	// r, b,		10,11
	// r, y,		14,15
	buffer[ 2 ] = buffer[ 6 ] = buffer[ 7 ] = buffer[ 15] = 0;
	buffer[ 3 ] = buffer[ 11] = buffer[ 10] = buffer[ 14] = 1.0;

    // bind the source buffer
    gl.bindBuffer( gl.ARRAY_BUFFER, this.positionBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, buffer, gl.STATIC_DRAW );

	gl.activeTexture( gl.TEXTURE0 + _texture.register );
	gl.bindTexture(gl.TEXTURE_2D, _texture);

	// send the transform matrix to the vector shader
	// OBSCURE ERROR NOTE: "No function was found that matched the signature provided."
	// is caused by undefined _transform, check the caller.
	gl.uniformMatrix3fv( this.shaders.getUniform( "uModelMatrix" ), gl.FALSE, _transform );

	// set the depth value
   	gl.uniform1f( this.shaders.getUniform( "uZ" ), _z );

	// point the position attribute at the last bound buffer
	// OBSCURE ERROR NOTE: "no bound ARRAY_BUFFER"
	// is caused by null in this.positionBuffer above
    gl.vertexAttribPointer( this.shaders.getAttribute( "aPosition" ), 4, gl.FLOAT, gl.FALSE, 0, 0 );
	gl.enableVertexAttribArray(this.shaders.getAttribute( "aPosition" ));
    // four vertices per quad, one quad
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};


pbWebGl.prototype.drawTextureToDisplay = function( _texture, _shaderProgram)
{
	if (_shaderProgram !== undefined)
		this.shaders.setProgram(_shaderProgram, _texture.register);
	else
		this.shaders.setProgram(this.shaders.simpleShaderProgram, _texture.register);

	if (!this.positionBuffer)
		this.prepareBuffer();

	// create a buffer for the vertices used to transfer the render-to-texture to the display
	var buffer = this.drawingArray.subarray(0, 16);

	var verts = [
		1,  1,
		-1,  1,
		-1, -1,
		1,  1,
		-1, -1,
		1, -1
	];
    gl.bindBuffer( gl.ARRAY_BUFFER, this.positionBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW );

	gl.activeTexture( gl.TEXTURE0 + _texture.register );
	gl.bindTexture(gl.TEXTURE_2D, _texture);

	gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(0);
	gl.drawArrays(gl.TRIANGLES, 0, 3 * 2);	// three vertices per tri, two tris
};


pbWebGl.prototype.applyShaderToTexture = function( _srcTexture, _callback, _context)
{
	// callback to set the shader program and parameters
	_callback.call(_context, this.shaders, _srcTexture.register);

	if (!this.positionBuffer)
		this.prepareBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, this.positionBuffer );

	// create a buffer for the vertices used to draw the _srcTexture to the _dstTexture
	var buffer = this.drawingArray.subarray(0, 16);

	var verts = [
		1,  1,
		-1,  1,
		-1, -1,
		1,  1,
		-1, -1,
		1, -1
	];

	gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW );

	gl.activeTexture(gl.TEXTURE0 + _srcTexture.register);
	gl.bindTexture(gl.TEXTURE_2D, _srcTexture);

	gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(0);
	gl.drawArrays(gl.TRIANGLES, 0, 3 * 2);	// three vertices per tri, two tris
};


