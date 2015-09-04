/**
 *
 * pbWebGlShaders.js - data and support code for webGl shaders
 * 
 */


// TODO: move actual shader code out into new files?  Look into other ways to represent the shader code.

/**
 * blitShaderPointAnimSources - uses glPoint to set position and expands it to provide space for square textures
 * No rotation, no skew.  Limited scaling.  Animation (specify the top left corner in the source texture).
 * 
*/
var blitShaderPointAnimSources = {
	fragment:
		"  precision mediump float;" +
		"  uniform sampler2D uImageSampler;" +
		"  uniform vec2 uTextureSize;" +
		"  varying mediump vec2 texCoord;" +
		"  void main () {" +
		"    mediump vec2 coord = texCoord + (gl_PointCoord * uTextureSize);" +
		"    gl_FragColor = texture2D(uImageSampler, coord);" +
		"  }",

	vertex:
		"  precision mediump float;" +
		"  attribute vec2 aPosition;" +
		"  attribute vec2 aTextureCoord;" +
		"  uniform float uSize;" +
		"  uniform mat3 uProjectionMatrix;" +
		"  varying mediump vec2 texCoord;" +
		"  void main() {" +
		"    gl_PointSize = uSize;" +
		"    vec3 pos = vec3(aPosition, 1);" +
		"    gl_Position = vec4(uProjectionMatrix * pos, 1);" +
		"    texCoord = aTextureCoord;" +
		"  }",

	attributes:
		[ "aPosition", "aTextureCoord" ],

	uniforms:
		[ "uProjectionMatrix", "uSize", "uTextureSize" ],

	samplers:
		[ "uImageSampler" ]
};


/**
 * blitShaderPointSources - uses glPoint to set position and expands it to provide space for square textures
 * No rotation, no animation, no skew.  Limited scaling.
 * Very fast.
 * 
 */
var blitShaderPointSources = {
	fragment:
		"  precision mediump float;" +
		"  uniform sampler2D uImageSampler;" +
		"  uniform vec2 uTextureSize;" +
		"  void main () {" +
		"    mediump vec2 coord = gl_PointCoord * uTextureSize;" +
		"    gl_FragColor = texture2D(uImageSampler, coord);" +
		"  }",

	vertex:
		"  precision mediump float;" +
		"  attribute vec2 aPosition;" +
		"  uniform float uSize;" +
		"  uniform mat3 uProjectionMatrix;" +
		"  void main() {" +
		"    gl_PointSize = uSize;" +
		"    vec3 pos = vec3(aPosition, 1);" +
		"    gl_Position = vec4(uProjectionMatrix * pos, 1);" +
		"  }",

	attributes:
		[ "aPosition" ],

	uniforms:
		[ "uProjectionMatrix", "uSize", "uTextureSize" ],

	samplers:
		[ "uImageSampler" ]
};


/**
 * blitShaderSources - shaders for image blitting 
 * no transform in the shader, simple particles
 * data = 24 floats per quad (4 corners * x,y,u,v plus 2 degenerate triangles to separate them)
 * @type {Array}
 */
var blitShaderSources = {
	fragment:
		"  precision lowp float;" +
		"  uniform sampler2D uImageSampler;" +
		"  varying vec2 vTexCoord;" +
		"  void main(void) {" +
		"    gl_FragColor = texture2D(uImageSampler, vTexCoord);" +
		"  }",

	vertex:
		"  precision lowp float;" +
		"  attribute vec4 aPosition;" +
		"  varying vec2 vTexCoord;" +
		"  void main(void) {" +
		"    gl_Position.zw = vec2(1, 1);" +
		"    gl_Position.xy = aPosition.xy;" +
		"    vTexCoord = aPosition.zw;" +
		"  }",

	attributes:
		[ "aPosition" ],

	samplers:
		[ "uImageSampler" ]
};


/**
 * imageShaderSources - shaders for single image drawing including matrix transforms for scalex,scaley, rotation and translation
 * @type {Array}
 */
