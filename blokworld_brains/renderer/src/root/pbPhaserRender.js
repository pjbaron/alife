/**
 *
 * pbPhaserRender - manager for the entire Phaser 3 rendering system
 * 
 */


// universal globals
rootLayer = null;


// static globals

// globally useful
pbPhaserRender.width = 0;
pbPhaserRender.height = 0;
pbPhaserRender.canvas = null;
pbPhaserRender.frameCount = 0;
// sub-systems
pbPhaserRender.renderer = null;
pbPhaserRender.loader = null;
pbPhaserRender.rootTimer = null;




function pbPhaserRender(_docId)
{
	this.state = "new";
	this.docId = _docId;
	this.isBooted = false;
	pbPhaserRender.frameCount = 0;

	pbPhaserRender.width = 800;
	pbPhaserRender.height = 600;

	// canvas
    pbPhaserRender.canvas = document.createElement('canvas');
    pbPhaserRender.canvas.setAttribute('id', this.docId);
    pbPhaserRender.canvas.setAttribute('width', pbPhaserRender.width);
    pbPhaserRender.canvas.setAttribute('height', pbPhaserRender.height);
    pbPhaserRender.canvas.setAttribute('style', 'border: none');
    // NOTE: canvas performance seems heavily dependent on the Node order of it's parent, it needs to be first!
	var guiContainer = document.getElementById('gui');    
    document.body.insertBefore(pbPhaserRender.canvas, guiContainer);
}


pbPhaserRender.prototype.create = function(_renderMode, _bootCallback, _updateCallback, _gameContext)
{
	console.log("pbPhaserRender create");
	this.state = "create";

	// parameters
	this.renderMode = _renderMode;
	this.bootCallback = _bootCallback;
	this.updateCallback = _updateCallback;
	this.gameContext = _gameContext;

	// globals
 	rootLayer = null;

	// boot when the document is ready
	var _this = this;
    this._onBoot = function () {
        	return _this.boot();
    	};
    if (document.readyState === 'complete' || document.readyState === 'interactive')
    {
        window.setTimeout(this._onBoot, 0);
    }
    else
    {
        document.addEventListener('DOMContentLoaded', this._onBoot, false);
        window.addEventListener('load', this._onBoot, false);
    }

	// create the loader and set a callback for when the files have all loaded
	pbPhaserRender.loader = new pbLoader( this.allLoaded, this );
};


pbPhaserRender.prototype.boot = function()
{
    if (this.isBooted)
    {
    	// only boot once
        return;
    }

    if (!document.body)
    {
    	// wait until the document.body is available, keep trying every 20 ms
        window.setTimeout(this._onBoot, 20);
        return;
    }

   	console.log("pbRenderer boot");

    document.removeEventListener('DOMContentLoaded', this._onBoot);
    window.removeEventListener('load', this._onBoot);

    // only boot once
    this.isBooted = true;

    // start the update ticking
	this.rootTimer = new pbRootTimer();
	this.rootTimer.start(this.update, this);
};


pbPhaserRender.prototype.allLoaded = function()
{
	console.log( "pbPhaserRender.allLoaded" );
	this.state = "loaded";
};


pbPhaserRender.prototype.destroy = function()
{
	console.log("pbPhaserRender.destroy");

	if ( this.rootTimer )
		this.rootTimer.destroy();
	this.rootTimer = null;

	if ( rootLayer )
		rootLayer.destroy();
	rootLayer = null;

	if (pbPhaserRender.renderer)
		pbPhaserRender.renderer.destroy();
	pbPhaserRender.renderer = null;

	if (pbPhaserRender.loader)
		pbPhaserRender.loader.destroy();
	pbPhaserRender.loader = null;

	if (pbPhaserRender.rootTimer)
		pbPhaserRender.rootTimer.destroy();
	pbPhaserRender.rootTimer = null;

	this.renderMode = null;
	this.bootCallback = null;
	this.updateCallback = null;
	this.gameContext = null;

	pbPhaserRender.canvas.parentNode.removeChild( pbPhaserRender.canvas );
	pbPhaserRender.canvas = null;
};


pbPhaserRender.prototype.update = function()
{
	// TODO: I'd like to move this first conditional into an 'init' function
	// 	need to solve the issues from async loading and DOM boot... we don't know which one will finish first
	//  also needs to handle when there's no loading to be done
	// 	it could be handled with a latch variable, but that's almost as ugly as this is

	// if there was nothing to load, or the loading has completed...
	if ((this.state === "create" && !pbPhaserRender.loader.stillLoading()) || this.state === "loaded")
	{
		// create the renderer sub-system
		pbPhaserRender.renderer = new pbRenderer( this );
		pbPhaserRender.renderer.create( this.renderMode, pbPhaserRender.canvas, this.gameContext );

		// create the rootLayer container for all graphics
		rootLayer = new layerClass();
		rootLayer.create(null, pbPhaserRender.renderer, 0, 0, 0, 0, 1, 1);
		
	    // call the game's boot callback if there's nothing left to load
	    this.bootCallback.call( this.gameContext );

		this.state = "running";
		return;
	}
	else if (this.state === "running")
	{
		// run the game loop
		stats.begin();
		pbPhaserRender.frameCount++;
		pbPhaserRender.renderer.update( this.updateCallback, this.gameContext );
		stats.end();
	}
	else
	{
		// waiting for files to load
		return;
	}
};


