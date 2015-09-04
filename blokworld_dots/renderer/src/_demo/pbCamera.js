/**
 * pbCamera.js - a very simple camera
 * 
 */



function Camera()
{
	this.x = this.y = this.z = 0;
	this.lx = this.ly = this.lz = 0;
}


Camera.prototype.create = function(_x, _y, _z, _lx, _ly, _lz)
{
	this.x = _x;
	this.y = _y;
	this.z = _z;
	this.lx = _lx;
	this.ly = _ly;
	this.lz = _lz;
};


Camera.prototype.getXAxis = function()
{
	// var dx = this.lx - this.x;
	// var dy = this.ly - this.y;
	// var dz = this.lz - this.z;
	// var ux = 0;
	// var uy = 1;
	// var uz = 0;
	// var cx = dy * uz - dz * uy;
	// var cy = dz * ux - dx * uz;
	// var cz = dx * uy - dy * ux;
	// var l = Math.sqrt(cx * cx + cy * cy + cz * cz);
	// return [ cx / l, cy / l, cz / l ];

	var dx = this.lx - this.x;
	var dz = this.lz - this.z;
	var cx = -dz;
	var cz = dx;
	var l = Math.sqrt(cx * cx + cz * cz);
	return [ cx / l, 0, cz / l ];
};


Camera.prototype.rotate = function(u, v, w, angle)
{
	// rotate lx,ly,lz around the line through x,y,z with direction u,v,w by angle (vector must be normalised)
	var u2 = u * u;
	var v2 = v * v;
	var w2 = w * w;

	var au = this.x * u;
	var bv = this.y * v;
	var cw = this.z * w;
	var ux = u * this.lx;
	var vy = v * this.ly;
	var wz = w * this.lz;

	var sin = Math.sin(angle);
	var cos = Math.cos(angle);

	this.lx = (this.x * (v2 + w2) - u * (bv + cw - ux - vy - wz)) * (1 - cos) + this.lx * cos + (-this.z*v + this.y*w - w*this.ly + v*this.lz) * sin;
	this.ly = (this.y * (u2 + w2) - v * (au + cw - ux - vy - wz)) * (1 - cos) + this.ly * cos + ( this.z*u - this.x*w + w*this.lx - u*this.lz) * sin;
	this.lz = (this.z * (u2 + v2) - w * (au + bv - ux - vy - wz)) * (1 - cos) + this.lz * cos + (-this.y*u + this.x*v - v*this.lx + u*this.ly) * sin;
};


Camera.prototype.moveForwards = function(dist)
{
	var dx = this.lx - this.x;
	var dy = this.ly - this.y;
	var dz = this.lz - this.z;
	var l = Math.sqrt(dx * dx + dy * dy + dz * dz);
	var mx = dist * dx / l;
	var my = dist * dy / l;
	var mz = dist * dz / l;
	this.x += mx;
	this.y += my;
	this.z += mz;
	this.lx += mx;
	this.ly += my;
	this.lz += mz;
};


Camera.prototype.moveSideways = function(dist)
{
	var dx = this.getXAxis();
	var l = Math.sqrt(dx[0] * dx[0] + dx[1] * dx[1] + dx[2] * dx[2]);
	var mx = dist * dx[0] / l;
	var my = dist * dx[1] / l;
	var mz = dist * dx[2] / l;
	this.x += mx;
	this.y += my;
	this.z += mz;
	this.lx += mx;
	this.ly += my;
	this.lz += mz;
};


Camera.prototype.moveVertical = function(dist)
{
	this.y += dist;
	this.ly += dist;
};
