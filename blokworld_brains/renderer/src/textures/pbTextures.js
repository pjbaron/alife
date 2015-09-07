/**
 *
 * Manager for textures - loaded and created
 * Extends pbDictionary
 * 
 */


function pbTextures()
{
	this.super(pbTextures, 'constructor');
}


pbTextures.prototype = new pbDictionary();
pbTextures.prototype.constructor = pbTextures;
pbTextures.prototype.__super__ = pbDictionary;


/**
 * [addGPUTexture description]
 *
 * @param {[type]} _key   [description]
 * @param {[type]} _value [description]
 *
 * @return {Boolean} true if key already existed and we added another value to it
 */
pbTextures.prototype.addGPUTexture = function(_key, _textureIndex)
{
	// add the _textureIndex to the textures dictionary referenced by 'key'
	// on access the null 'surface' value will cause a test for 'GPU'
	return this.super(pbTextures, 'add', _key, { imageData: null, surface: null, GPU: _textureIndex });	
};

