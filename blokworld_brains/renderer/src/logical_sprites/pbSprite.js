/**
 * 
 * pbSprite - wrapper to bind pbSurface, pbImage and pbTransformObject together to create a simple to use Sprite object
 * 
 */



function pbSprite()
{
    this.layer = null;
    this.textureObject = null;
    this.surface = null;
    this.image = null;
    this.transform = new pbTransformObject();
}


pbSprite.prototype.constructor = pbSprite;


pbSprite.prototype.createWithKey = function(_x, _y, _key, _layer)
{
    this.layer = _layer || null;

    // get the texture object from the textures dictionary using 'key'
    this.textureObject = textures.getFirst(_key);
    // set up easy access to the surface
    this.surface = this.textureObject.surface;
    // create an image holder and attach the surface
    this.image = new imageClass();
    this.image.create(this.surface);

    // create a transform object for the image
    this.transform.create(this.image, _x, _y);

    // if a layer is specified, add the new object as a child of it
    if (this.layer !== null)
        this.layer.addChild(this.transform);
};


pbSprite.prototype.createGPU = function(_x, _y, _texture, _layer)
{
    this.layer = _layer || null;

    // create an image holder and attach the surface
    this.image = new imageClass();
    // _surface, _cellFrame, _anchorX, _anchorY, _tiling, _fullScreen
    this.image.create(null);
    this.image.onGPU = _texture;

    // create a transform object for the image
    this.transform.create(this.image, _x, _y);

    // if a layer is specified, add the new object as a child of it
    if (this.layer !== null)
        this.layer.addChild(this.transform);
};


// pbSprite.prototype.createWithTexture = function(_x, _y, _texture, _layer)
// {
//     this.layer = _layer || null;

//     // get the texture object from the textures dictionary using 'key'
//     this.textureObject = textures.getFirst(_key);
//     // set up easy access to the surface
//     this.surface = this.textureObject.surface;
//     // create an image holder and attach the surface
//     this.image = new imageClass();
//     this.image.create(this.surface);
//     // create a transform object for the image
//     this.transform = new pbTransformObject();
//     this.transform.create(this.image, _x, _y);

//     // if a layer is specified, add the new object as a child of it
//     if (this.layer !== null)
//         this.layer.addChild(this.transform);
// };


pbSprite.prototype.destroy = function()
{
    if (this.layer) this.layer.removeChild(this.transform);
    this.layer = null;

    this.textureObject = null;

    this.surface = null;

    if (this.image) this.image.destroy();
    this.image = null;
    
    if (this.transform) this.transform.destroy();
    this.transform = null;
};


Object.defineProperties(pbSprite.prototype, {

    x: {
        get: function () {
            return this.transform.x;
        },
        set: function (value) {
            this.transform.x = value;
        }
    },

    y: {
        get: function () {
            return this.transform.y;
        },
        set: function (value) {
            this.transform.y = value;
        }
    },

    z: {
        get: function () {
            return this.transform.z;
        },
        set: function (value) {
            this.transform.z = value;
        }
    },

    angleInRadians: {
        get: function () {
            return this.transform.angleInRadians;
        },
        set: function (value) {
            this.transform.angleInRadians = value;
        }
    },

    scaleX: {
        get: function () {
            return this.transform.scaleX;
        },
        set: function (value) {
            this.transform.scaleX = value;
        }
    },
    scaleY: {
        get: function () {
            return this.transform.scaleY;
        },
        set: function (value) {
            this.transform.scaleY = value;
        }
    },

    anchorX: {
        get: function () {
            return this.image.anchorX;
        },
        set: function (value) {
            this.image.anchorX = value;
        }
    },

    anchorY: {
        get: function () {
            return this.image.anchorY;
        },
        set: function (value) {
            this.image.anchorY = value;
        }
    },

    fullScreen: {
    	get: function() {
    		return this.image.fullScreen;
    	},
    	set: function(value) {
    		this.image.fullScreen = value;
    	}
    },

    tiling: {
    	get: function() {
    		return this.image.tiling;
    	},
    	set: function(value) {
    		this.image.tiling = value;
    	}
    },

    cellFrame: {
        get: function() {
            return this.image.cellFrame;
        },
        set: function(value) {
            this.image.cellFrame = value;
        }
    }
});

