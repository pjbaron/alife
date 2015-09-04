/**
 * pbWebGlGraphics
 *
 * Contains methods for pbWebGl which support direct drawing to a GPU texture
 *
 * TODO: needs to be extended to encompass as much Canvas drawing behaviour as is possible and/or useful
 * 
 */



pbWebGl.prototype.fillStyle = function(_fillColor, _lineColor)
{
	this.fillColorRGBA = _fillColor;
	this.lineColorValue = _lineColor;
	this.fillColorString = "#000";			// fill color as a css format color string, # prefixed, rgb(), rgba() or hsl()
	this.fillColorValue = 0;				// fill color as a Number
	this.fillColorRGBA = { r: 0, g: 0, b: 0, a: 0 };
	this.lineColorString = "#000";			// line color as a css format color string, # prefixed, rgb(), rgba() or hsl()
	this.lineColorValue = 0;				// line color as a Number
	this.lineColorRGBA = { r: 0, g: 0, b: 0, a: 0 };
};


// test for webgl drawing basics
pbWebGl.prototype.fillRect = function( x, y, wide, high, color, targetWidth, targetHeight )
{
	// console.log( "pbWebGl.fillRect" );
	if (targetWidth === undefined) targetWidth = pbPhaserRender.width;
	if (targetHeight === undefined) targetHeight = pbPhaserRender.height;

	this.shaders.setProgram(this.shaders.graphicsShaderProgram);

	var x2 = x + wide;
	var y2 = y + high;
	var vertices =
	[
         x, y,
         x2, y,
         x, y2,
         x2, y2
    ];

	this.bgVertexBuffer = gl.createBuffer();
	this.bgVertexBuffer.numPoints = 4;
	gl.bindBuffer( gl.ARRAY_BUFFER, this.bgVertexBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( vertices ), gl.STATIC_DRAW );

	var r = color.r / 255.0;
	var g = color.g / 255.0;
	var b = color.b / 255.0;
	var a = color.a / 255.0;
	
	var colors =
	[
		r,g,b,a,
		r,g,b,a,
		r,g,b,a,
		r,g,b,a
	];

	this.bgColorBuffer = gl.createBuffer();
	this.bgColorBuffer.numPoints = 4;
	gl.bindBuffer( gl.ARRAY_BUFFER, this.bgColorBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( colors ), gl.STATIC_DRAW );

	gl.bindBuffer( gl.ARRAY_BUFFER, this.bgVertexBuffer );
	gl.vertexAttribPointer( this.shaders.getAttribute( "aPosition" ), 2, gl.FLOAT, gl.FALSE, 0, 0 );

	gl.bindBuffer( gl.ARRAY_BUFFER, this.bgColorBuffer );
	gl.vertexAttribPointer( this.shaders.getAttribute( "aColor" ), 4, gl.FLOAT, gl.FALSE, 0, 0 );

	gl.uniform2f( this.shaders.getUniform( "resolution" ), targetWidth, targetHeight );

	gl.drawArrays( gl.TRIANGLE_STRIP, 0, this.bgVertexBuffer.numPoints );
};


// test for webgl drawing basics
pbWebGl.prototype.drawRect = function( x, y, wide, high, color, targetWidth, targetHeight )
{
	// console.log( "pbWebGl.drawRect" );
	if (targetWidth === undefined) targetWidth = pbPhaserRender.width;
	if (targetHeight === undefined) targetHeight = pbPhaserRender.height;

	// TODO: this is the only line that differs from fillRect... merge them
	this.shaders.setProgram(this.shaders.lineShaderProgram);

	var x2 = x + wide;
	var y2 = y + high;
	var vertices =
	[
         x, y, x2, y,
         x2, y, x2, y2,
         x2, y2, x, y2,
         x, y2, x, y
    ];

	this.bgVertexBuffer = gl.createBuffer();
	this.bgVertexBuffer.numPoints = 4 * 2;
	gl.bindBuffer( gl.ARRAY_BUFFER, this.bgVertexBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( vertices ), gl.STATIC_DRAW );

	var r = color.r / 255.0;
	var g = color.g / 255.0;
	var b = color.b / 255.0;
	var a = color.a / 255.0;
	
	gl.uniform4fv( this.shaders.getUniform( "uColor" ), [ r,g,b,a ] );

	gl.bindBuffer( gl.ARRAY_BUFFER, this.bgVertexBuffer );
	gl.vertexAttribPointer( this.shaders.getAttribute( "aPosition" ), 2, gl.FLOAT, gl.FALSE, 0, 0 );

	gl.uniform2f( this.shaders.getUniform( "resolution" ), targetWidth, targetHeight );

	gl.lineWidth(1.0);
	// TODO: use LINESTRIP
	gl.drawArrays( gl.LINES, 0, this.bgVertexBuffer.numPoints );
};