var imageShaderSources = {
	fragment:
		"  precision mediump float;" +
		"  uniform sampler2D uImageSampler;" +
		"  varying vec2 vTexCoord;" +
		"  void main(void) {" +
		"    gl_FragColor = texture2D(uImageSampler, vTexCoord);\n" +
		"//    if (gl_FragColor.a < 0.80) discard;\n" +
		"  }",

	vertex:
		"  attribute vec4 aPosition;" +
		"  uniform float uZ;" +
		"  uniform mat3 uProjectionMatrix;" +
		"  uniform mat3 uModelMatrix;" +
		"  varying vec2 vTexCoord;" +
		"  void main(void) {" +
		"    vec3 pos = uProjectionMatrix * uModelMatrix * vec3(aPosition.xy, 1);" +
		"    gl_Position = vec4(pos.xy, uZ, 1);" +
		"    vTexCoord = aPosition.zw;" +
		"  }",

	attributes:
		[ "aPosition" ],

	uniforms:
		[ "uZ", "uProjectionMatrix", "uModelMatrix" ],

	samplers:
		[ "uImageSampler" ]
};


/**
 * batchImageShaderSources - shaders for batch image drawing
 * calculates the transform matrix from the values provided in the data buffer stream
 * @type {Array}
 */
var batchImageShaderSources = {
	fragment:
		"  precision mediump float;" +
		"  uniform sampler2D uImageSampler;" +
		"  varying vec2 vTexCoord;" +
		"  void main(void) {" +
		"    gl_FragColor = texture2D(uImageSampler, vTexCoord);" +
		"    if (gl_FragColor.a < 0.80) discard;" +
		"  }",

	vertex:
		"  attribute vec4 aPosition;" +
		"  attribute vec4 aTransform;" +
		"  attribute vec3 aTranslate;" +
		"  uniform mat3 uProjectionMatrix;" +
		"  varying vec2 vTexCoord;" +
		"  varying vec2 vAbsCoord;" +
		"  void main(void) {" +
		"    mat3 modelMatrix;" +
		"    modelMatrix[0] = vec3( aTransform.x * aTransform.z,-aTransform.y * aTransform.w, 0 );" +
		"    modelMatrix[1] = vec3( aTransform.y * aTransform.z, aTransform.x * aTransform.w, 0 );" +
		"    modelMatrix[2] = vec3( aTranslate.x, aTranslate.y, 1 );" +
		"    vec3 pos = uProjectionMatrix * modelMatrix * vec3( aPosition.xy, 1 );" +
		"    gl_Position = vec4(pos.xy, aTranslate.z, 1);" +
		"    vTexCoord = aPosition.zw;" +
		"  }",

	attributes:
		[ "aPosition", "aTransform", "aTranslate" ],

	uniforms:
		[ "uProjectionMatrix" ],

	samplers:
		[ "uImageSampler" ]
};


/**
 * rawBatchImageShaderSources - shaders for batch image drawing
 * requires the transform matrix in the data buffer stream
 * @type {Array}
 */
var rawBatchImageShaderSources = {
	fragment:
		"  precision mediump float;" +
		"  uniform sampler2D uImageSampler;" +
		"  varying vec2 vTexCoord;" +
		"  void main(void) {" +
		"    gl_FragColor = texture2D(uImageSampler, vTexCoord);" +
		"    if (gl_FragColor.a < 0.80) discard;" +
		"  }",

	vertex:
		"  attribute vec4 aPosition;" +
		"  attribute vec2 aModelMatrix0;" +
		"  attribute vec2 aModelMatrix1;" +
		"  attribute vec3 aModelMatrix2;" +
		"  uniform mat3 uProjectionMatrix;" +
		"  varying vec2 vTexCoord;" +
		"  void main(void) {" +
		"    float z = aModelMatrix2.z;" +
		"    mat3 modelMatrix;" +
		"    modelMatrix[0] = vec3(aModelMatrix0, 0);" +
		"    modelMatrix[1] = vec3(aModelMatrix1, 0);" +
		"    modelMatrix[2] = vec3(aModelMatrix2.xy, 1);" +
		"    vec3 pos = uProjectionMatrix * modelMatrix * vec3(aPosition.xy, 1);" +
		"    gl_Position = vec4(pos.xy, z, 1);" +
		"    vTexCoord = aPosition.zw;" +
		"  }",

	attributes:
		[ "aPosition", "aModelMatrix0", "aModelMatrix1", "aModelMatrix2" ],

	uniforms:
		[ "uProjectionMatrix" ],

	samplers:
		[ "uImageSampler" ]
};


