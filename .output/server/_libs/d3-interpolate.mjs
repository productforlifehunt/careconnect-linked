import "../_runtime.mjs";
import { a as rgb$1, n as cubehelix$1, r as hcl$1, t as color } from "./d3-color.mjs";
//#region node_modules/d3-interpolate/dist/d3-interpolate.mjs
function basis(t1, v0, v1, v2, v3) {
	var t2 = t1 * t1;
	var t3 = t2 * t1;
	return ((1 - 3 * t1 + 3 * t2 - t3) * v0 + (4 - 6 * t2 + 3 * t3) * v1 + (1 + 3 * t1 + 3 * t2 - 3 * t3) * v2 + t3 * v3) / 6;
}
function basis$1(values) {
	var n = values.length - 1;
	return function(t) {
		var i = t <= 0 ? t = 0 : t >= 1 ? (t = 1, n - 1) : Math.floor(t * n);
		var v1 = values[i];
		var v2 = values[i + 1];
		var v0 = i > 0 ? values[i - 1] : 2 * v1 - v2;
		var v3 = i < n - 1 ? values[i + 2] : 2 * v2 - v1;
		return basis((t - i / n) * n, v0, v1, v2, v3);
	};
}
var constant = (x) => () => x;
function linear(a, d) {
	return function(t) {
		return a + t * d;
	};
}
function exponential(a, b, y) {
	return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
		return Math.pow(a + t * b, y);
	};
}
function hue$1(a, b) {
	var d = b - a;
	return d ? linear(a, d > 180 || d < -180 ? d - 360 * Math.round(d / 360) : d) : constant(isNaN(a) ? b : a);
}
function gamma(y) {
	return (y = +y) === 1 ? nogamma : function(a, b) {
		return b - a ? exponential(a, b, y) : constant(isNaN(a) ? b : a);
	};
}
function nogamma(a, b) {
	var d = b - a;
	return d ? linear(a, d) : constant(isNaN(a) ? b : a);
}
var rgb = (function rgbGamma(y) {
	var color = gamma(y);
	function rgb(start, end) {
		var r = color((start = rgb$1(start)).r, (end = rgb$1(end)).r);
		var g = color(start.g, end.g);
		var b = color(start.b, end.b);
		var opacity = nogamma(start.opacity, end.opacity);
		return function(t) {
			start.r = r(t);
			start.g = g(t);
			start.b = b(t);
			start.opacity = opacity(t);
			return start + "";
		};
	}
	rgb.gamma = rgbGamma;
	return rgb;
})(1);
function rgbSpline(spline) {
	return function(colors) {
		var n = colors.length;
		var r = new Array(n);
		var g = new Array(n);
		var b = new Array(n);
		var i;
		var color;
		for (i = 0; i < n; ++i) {
			color = rgb$1(colors[i]);
			r[i] = color.r || 0;
			g[i] = color.g || 0;
			b[i] = color.b || 0;
		}
		r = spline(r);
		g = spline(g);
		b = spline(b);
		color.opacity = 1;
		return function(t) {
			color.r = r(t);
			color.g = g(t);
			color.b = b(t);
			return color + "";
		};
	};
}
var rgbBasis = rgbSpline(basis$1);
function numberArray(a, b) {
	if (!b) b = [];
	var n = a ? Math.min(b.length, a.length) : 0;
	var c = b.slice();
	var i;
	return function(t) {
		for (i = 0; i < n; ++i) c[i] = a[i] * (1 - t) + b[i] * t;
		return c;
	};
}
function isNumberArray(x) {
	return ArrayBuffer.isView(x) && !(x instanceof DataView);
}
function genericArray(a, b) {
	var nb = b ? b.length : 0;
	var na = a ? Math.min(nb, a.length) : 0;
	var x = new Array(na);
	var c = new Array(nb);
	var i;
	for (i = 0; i < na; ++i) x[i] = value(a[i], b[i]);
	for (; i < nb; ++i) c[i] = b[i];
	return function(t) {
		for (i = 0; i < na; ++i) c[i] = x[i](t);
		return c;
	};
}
function date(a, b) {
	var d = /* @__PURE__ */ new Date();
	return a = +a, b = +b, function(t) {
		return d.setTime(a * (1 - t) + b * t), d;
	};
}
function number(a, b) {
	return a = +a, b = +b, function(t) {
		return a * (1 - t) + b * t;
	};
}
function object(a, b) {
	var i = {};
	var c = {};
	var k;
	if (a === null || typeof a !== "object") a = {};
	if (b === null || typeof b !== "object") b = {};
	for (k in b) if (k in a) i[k] = value(a[k], b[k]);
	else c[k] = b[k];
	return function(t) {
		for (k in i) c[k] = i[k](t);
		return c;
	};
}
var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g;
var reB = new RegExp(reA.source, "g");
function zero(b) {
	return function() {
		return b;
	};
}
function one(b) {
	return function(t) {
		return b(t) + "";
	};
}
function string(a, b) {
	var bi = reA.lastIndex = reB.lastIndex = 0;
	var am;
	var bm;
	var bs;
	var i = -1;
	var s = [];
	var q = [];
	a = a + "", b = b + "";
	while ((am = reA.exec(a)) && (bm = reB.exec(b))) {
		if ((bs = bm.index) > bi) {
			bs = b.slice(bi, bs);
			if (s[i]) s[i] += bs;
			else s[++i] = bs;
		}
		if ((am = am[0]) === (bm = bm[0])) if (s[i]) s[i] += bm;
		else s[++i] = bm;
		else {
			s[++i] = null;
			q.push({
				i,
				x: number(am, bm)
			});
		}
		bi = reB.lastIndex;
	}
	if (bi < b.length) {
		bs = b.slice(bi);
		if (s[i]) s[i] += bs;
		else s[++i] = bs;
	}
	return s.length < 2 ? q[0] ? one(q[0].x) : zero(b) : (b = q.length, function(t) {
		for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
		return s.join("");
	});
}
function value(a, b) {
	var t = typeof b;
	var c;
	return b == null || t === "boolean" ? constant(b) : (t === "number" ? number : t === "string" ? (c = color(b)) ? (b = c, rgb) : string : b instanceof color ? rgb : b instanceof Date ? date : isNumberArray(b) ? numberArray : Array.isArray(b) ? genericArray : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object : number)(a, b);
}
function round(a, b) {
	return a = +a, b = +b, function(t) {
		return Math.round(a * (1 - t) + b * t);
	};
}
180 / Math.PI;
var epsilon2 = 1e-12;
function cosh(x) {
	return ((x = Math.exp(x)) + 1 / x) / 2;
}
function sinh(x) {
	return ((x = Math.exp(x)) - 1 / x) / 2;
}
function tanh(x) {
	return ((x = Math.exp(2 * x)) - 1) / (x + 1);
}
(function zoomRho(rho, rho2, rho4) {
	function zoom(p0, p1) {
		var ux0 = p0[0];
		var uy0 = p0[1];
		var w0 = p0[2];
		var ux1 = p1[0];
		var uy1 = p1[1];
		var w1 = p1[2];
		var dx = ux1 - ux0;
		var dy = uy1 - uy0;
		var d2 = dx * dx + dy * dy;
		var i;
		var S;
		if (d2 < epsilon2) {
			S = Math.log(w1 / w0) / rho;
			i = function(t) {
				return [
					ux0 + t * dx,
					uy0 + t * dy,
					w0 * Math.exp(rho * t * S)
				];
			};
		} else {
			var d1 = Math.sqrt(d2);
			var b0 = (w1 * w1 - w0 * w0 + rho4 * d2) / (2 * w0 * rho2 * d1);
			var b1 = (w1 * w1 - w0 * w0 - rho4 * d2) / (2 * w1 * rho2 * d1);
			var r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0);
			S = (Math.log(Math.sqrt(b1 * b1 + 1) - b1) - r0) / rho;
			i = function(t) {
				var s = t * S;
				var coshr0 = cosh(r0);
				var u = w0 / (rho2 * d1) * (coshr0 * tanh(rho * s + r0) - sinh(r0));
				return [
					ux0 + u * dx,
					uy0 + u * dy,
					w0 * coshr0 / cosh(rho * s + r0)
				];
			};
		}
		i.duration = Math.abs(S) * 1e3 * rho / Math.SQRT2;
		return i;
	}
	zoom.rho = function(_) {
		var _1 = Math.max(.001, +_);
		var _2 = _1 * _1;
		return zoomRho(_1, _2, _2 * _2);
	};
	return zoom;
})(Math.SQRT2, 2, 4);
function hcl(hue) {
	return function(start, end) {
		var h = hue((start = hcl$1(start)).h, (end = hcl$1(end)).h);
		var c = nogamma(start.c, end.c);
		var l = nogamma(start.l, end.l);
		var opacity = nogamma(start.opacity, end.opacity);
		return function(t) {
			start.h = h(t);
			start.c = c(t);
			start.l = l(t);
			start.opacity = opacity(t);
			return start + "";
		};
	};
}
var hcl_default = hcl(hue$1);
function cubehelix(hue) {
	return (function cubehelixGamma(y) {
		y = +y;
		function cubehelix(start, end) {
			var h = hue((start = cubehelix$1(start)).h, (end = cubehelix$1(end)).h);
			var s = nogamma(start.s, end.s);
			var l = nogamma(start.l, end.l);
			var opacity = nogamma(start.opacity, end.opacity);
			return function(t) {
				start.h = h(t);
				start.s = s(t);
				start.l = l(Math.pow(t, y));
				start.opacity = opacity(t);
				return start + "";
			};
		}
		cubehelix.gamma = cubehelixGamma;
		return cubehelix;
	})(1);
}
cubehelix(hue$1);
var cubehelixLong = cubehelix(nogamma);
//#endregion
export { round as a, rgbBasis as i, hcl_default as n, value as o, number as r, cubehelixLong as t };
