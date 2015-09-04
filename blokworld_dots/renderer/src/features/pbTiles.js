/**
 *
 * pbTiles.js - handle tile drawing (rectilinear, grid-locked sprites) from a JSON tile map source
 * 
 */


function pbTiles()
{

}


pbTiles.prototype.create = function(jsonName)
{

};




/**
 * Parse the JSON descriptor for the tile data
 * 
 * @param jsonName - the name of the JSON as loaded into Phaser
 */
pbTiles.prototype.parseJSON = function(jsonName)
{
    var jsonString = game.cache.getText(jsonName);
    this.description = JSON.parse(jsonString);

    // calculate length of the unscaled 'description' edge
    var pl = this.description.pointList.length;
    this.description.length = Phaser.Point.distance(this.description.pointList[pl - 1], this.description.pointList[0]);

    // calculate the angle at which that 'description' edge was defined
    // in radians, 0 = horizontal increasing to the right, angles increase clockwise (pi/2 is down)
    this.description.angle = Phaser.Point.angle(this.description.pointList[pl - 1], this.description.pointList[0]);

    // create description properties for the jigsaw puzzle pieces
    this.description.width = this.use_piecesWide;
    this.description.height = this.use_piecesHigh;

    this.description.jitterX = this.use_cornerJitterX;
    this.description.jitterY = this.use_cornerJitterY;

    this.description.edgeThickness = this.use_edgeThickness;
    m = this.use_edgeColor.match(/^#([0-9a-f]{6})$/i)[1];
    if (m)
    {
        this.description.edgeColor = [];
        this.description.edgeColor[0] = parseInt(m.substr(0,2),16);
        this.description.edgeColor[1] = parseInt(m.substr(2,2),16);
        this.description.edgeColor[2] = parseInt(m.substr(4,2),16);
    }

    this.description.quality = this.use_quality;
};

