


var desiredFps = 60;


function pbRootTimer()
{
    console.log("pbRootTimer c'tor entry");
    
    this.time = undefined;
    this.lastTime = undefined;
    this.elapsedTime = undefined;

    this._updateCallback = null;
    this._updateContext = null;

    var vendors = [
        'ms',
        'moz',
        'webkit',
        'o'
    ];

    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; x++)
    {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'];
    }

    console.log("pbRootTimer c'tor exit");
}


pbRootTimer.prototype.start = function(_updateCallback, _updateContext)
{
    console.log("pbRootTimer start");
    
    this._updateCallback = _updateCallback;
    this._updateContext = _updateContext;

    if (performance && performance.now)
        this._getTime = function() { return performance.now(); };
    else
        this._getTime = Date.now || this.getTime;

    this.time = this.lastTime = this._getTime();
    this.elapsedTime = 0;

    var _this = this;
    if (!window.requestAnimationFrame)
    {
        this._onLoop = function () {
                return _this._updateSetTimeout();
            };
        window.setTimeout(this._onLoop, 0);
    }
    else
    {
        this._onLoop = function () {
                return _this._updateRAF();
            };
        this.rafID = window.requestAnimationFrame(this._onLoop);
    }
};


pbRootTimer.prototype.destroy = function()
{
    if (this.rafID)
        window.cancelAnimationFrame(this.rafID);
    this._onLoop = null;
    this._updateCallback = null;
    this._updateContext = null;
};


/**
 * The update method using requestAnimationFrame
 */
pbRootTimer.prototype._updateRAF = function()
{
    this._timer(this._getTime());

    this.rafID = window.requestAnimationFrame(this._onLoop);
    this._updateCallback.call(this._updateContext);
};


/**
 * The update method using setTimeout
 */
pbRootTimer.prototype._updateSetTimeout = function ()
{
    this._timer(this._getTime());

    window.setTimeout(this._onLoop, 1000 / desiredFps);
    this._updateCallback.call(this._updateContext);
};


/**
 * Update time, elapsed time, etc.
 */
pbRootTimer.prototype._timer = function(_time)
{
    this.time = _time;
    this.elapsedTime = this.time - this.lastTime;
    this.lastTime = this.time;
};


// TODO: use more efficient variant unless there's a good reason for using this slow one
pbRootTimer.prototype.getTime = function()
{
    return (new Date).getTime();
};

