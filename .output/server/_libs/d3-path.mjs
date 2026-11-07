import "../_runtime.mjs";
//#region node_modules/d3-sankey/node_modules/d3-path/src/path.js
var pi = Math.PI;
var tau = 2 * pi;
var epsilon = 1e-6;
var tauEpsilon = tau - epsilon;
function Path() {
	this._x0 = this._y0 = this._x1 = this._y1 = null;
	this._ = "";
}
function path() {
	return new Path();
}
Path.prototype = path.prototype = {
	constructor: Path,
	moveTo: function(x, y) {
		this._ += "M" + (this._x0 = this._x1 = +x) + "," + (this._y0 = this._y1 = +y);
	},
	closePath: function() {
		if (this._x1 !== null) {
			this._x1 = this._x0, this._y1 = this._y0;
			this._ += "Z";
		}
	},
	lineTo: function(x, y) {
		this._ += "L" + (this._x1 = +x) + "," + (this._y1 = +y);
	},
	quadraticCurveTo: function(x1, y1, x, y) {
		this._ += "Q" + +x1 + "," + +y1 + "," + (this._x1 = +x) + "," + (this._y1 = +y);
	},
	bezierCurveTo: function(x1, y1, x2, y2, x, y) {
		this._ += "C" + +x1 + "," + +y1 + "," + +x2 + "," + +y2 + "," + (this._x1 = +x) + "," + (this._y1 = +y);
	},
	arcTo: function(x1, y1, x2, y2, r) {
		x1 = +x1, y1 = +y1, x2 = +x2, y2 = +y2, r = +r;
		var x0 = this._x1;
		var y0 = this._y1;
		var x21 = x2 - x1;
		var y21 = y2 - y1;
		var x01 = x0 - x1;
		var y01 = y0 - y1;
		var l01_2 = x01 * x01 + y01 * y01;
		if (r < 0) throw new Error("negative radius: " + r);
		if (this._x1 === null) this._ += "M" + (this._x1 = x1) + "," + (this._y1 = y1);
		else if (!(l01_2 > epsilon));
		else if (!(Math.abs(y01 * x21 - y21 * x01) > epsilon) || !r) this._ += "L" + (this._x1 = x1) + "," + (this._y1 = y1);
		else {
			var x20 = x2 - x0;
			var y20 = y2 - y0;
			var l21_2 = x21 * x21 + y21 * y21;
			var l20_2 = x20 * x20 + y20 * y20;
			var l21 = Math.sqrt(l21_2);
			var l01 = Math.sqrt(l01_2);
			var l = r * Math.tan((pi - Math.acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2);
			var t01 = l / l01;
			var t21 = l / l21;
			if (Math.abs(t01 - 1) > epsilon) this._ += "L" + (x1 + t01 * x01) + "," + (y1 + t01 * y01);
			this._ += "A" + r + "," + r + ",0,0," + +(y01 * x20 > x01 * y20) + "," + (this._x1 = x1 + t21 * x21) + "," + (this._y1 = y1 + t21 * y21);
		}
	},
	arc: function(x, y, r, a0, a1, ccw) {
		x = +x, y = +y, r = +r, ccw = !!ccw;
		var dx = r * Math.cos(a0);
		var dy = r * Math.sin(a0);
		var x0 = x + dx;
		var y0 = y + dy;
		var cw = 1 ^ ccw;
		var da = ccw ? a0 - a1 : a1 - a0;
		if (r < 0) throw new Error("negative radius: " + r);
		if (this._x1 === null) this._ += "M" + x0 + "," + y0;
		else if (Math.abs(this._x1 - x0) > epsilon || Math.abs(this._y1 - y0) > epsilon) this._ += "L" + x0 + "," + y0;
		if (!r) return;
		if (da < 0) da = da % tau + tau;
		if (da > tauEpsilon) this._ += "A" + r + "," + r + ",0,1," + cw + "," + (x - dx) + "," + (y - dy) + "A" + r + "," + r + ",0,1," + cw + "," + (this._x1 = x0) + "," + (this._y1 = y0);
		else if (da > epsilon) this._ += "A" + r + "," + r + ",0," + +(da >= pi) + "," + cw + "," + (this._x1 = x + r * Math.cos(a1)) + "," + (this._y1 = y + r * Math.sin(a1));
	},
	rect: function(x, y, w, h) {
		this._ += "M" + (this._x0 = this._x1 = +x) + "," + (this._y0 = this._y1 = +y) + "h" + +w + "v" + +h + "h" + -w + "Z";
	},
	toString: function() {
		return this._;
	}
};
//#endregion
export { path as t };
