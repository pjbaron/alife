/**
 *
 * pbButtons.js - support functions to create click regions which can be used as buttons
 *
 */



function pbButtons()
{
	this.list = null;
	this.element = null;
}

pbButtons.prototype.constructor = pbButtons;


pbButtons.prototype.create = function(_element)
{
	if (this.element === null)
	{
		this.element = _element;

		var _this = this;
		document.body.onmousedown = function(e) {
			if (!_this.list)
				return;

			for(var i = 0, l = _this.list.length; i < l; i++)
			{
				var b = _this.list[i];
				if (b.rectangle.contains(e.clientX, e.clientY))
				{
					b.callback.call(b.context, true, b.key);
				}
			}
		};
		document.body.onmouseup = function(e) {
			if (!_this.list)
				return;

			for(var i = 0, l = _this.list.length; i < l; i++)
			{
				var b = _this.list[i];
				if (b.rectangle.contains(e.clientX, e.clientY))
				{
					b.callback.call(b.context, false, b.key);
				}
			}
		};
	}
};


pbButtons.prototype.add = function(_key, _rectangle, _callback, _context)
{
	if (!this.list)
		this.list = [];

	this.list.push( { key: _key, rectangle: _rectangle, callback: _callback, context: _context });
};


pbButtons.prototype.destroy = function()
{
	if (this.element)
		document.body.onmousedown = null;
	this.element = null;
	this.list = null;
};




