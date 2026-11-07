import "../_runtime.mjs";
//#region node_modules/d3-axis/dist/d3-axis.mjs
function identity(x) {
	return x;
}
var top = 1;
var right = 2;
var bottom = 3;
var left = 4;
var epsilon = 1e-6;
function translateX(x) {
	return "translate(" + x + ",0)";
}
function translateY(y) {
	return "translate(0," + y + ")";
}
function number(scale) {
	return (d) => +scale(d);
}
function center(scale, offset) {
	offset = Math.max(0, scale.bandwidth() - offset * 2) / 2;
	if (scale.round()) offset = Math.round(offset);
	return (d) => +scale(d) + offset;
}
function entering() {
	return !this.__axis;
}
function axis(orient, scale) {
	var tickArguments = [];
	var tickValues = null;
	var tickFormat = null;
	var tickSizeInner = 6;
	var tickSizeOuter = 6;
	var tickPadding = 3;
	var offset = typeof window !== "undefined" && window.devicePixelRatio > 1 ? 0 : .5;
	var k = orient === top || orient === left ? -1 : 1;
	var x = orient === left || orient === right ? "x" : "y";
	var transform = orient === top || orient === bottom ? translateX : translateY;
	function axis(context) {
		var values = tickValues == null ? scale.ticks ? scale.ticks.apply(scale, tickArguments) : scale.domain() : tickValues;
		var format = tickFormat == null ? scale.tickFormat ? scale.tickFormat.apply(scale, tickArguments) : identity : tickFormat;
		var spacing = Math.max(tickSizeInner, 0) + tickPadding;
		var range = scale.range();
		var range0 = +range[0] + offset;
		var range1 = +range[range.length - 1] + offset;
		var position = (scale.bandwidth ? center : number)(scale.copy(), offset);
		var selection = context.selection ? context.selection() : context;
		var path = selection.selectAll(".domain").data([null]);
		var tick = selection.selectAll(".tick").data(values, scale).order();
		var tickExit = tick.exit();
		var tickEnter = tick.enter().append("g").attr("class", "tick");
		var line = tick.select("line");
		var text = tick.select("text");
		path = path.merge(path.enter().insert("path", ".tick").attr("class", "domain").attr("stroke", "currentColor"));
		tick = tick.merge(tickEnter);
		line = line.merge(tickEnter.append("line").attr("stroke", "currentColor").attr(x + "2", k * tickSizeInner));
		text = text.merge(tickEnter.append("text").attr("fill", "currentColor").attr(x, k * spacing).attr("dy", orient === top ? "0em" : orient === bottom ? "0.71em" : "0.32em"));
		if (context !== selection) {
			path = path.transition(context);
			tick = tick.transition(context);
			line = line.transition(context);
			text = text.transition(context);
			tickExit = tickExit.transition(context).attr("opacity", epsilon).attr("transform", function(d) {
				return isFinite(d = position(d)) ? transform(d + offset) : this.getAttribute("transform");
			});
			tickEnter.attr("opacity", epsilon).attr("transform", function(d) {
				var p = this.parentNode.__axis;
				return transform((p && isFinite(p = p(d)) ? p : position(d)) + offset);
			});
		}
		tickExit.remove();
		path.attr("d", orient === left || orient === right ? tickSizeOuter ? "M" + k * tickSizeOuter + "," + range0 + "H" + offset + "V" + range1 + "H" + k * tickSizeOuter : "M" + offset + "," + range0 + "V" + range1 : tickSizeOuter ? "M" + range0 + "," + k * tickSizeOuter + "V" + offset + "H" + range1 + "V" + k * tickSizeOuter : "M" + range0 + "," + offset + "H" + range1);
		tick.attr("opacity", 1).attr("transform", function(d) {
			return transform(position(d) + offset);
		});
		line.attr(x + "2", k * tickSizeInner);
		text.attr(x, k * spacing).text(format);
		selection.filter(entering).attr("fill", "none").attr("font-size", 10).attr("font-family", "sans-serif").attr("text-anchor", orient === right ? "start" : orient === left ? "end" : "middle");
		selection.each(function() {
			this.__axis = position;
		});
	}
	axis.scale = function(_) {
		return arguments.length ? (scale = _, axis) : scale;
	};
	axis.ticks = function() {
		return tickArguments = Array.from(arguments), axis;
	};
	axis.tickArguments = function(_) {
		return arguments.length ? (tickArguments = _ == null ? [] : Array.from(_), axis) : tickArguments.slice();
	};
	axis.tickValues = function(_) {
		return arguments.length ? (tickValues = _ == null ? null : Array.from(_), axis) : tickValues && tickValues.slice();
	};
	axis.tickFormat = function(_) {
		return arguments.length ? (tickFormat = _, axis) : tickFormat;
	};
	axis.tickSize = function(_) {
		return arguments.length ? (tickSizeInner = tickSizeOuter = +_, axis) : tickSizeInner;
	};
	axis.tickSizeInner = function(_) {
		return arguments.length ? (tickSizeInner = +_, axis) : tickSizeInner;
	};
	axis.tickSizeOuter = function(_) {
		return arguments.length ? (tickSizeOuter = +_, axis) : tickSizeOuter;
	};
	axis.tickPadding = function(_) {
		return arguments.length ? (tickPadding = +_, axis) : tickPadding;
	};
	axis.offset = function(_) {
		return arguments.length ? (offset = +_, axis) : offset;
	};
	return axis;
}
function axisTop(scale) {
	return axis(top, scale);
}
function axisBottom(scale) {
	return axis(bottom, scale);
}
//#endregion
export { axisTop as n, axisBottom as t };