/**
 * graphicsShaderSources - shaders for graphics primitive drawing
 * @type {Array}
 */
var graphicsShaderSources = {
	fragment:
		"  precision mediump float;" +
		"  varying vec4 vColor;" +
		"  void main(void) {" +
		"    gl_FragColor = vColor;" +
		"  }",

	vertex:
		"  uniform vec2 resolution;" +
		"  attribute vec2 aPosition;" +
		"  attribute vec4 aColor;" +
		"  varying vec4 vColor;" +
		"  void main(void) {" +
		"    vec2 zeroToOne = aPosition / resolution;" +
		"    vec2 zeroToTwo = zeroToOne * 2.0;" +
		"    vec2 clipSpace = zeroToTwo - 1.0;" +
		"    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);" +
		"    vColor = aColor;" +
		"  }",

	attributes:
		[ "aPosition", "aColor" ],

	uniforms:
		[ "resolution" ]
};


var lineShaderSources = {
	fragment:
		"  precision mediump float;\n" +
		"  uniform vec4 uColor;\n" +
		"  void main(void) {\n" +
		"    gl_FragColor = uColor;\n" +
		"  }\n",

	vertex:
		"  uniform vec2 resolution;\n" +
		"  attribute vec2 aPosition;\n" +
		"  void main(void) {\n" +
		"    vec2 zeroToOne = aPosition / resolution;\n" +
		"    vec2 zeroToTwo = zeroToOne * 2.0;\n" +
		"    vec2 clipSpace = zeroToTwo - 1.0;\n" +
		"    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);\n" +
		"  }\n",

	attributes:
		[ "aPosition" ],

	uniforms:
		[ "resolution", "uColor" ]
};


/**
 * imageShaderSource3D - shaders for single image drawing with 3D projection including matrix transforms for scalex,scaley, rotation and translation
 * @type {Array}
 */
var imageShaderSource3D = {
	fragment:
		"  precision mediump float;" +
		"  uniform sampler2D uImageSampler;" +
		"  varying vec2 vTexCoord;" +
		"  void main(void) {" +
		"    gl_FragColor = texture2D(uImageSampler, vTexCoord);" +
		"  }",

	vertex:
		"  precision mediump float;" +
		"  attribute vec4 aPosition;" +
		"  uniform mat4 uProjectionMatrix4;" +
		"  uniform mat4 uModelMatrix4;" +
		"  varying vec2 vTexCoord;" +
		"  void main(void) {" +
		"    vec4 pos = uProjectionMatrix4 * uModelMatrix4 * vec4(0, 0, 1, 1);" +
		"    gl_Position = vec4(pos.xyz, 1);" +
		"    vTexCoord = aPosition.zw;" +
		"  }",

	attributes:
		[ "aPosition" ],

	uniforms:
		[ "uProjectionMatrix4", "uModelMatrix4" ],

	samplers:
		[ "uImageSampler" ]
};


/**
 * modezShaderSources - mode z shaders for single image drawing including matrix transforms for scalex,scaley, rotation and translation
 * @type {Array}
 */
