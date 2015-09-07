/**
 *
 * pbSimpleLayer - Contains one layer of multiple pbTransformObject objects, simple layer does not permit rotation/scaling or nested children.
 *
 */


function pbSimpleLayer()
{
	this.parent = null;
	this.phaserRender = null;
	this.surface = null;
	this.drawList = null;
	this.drawCall = null;
	this.prepareCall = null;
	this.clipping = null;
}

// pbSimpleLayer extends from the pbTransformObject prototype chain
pbSimpleLayer.prototype = new pbTransformObject();
// create property to store the class' parent
pbSimpleLayer.prototype.__super__ = pbTransformObject;		// http://stackoverflow.com/questions/7300552/calling-overridden-methods-in-javascript


pbSimpleLayer.prototype.create = function(_parent, _renderer, _x, _y, _surface, _clipping)
{
	this.parent = _parent;
	this.phaserRender = _renderer;
	// call the pbTransformObject create for this pbSimpleLayer
	this.__super__.prototype.create.call(this, null, _x, _y);
	this.surface = _surface;
	this.drawList = new Float32Array(MAX_SPRITES * 4);
	// default to the safer (slower?) of the two drawing functions
	this.drawCall = this.draw;
	this.prepareCall = this.prepareXY;
	if (_clipping !== undefined)
		this.clipping = _clipping;
};


pbSimpleLayer.prototype.destroy = function()
{
	// call the pbTransformObject destroy for this pbSimpleLayer
	this.__super__.prototype.destroy.call(this);
	this.parent = null;
	this.phaserRender = null;
	this.surface = null;
	this.drawList = null;
	this.drawCall = null;
	this.prepareCall = null;
	this.clipping = null;
};


pbSimpleLayer.prototype.update = function(_dictionary)
{

	if (!this.drawCall || !this.prepareCall)
		return false;

	if (!this.alive)
		return true;

	if (this.children)
	{
		var drawLength = this.prepareCall.call(this);
		// call to draw all sprites in the drawList
		if (drawLength > 0)
			this.drawCall.call(this, drawLength);
	}

	return true;
};


/**
 * prepareXY - prepare drawList with only X,Y coordinates per sprite
 *
 * @return {[type]} [description]
 */
pbSimpleLayer.prototype.prepareXY = function()
{
	var drawLength = 0;
	var x = this.x;
	var y = this.y;

	// for all of my child sprites
	var c = Math.min(this.children.length, MAX_SPRITES);
	
	var child;
	if (this.clipping)
	{
		while(c--)
		{
			child = this.children[c];

			// add sprite location to drawList
			if (child.alive)
			{
				var nx = child.x + x;
				var ny = child.y + y;
				if (nx >= this.clipping.x && nx <= this.clipping.width)
				{
					if (ny >= this.clipping.y && ny <= this.clipping.height)
					{
						this.drawList[drawLength++] = nx;
						this.drawList[drawLength++] = ny;
					}
				}
			}
		}
	}
	else
	{
		while(c--)
		{
			child = this.children[c];

			// add sprite location to drawList
			if (child.alive)
			{
				this.drawList[drawLength++] = child.x + x;
				this.drawList[drawLength++] = child.y + y;
			}
		}
	}

	// debug sprite count
	sprCountDbg += drawLength / 2;

	return drawLength;
};


/**
 * prepareXYUV - prepare drawList with X,Y coordinates and U,V texture source positions per sprite
 *
 * @return {[type]} [description]
 */
