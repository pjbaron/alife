/**
 *
 * A very simple Dictionary implementation in JS
 *
 * Originally based on: http://jsfiddle.net/MickMalone1983/VEpFf/2/
 *
 * Permits multiple values to be stored to a single key.
 * 
 */


function pbDictionary()
{
	this.keys = null;
	this.values = null;
}

pbDictionary.prototype.constructor = pbDictionary;


pbDictionary.prototype.create = function()
{
	this.clear();
};


pbDictionary.prototype.destroy = function()
{
	this.keys = null;
	this.values = null;
};

/**
 * [add description]
 *
 * @param {[type]} _key   [description]
 * @param {[type]} _value [description]
 *
 * @return {Boolean} true if key already existed and we added another value to it
 */
pbDictionary.prototype.add = function(_key, _value)
{
	var i = this.keys.indexOf(_key);
	if (i != -1)
	{
		// key exists, add value to the end of the list of matching values
		this.values[i].push(_value);
		return true;
	}

	// key does not exist, create new key and list of matching values
	i = this.keys.push(_key) - 1;
	this.values[i] = [ _value ];
	return false;
};


pbDictionary.prototype.exists = function(_key)
{
	var i = this.keys.indexOf(_key);
	return (i !== -1);
};


pbDictionary.prototype.getFirst = function(_key)
{
	var i = this.keys.indexOf(_key);
	if (i != -1)
	{
		// key exists, return first from the list of matching values
		return this.values[i][0];
	}

	// key does not exist
	return null;
};


pbDictionary.prototype.get = function(_key)
{
	var i = this.keys.indexOf(_key);
	if (i != -1)
	{
		// key exists, return list of matching values
		return this.values[i];
	}

	// key does not exist
	return null;
};


pbDictionary.prototype.getAll = function()
{
	var list = [];

	for(var i = 0, l = this.keys.length; i < l; i++)
		for(var j = 0, m = this.values[i].length; j < m; j++)
			list.push(this.values[i][j]);
		
	return list;
};


pbDictionary.prototype.remove = function(_key)
{
	var i = this.keys.indexOf(_key);
	if (i != -1)
	{
		// key exists, return list of matching values
		var list = this.values[i];
		this.keys[i] = null;
		this.values[i] = null;
		return list;
	}

	// key does not exist
	return null;
};


pbDictionary.prototype.clear = function()
{
	this.keys = [];
	this.values = [];
};


pbDictionary.prototype.iterateAll = function(_func, _context)
{
	for(var i = 0, l = this.keys.length; i < l; i++)
		for(var j = 0, m = this.values[i].length; j < m; j++)
			_func.call(_context, this.values[i][j]);
};


pbDictionary.prototype.iterateKeys = function(_func, _context)
{
	for(var i = 0, l = this.keys.length; i < l; i++)
		_func.call(_context, this.values[i]);
};


// allow this class to be extended
// permits multiple levels of inheritance 	http://jsfiddle.net/ZWZP6/2/  
// improvement over original answer at 		http://stackoverflow.com/questions/7300552/calling-overridden-methods-in-javascript
pbDictionary.prototype.super = function(clazz, functionName)
{
	// console.log("pbDictionary.super", functionName);
    var args = Array.prototype.slice.call(arguments, 2);
    clazz.prototype.__super__.prototype[functionName].apply(this, args);
};