var modezShaderSources = {
	fragment:
		"  precision mediump float;" +
		"  uniform sampler2D uImageSampler;" +
		"  varying vec2 vTexCoord;" +
		"  const float high = 10.0;" +
		"  void main(void) {" +
		"    float x = vTexCoord.x * 2.0 - 1.0;" +
		"    float y = vTexCoord.y * 2.0 - 1.0;" +
		"    float r = high / y;" +
		"    if (r > 0.0)" +
		"    {" +
		"      vec2 c = vec2(x * r * 0.02 + 0.5, r * 0.02);" +
		"      gl_FragColor = vec4(texture2D(uImageSampler, c).rgb, 1.0);" +
		"      if (c.x < 0.0 || c.x > 1.0 || c.y < 0.0 || c.y > 1.0) discard;" +
		"    }" +
		"  }",
		//gl_FragColor = vec4(texture2D(uImageSampler, vTexCoord).rgb, 1.0);"

	vertex:
		"  precision mediump float;" +
		"  attribute vec4 aPosition;" +
		"  uniform float uZ;" +
		"  uniform mat3 uProjectionMatrix;" +
		"  uniform mat3 uModelMatrix;" +
		"  varying vec2 vTexCoord;" +
		"  void main(void) {" +
		"    vec3 pos = uProjectionMatrix * uModelMatrix * vec3(aPosition.xy, 1);" +
		"    gl_Position = vec4(pos.xy, uZ, 1);" +
		"    vTexCoord = aPosition.zw;" +
		"  }",

	attributes:
		[ "aPosition" ],

	uniforms:
		[ "uZ", "uProjectionMatrix", "uModelMatrix" ],

	samplers:
		[ "uImageSampler" ]
};


var simpleShaderSources = {
	fragment:
		" precision mediump float;" +
		" varying vec2 v_texcoord;" +
		" uniform sampler2D uImageSampler;" +
		" void main() {" +
    	"   gl_FragColor = texture2D(uImageSampler, v_texcoord);" +
		" }",

	vertex:
    	" attribute vec4 aPosition;" +
    	" varying vec2 v_texcoord;" +
		" void main() {" +
		"   gl_Position = aPosition;" +
		"   v_texcoord = aPosition.xy * 0.5 + 0.5;" +
		" }",

	attributes:
		[ "aPosition" ],

	samplers:
		[ "uImageSampler" ]
};




// static variables
pbWebGlShaders.currentProgram = -1;



function pbWebGlShaders()
{
	this.programList = null;
	pbWebGlShaders.currentProgram = -1;

	// hardwired shaders used by the renderer
	this.graphicsShaderProgram = -1;
	this.lineShaderProgram = -1;
	this.imageShaderProgram = -1;
	this.imageShaderProgram3D = -1;
	this.modezShaderProgram = -1;
	this.simpleShaderProgram = -1;
	this.blitShaderProgram = -1;
	this.blitShaderPointProgram = -1;
	this.blitShaderPointAnimProgram = -1;
	this.batchImageShaderProgram = -1;
	this.rawBatchImageShaderProgram = -1;
}


// TODO: add a 'register' method which is called to add only the shader programs we're going to actually use for a given demo
pbWebGlShaders.prototype.create = function()
{
	// create the shader programs for each drawing mode
	this.programList = [];

	// drawing
	this.graphicsShaderProgram = this.add( graphicsShaderSources );
	this.lineShaderProgram = this.add( lineShaderSources );

	// individual sprite processing
	this.imageShaderProgram = this.add( imageShaderSources );
	this.imageShaderProgram3D = this.add( imageShaderSource3D );
	this.modezShaderProgram = this.add( modezShaderSources );
	this.simpleShaderProgram = this.add( simpleShaderSources );

	// batch processing
	this.blitShaderProgram = this.add( blitShaderSources );
	this.blitShaderPointProgram = this.add( blitShaderPointSources );
	this.blitShaderPointAnimProgram = this.add( blitShaderPointAnimSources );
	this.batchImageShaderProgram = this.add( batchImageShaderSources );
	this.rawBatchImageShaderProgram = this.add( rawBatchImageShaderSources );
};


// TODO: use the list of registered shaders
pbWebGlShaders.prototype.destroy = function()
{
	this.clearProgram();

	this.programList = null;

	this.graphicsShaderProgram = -1;
	this.lineShaderProgram = -1;
	this.imageShaderProgram = -1;
	this.imageShaderProgram3D = -1;
	this.modezShaderProgram = -1;
	this.simpleShaderProgram = -1;
	this.blitShaderProgram = -1;
	this.blitShaderPointProgram = -1;
	this.blitShaderPointAnimProgram = -1;
	this.batchImageShaderProgram = -1;
	this.rawBatchImageShaderProgram = -1;

	pbWebGlShaders.currentProgram = -1;
};


