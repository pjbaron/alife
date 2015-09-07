/**
 *
 * pbMatrix3 - general matrix stuff, plus some specific functions to help out with rendering
 *
 */




/*
The following three code lines are from the gl-matrix project:

Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */
if(!GLMAT_ARRAY_TYPE) {
    var GLMAT_ARRAY_TYPE = (typeof Float32Array !== 'undefined') ? Float32Array : Array;
}


// TODO: rotation direction may vary between WebGL:
// 		"    vec3 pos = uProjectionMatrix * modelMatrix * vec3(aPosition.xy, 1);" +
//		"    gl_Position = vec4(pos.xy, z, 1);"
// and Canvas:
//		this.ctx.transform(a, b, c, d, e, f);
// because the WebGL is upside-down.  Finding a different way to compensate for that might remove rotationDirection.
pbMatrix3.rotationDirection = -1;			// default is correct for Canvas mode, +1 for webGl, I cannot believe the standards differ!


function pbMatrix3()
{
}


pbMatrix3.makeTranslation = function( tx, ty )
{
	var m = new GLMAT_ARRAY_TYPE(9);
	m[0] = 1;
	m[1] = 0;
	m[2] = 0;
	m[3] = 0;
	m[4] = 1;
	m[5] = 0;
	m[6] = tx;
	m[7] = ty;
	m[8] = 1;
	return m;
};


pbMatrix3.makeRotation = function( angleInRadians )
{
	var c = Math.cos( angleInRadians );
	var s = Math.sin( angleInRadians ) * pbMatrix3.rotationDirection;
	var m = new GLMAT_ARRAY_TYPE(9);
	m[0] = c;
	m[1] = -s;
	m[2] = 0;
	m[3] = s;
	m[4] = c;
	m[5] = 0;
	m[6] = 0;
	m[7] = 0;
	m[8] = 1;
	return m;
};


pbMatrix3.makeScale = function( sx, sy )
{
	var m = new GLMAT_ARRAY_TYPE(9);
	m[0] = sx;
	m[1] = 0;
	m[2] = 0;
	m[3] = 0;
	m[4] = sy;
	m[5] = 0;
	m[6] = 0;
	m[7] = 0;
	m[8] = 1;
	return m;
};


pbMatrix3.makeTransform = function(_x, _y, _angleInRadians, _scaleX, _scaleY)
{
	var c = Math.cos( _angleInRadians );
	var s = Math.sin( _angleInRadians ) * pbMatrix3.rotationDirection;
	var m = new GLMAT_ARRAY_TYPE(9);
	m[0] = c * _scaleX;
	m[1] = -s * _scaleY;
	m[2] = 0;
	m[3] = s * _scaleX;
	m[4] = c * _scaleY;
	m[5] = 0;
	m[6] = _x;
	m[7] = _y;
	m[8] = 1;
	return m;
};


pbMatrix3.setTransform = function( _m, _x, _y, _angleInRadians, _scaleX, _scaleY)
{
	var c = Math.cos( _angleInRadians );
	var s = Math.sin( _angleInRadians ) * pbMatrix3.rotationDirection;

	_m[0] = c * _scaleX;
	_m[1] = -s * _scaleY;
	_m[2] = 0;
	_m[3 + 0] = s * _scaleX;
	_m[3 + 1] = c * _scaleY;
	_m[3 + 2] = 0;
	_m[2 * 3 + 0] = _x;
	_m[2 * 3 + 1] = _y;
	_m[2 * 3 + 2] = 1;
};


pbMatrix3.makeProjection = function(width, height)
{
	// project coordinates into a 2x2 number range, starting at (-1, 1)
	var m = new GLMAT_ARRAY_TYPE(9);
	m[0] = 2 / width;
	m[1] = 0;
	m[2] = 0;

	m[3] = 0;
	m[4] = -2 / height;
	m[5] = 0;
	
	m[6] = -1;
	m[7] = 1;
	m[8] = 1;
	return m;
};


pbMatrix3.makeIdentity = function()
{
	var m = new GLMAT_ARRAY_TYPE(9);
	m[0] = 1;
	m[1] = 0;
	m[2] = 0;
	m[3] = 0;
	m[4] = 1;
	m[5] = 0;
	m[6] = 0;
	m[7] = 0;
	m[8] = 1;
	return m;
};