pbSimpleLayer.prototype.prepareXYUV = function()
{
	var drawLength = 0;
	var x = this.x;
	var y = this.y;

	// for all of my child sprites
	var c = Math.min(this.children.length, MAX_SPRITES);
	
	var child, r;
	if (this.clipping)
	{
		while(c--)
		{
			child = this.children[c];

			// add sprite location to drawList
			if (child.alive)
			{
				var nx = child.x + x;
				var ny = child.y + y;
				if (nx >= this.clipping.x && nx <= this.clipping.width)
				{
					if (ny >= this.clipping.y && ny <= this.clipping.height)
					{
						this.drawList[drawLength++] = nx;
						this.drawList[drawLength++] = ny;
						r = this.surface.cellTextureBounds[child.image.cellFrame];
						this.drawList[drawLength++] = r.x;
						this.drawList[drawLength++] = r.y;
					}
				}
			}
		}
	}
	else
	{
		while(c--)
		{
			child = this.children[c];

			// add sprite location to drawList
			if (child.alive)
			{
				this.drawList[drawLength++] = child.x + x;
				this.drawList[drawLength++] = child.y + y;
				r = this.surface.cellTextureBounds[child.image.cellFrame];
				this.drawList[drawLength++] = r.x;
				this.drawList[drawLength++] = r.y;
			}
		}
	}

	// debug sprite count
	sprCountDbg += drawLength / 4;

	return drawLength;
};



/**
 * draw using blitSimpleDrawImages, which expects a list of X,Y per sprite
 * (sends a tri-strip for all quads in the batch to the GPU, standard stuff, very reliable, moderately heavy CPU overhead in the data preparation)
 *
 * @param  {[type]} _length [description]
 *
 * @return {[type]}         [description]
 */
pbSimpleLayer.prototype.draw = function(_length)
{
	// hard-wired to TEXTURE0 as the source texture
	pbPhaserRender.renderer.graphics.blitSimpleDrawImages( this.drawList, _length, this.surface, 0 );
};


/**
 * draw using blitSimpleDrawAnimImages, which expects a list of X,Y,U,V per sprite
 * (sends a tri-strip for all quads in the batch to the GPU, standard stuff, very reliable, moderately heavy CPU overhead in the data preparation)
 *
 * @param  {[type]} _length [description]
 *
 * @return {[type]}         [description]
 */
pbSimpleLayer.prototype.drawAnim = function(_length)
{
	// hard-wired to TEXTURE0 as the source texture
	pbPhaserRender.renderer.graphics.blitSimpleDrawAnimImages( this.drawList, _length, this.surface, 0 );
};


/**
 * draw using blitDrawImagesPoint, requires X,Y location only
 * (uses an enlarged GL_POINT to specify a draw region in the vertex shader - cannot rotate, must be square, may have compatibility issues on old hardware, however it's fast and very light CPU for the data preparation)
 *
 * @param  {[type]} _length [description]
 *
 * @return {[type]}         [description]
 */
pbSimpleLayer.prototype.drawPoint = function(_length)
{
	// hard-wired to TEXTURE0 as the source texture
	pbPhaserRender.renderer.graphics.blitDrawImagesPoint( this.drawList, _length, this.surface, 0 );
};

/**
 * draw using blitDrawImagesPointAnim, requires X,Y location and U,V texture source offsets
 * (uses an enlarged GL_POINT to specify a draw region in the vertex shader - cannot rotate, must be square, may have compatibility issues on old hardware, however it's fast and very light CPU for the data preparation)
 *
 * @param  {[type]} _length [description]
 *
 * @return {[type]}         [description]
 */
pbSimpleLayer.prototype.drawPointAnim = function(_length)
{
	// hard-wired to TEXTURE0 as the source texture
	pbPhaserRender.renderer.graphics.blitDrawImagesPointAnim( this.drawList, _length, this.surface, 0 );
};


/**
 * override the pbTransformObject addChild function to ensure that only pbTransformObject is added to this pbSimpleLayer
 *
 * @param {[type]} _child [description]
 */
pbSimpleLayer.prototype.addChild = function( _child )
{
	if (_child instanceof pbTransformObject)
	{
		// call the super.addChild function
		this.__super__.prototype.addChild.call( this, _child );
	}
	else
	{
		console.log("ERROR: can ONLY addChild a pbTransformObject to a pbSimpleLayer!");
	}
};


pbSimpleLayer.prototype.setDrawingFunctions = function( _prepareCall, _drawCall )
{
	this.prepareCall = _prepareCall;
	this.drawCall = _drawCall;
};