pbWebGlShaders.prototype.addJSON = function( jsonString )
{
    var programJSON = JSON.parse(jsonString);
    programJSON.fragment = programJSON.fragment.join('\n');
    programJSON.vertex = programJSON.vertex.join('\n');
    return this.add( programJSON );
};


pbWebGlShaders.prototype.add = function( _shaderSource )
{
	var programIndex = this.programList.length;
	this.programList.push(this.createProgram( _shaderSource ));
	return programIndex;
};


pbWebGlShaders.prototype._getShader = function( sources, typeString )
{
	// work out which type it is
	var type;
	switch ( typeString )
	{
		case "fragment":
			type = gl.FRAGMENT_SHADER;
			break;
		case "vertex":
			type = gl.VERTEX_SHADER;
			break;
		default:
			alert( "Unrecognised shader type: " + typeString );
			return null;
	}

	// create the correct shader type
	var shader = gl.createShader( type );

	// provide the shader source
	var source = sources[ typeString ];
	gl.shaderSource( shader, source );

	// compile the shader (and check for errors)
	gl.compileShader( shader );
	var status = gl.getShaderParameter( shader, gl.COMPILE_STATUS );
	if ( !status )
	{
		alert( "Shader compile error: " + gl.getShaderInfoLog( shader ) + "\n(" + typeString + ")" );
		gl.deleteShader( shader );
		return null;
	}

	return shader;
};


// based on code from http://learningwebgl.com/
pbWebGlShaders.prototype.createProgram = function( _source )
{
	console.log( "pbWebGlShaders.createProgram" );

	// create a new shader program
	var program = gl.createProgram();

	// get the fragment shader and attach it to the program
	var fragmentShader = this._getShader( _source, "fragment" );
	gl.attachShader( program, fragmentShader );

	// get the vertex shader and attach it to the program
	var vertexShader = this._getShader( _source, "vertex" );
	gl.attachShader( program, vertexShader );

	// link the attached shaders to the program
	gl.linkProgram( program );
	if ( !gl.getProgramParameter( program, gl.LINK_STATUS ) )
	{
		alert( "Could not create shader program: ", gl.getProgramInfoLog( program ) );
		console.log( "pbWebGlShaders.createProgram ERROR: ", gl.getProgramInfoLog( program ), "\n", _source );
		gl.deleteProgram( program );
		program = null;
		return null;
	}

	// establish links to attributes
	if (_source.attributes)
	{
		program.attributes = {};
		for(var a in _source.attributes)
		{
			if (_source.attributes.hasOwnProperty(a))
			{
				var attribute = _source.attributes[a];
				program.attributes[attribute] = gl.getAttribLocation( program, attribute );
				if (program.attributes[attribute] === null)
					console.log("WARNING (pbWebGlShaders.createProgram): filter attribute returned NULL for", attribute, "it's probably unused in the filter", _source);
			}
		}
	}

	// establish links to uniforms
	if (_source.uniforms)
	{
		program.uniforms = {};
		for(var u in _source.uniforms)
		{
			if (_source.uniforms.hasOwnProperty(u))
			{
				var uniform = _source.uniforms[u];
				program.uniforms[uniform] = gl.getUniformLocation( program, uniform );
				if (program.uniforms[uniform] === null)
					console.log("WARNING (pbWebGlShaders.createProgram): filter uniform returned NULL for", uniform, "it's probably unused in the filter", _source);
			}
		}
	}

	// establish link to the texture sampler (source)
	if (_source.samplers)
	{
		program.samplerUniforms = {};
		for(var s in _source.samplers)
		{
			if (_source.samplers.hasOwnProperty(s))
			{
				var sampler = _source.samplers[s];
				program.samplerUniforms[sampler] = gl.getUniformLocation( program, sampler );
				if (program.samplerUniforms[sampler] === null)
					console.log("WARNING (pbWebGlShaders.createProgram): filter sampler returned NULL for", sampler, "it's probably unused in the filter", _source);
			}
		}
	}

//	program.samplerUniform = gl.getUniformLocation( program, _source.sampler );

	return program;
};