pbMatrix3.matrixMultiply = function( a, b )
{
	var a00 = a[         0 ];
	var a01 = a[         1 ];
	var a02 = a[         2 ];
	var a10 = a[     3 + 0 ];
	var a11 = a[     3 + 1 ];
	var a12 = a[     3 + 2 ];
	var a20 = a[ 2 * 3 + 0 ];
	var a21 = a[ 2 * 3 + 1 ];
	var a22 = a[ 2 * 3 + 2 ];
	var b00 = b[         0 ];
	var b01 = b[         1 ];
	var b02 = b[         2 ];
	var b10 = b[     3 + 0 ];
	var b11 = b[     3 + 1 ];
	var b12 = b[     3 + 2 ];
	var b20 = b[ 2 * 3 + 0 ];
	var b21 = b[ 2 * 3 + 1 ];
	var b22 = b[ 2 * 3 + 2 ];
	var m = new GLMAT_ARRAY_TYPE(9);
	m[0] = a00 * b00 + a01 * b10 + a02 * b20;
	m[1] = a00 * b01 + a01 * b11 + a02 * b21;
	m[2] = a00 * b02 + a01 * b12 + a02 * b22;
	m[3] = a10 * b00 + a11 * b10 + a12 * b20;
	m[4] = a10 * b01 + a11 * b11 + a12 * b21;
	m[5] = a10 * b02 + a11 * b12 + a12 * b22;
	m[6] = a20 * b00 + a21 * b10 + a22 * b20;
	m[7] = a20 * b01 + a21 * b11 + a22 * b21;
	m[8] = a20 * b02 + a21 * b12 + a22 * b22;
	return m;
};


// display transforms always have the form:
// a, b, 0
// c, d, 0
// e, f, 1
// 
// we can speed up the multiplication by skipping the 0 and 1 multiplication steps
pbMatrix3.fastMultiply = function( a, b )
{
	var a00 = a[         0 ];
	var a01 = a[         1 ];
	var a10 = a[     3 + 0 ];
	var a11 = a[     3 + 1 ];
	var a20 = a[ 2 * 3 + 0 ];
	var a21 = a[ 2 * 3 + 1 ];
	var b00 = b[         0 ];
	var b01 = b[         1 ];
	var b10 = b[     3 + 0 ];
	var b11 = b[     3 + 1 ];
	var b20 = b[ 2 * 3 + 0 ];
	var b21 = b[ 2 * 3 + 1 ];
	var m = new GLMAT_ARRAY_TYPE(9);
	m[0] = a00 * b00 + a01 * b10;
	m[1] = a00 * b01 + a01 * b11;
	m[2] = 0;
	m[3] = a10 * b00 + a11 * b10;
	m[4] = a10 * b01 + a11 * b11;
	m[5] = 0;
	m[6] = a20 * b00 + a21 * b10 +       b20;
	m[7] = a20 * b01 + a21 * b11 +       b21;
	m[8] = 1;
	return m;
};


// display transforms always have the form:
// a, b, 0
// c, d, 0
// e, f, 1
// 
// we can speed up the multiplication by skipping the 0 and 1 multiplication steps
pbMatrix3.setFastMultiply = function( a, b )
{
	var a00 = a[         0 ];
	var a01 = a[         1 ];
	var a10 = a[     3 + 0 ];
	var a11 = a[     3 + 1 ];
	var a20 = a[ 2 * 3 + 0 ];
	var a21 = a[ 2 * 3 + 1 ];
	var b00 = b[         0 ];
	var b01 = b[         1 ];
	var b10 = b[     3 + 0 ];
	var b11 = b[     3 + 1 ];
	var b20 = b[ 2 * 3 + 0 ];
	var b21 = b[ 2 * 3 + 1 ];
	a[0] = a00 * b00 + a01 * b10;
	a[1] = a00 * b01 + a01 * b11;
	a[3] = a10 * b00 + a11 * b10;
	a[4] = a10 * b01 + a11 * b11;
	a[6] = a20 * b00 + a21 * b10 + b20;
	a[7] = a20 * b01 + a21 * b11 + b21;
	a[2] = a[5] = 0;
	a[8] = 1;
};