/**
 * [setProgram description]
 *
 * @param {[type]} _programIndex  [description]
 * @param {[type]} _textureNumber - the texture number offset from TEXTURE0 which will be set into this shader's samplerUniform as its data source
 */
pbWebGlShaders.prototype.setProgram = function(_programIndex, _textureNumber)
{
	if (pbWebGlShaders.currentProgram != _programIndex)
	{
		// remove the old program
		this.clearProgram();
		
		// set the new program
		pbWebGlShaders.currentProgram = _programIndex;
		var program = this.programList[ pbWebGlShaders.currentProgram ];
		gl.useProgram( program );

		// enable all attributes
		if (program.attributes)
			for(var a in program.attributes)
				if (program.attributes.hasOwnProperty(a))
					gl.enableVertexAttribArray( program.attributes[a] );

		// set the fragment shader sampler to use the correct texture
		if (program.samplerUniforms && program.samplerUniforms.uImageSampler)
	   		gl.uniform1i( program.samplerUniforms.uImageSampler, _textureNumber );

	   	return program;
	}

	return this.programList[ pbWebGlShaders.currentProgram ];
};


/**
 * 
 * http://www.mjbshaw.com/2013/03/webgl-fixing-invalidoperation.html
 *
 */
pbWebGlShaders.prototype.clearProgram = function()
{
	if (pbWebGlShaders.currentProgram != -1)
	{
		var program = this.programList[ pbWebGlShaders.currentProgram ];

		// break links to all attributes and disable them
		if (program.attributes)
		{
			for(var a in program.attributes)
			{
				if (program.attributes.hasOwnProperty(a))
				{
					var value = program.attributes[a];
					gl.disableVertexAttribArray( value );
				}
			}
		}

		pbWebGlShaders.currentProgram = -1;
	}
};



pbWebGlShaders.prototype.prepare = function(_textureNumber)
{
	if (_textureNumber === undefined)
    	_textureNumber = 0;
	
	var program = this.programList[ pbWebGlShaders.currentProgram ];

	if (program.samplerUniforms)
	{
		// set the shader to use TEXTURE0 and the first sampler uniform
		if (program.samplerUniforms.uImageSampler)
   			gl.uniform1i( program.samplerUniforms.uImageSampler, _textureNumber );
   	}

	if (program.uniforms)
	{
		// set up a projection matrix in the vertex shader
		if (program.uniforms.uProjectionMatrix)
			gl.uniformMatrix3fv( program.uniforms.uProjectionMatrix, false, pbMatrix3.makeProjection(gl.drawingBufferWidth, gl.drawingBufferHeight) );

		// set up a 3D projection matrix in the vertex shader
		if (program.uniforms.uProjectionMatrix4)
			gl.uniformMatrix4fv( program.uniforms.uProjectionMatrix4, false, pbMatrix4.makeProjection(gl.drawingBufferWidth, gl.drawingBufferHeight) );
	}
};


pbWebGlShaders.prototype.getAttribute = function( nameString )
{
	var program = this.programList[ pbWebGlShaders.currentProgram ];
	if (program.attributes[ nameString ] === undefined) console.log("ERROR: undefined Attribute ", nameString);	// might be a uniform?
	return program.attributes[ nameString ];
};


pbWebGlShaders.prototype.getUniform = function( nameString )
{
	var program = this.programList[ pbWebGlShaders.currentProgram ];
	if (program.uniforms[ nameString ] === undefined) console.log("ERROR: undefined Uniform ", nameString);	// might be an attribute?
	return program.uniforms[ nameString ];
};


pbWebGlShaders.prototype.getSampler = function( nameString )
{
	if (nameString === undefined) nameString = "uImageSampler";
	var program = this.programList[ pbWebGlShaders.currentProgram ];
	return program.samplerUniforms[ nameString ];
};


pbWebGlShaders.prototype.getCurrentProgram = function()
{
	return this.programList[ pbWebGlShaders.currentProgram ];
};
