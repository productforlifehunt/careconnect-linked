import "../_runtime.mjs";
//#region node_modules/d3-hierarchy/dist/d3-hierarchy.mjs
function count(node) {
	var sum = 0;
	var children = node.children;
	var i = children && children.length;
	if (!i) sum = 1;
	else while (--i >= 0) sum += children[i].value;
	node.value = sum;
}
function node_count() {
	return this.eachAfter(count);
}
function node_each(callback, that) {
	let index = -1;
	for (const node of this) callback.call(that, node, ++index, this);
	return this;
}
function node_eachBefore(callback, that) {
	var node = this;
	var nodes = [node];
	var children;
	var i;
	var index = -1;
	while (node = nodes.pop()) {
		callback.call(that, node, ++index, this);
		if (children = node.children) for (i = children.length - 1; i >= 0; --i) nodes.push(children[i]);
	}
	return this;
}
function node_eachAfter(callback, that) {
	var node = this;
	var nodes = [node];
	var next = [];
	var children;
	var i;
	var n;
	var index = -1;
	while (node = nodes.pop()) {
		next.push(node);
		if (children = node.children) for (i = 0, n = children.length; i < n; ++i) nodes.push(children[i]);
	}
	while (node = next.pop()) callback.call(that, node, ++index, this);
	return this;
}
function node_find(callback, that) {
	let index = -1;
	for (const node of this) if (callback.call(that, node, ++index, this)) return node;
}
function node_sum(value) {
	return this.eachAfter(function(node) {
		var sum = +value(node.data) || 0;
		var children = node.children;
		var i = children && children.length;
		while (--i >= 0) sum += children[i].value;
		node.value = sum;
	});
}
function node_sort(compare) {
	return this.eachBefore(function(node) {
		if (node.children) node.children.sort(compare);
	});
}
function node_path(end) {
	var start = this;
	var ancestor = leastCommonAncestor(start, end);
	var nodes = [start];
	while (start !== ancestor) {
		start = start.parent;
		nodes.push(start);
	}
	var k = nodes.length;
	while (end !== ancestor) {
		nodes.splice(k, 0, end);
		end = end.parent;
	}
	return nodes;
}
function leastCommonAncestor(a, b) {
	if (a === b) return a;
	var aNodes = a.ancestors();
	var bNodes = b.ancestors();
	var c = null;
	a = aNodes.pop();
	b = bNodes.pop();
	while (a === b) {
		c = a;
		a = aNodes.pop();
		b = bNodes.pop();
	}
	return c;
}
function node_ancestors() {
	var node = this;
	var nodes = [node];
	while (node = node.parent) nodes.push(node);
	return nodes;
}
function node_descendants() {
	return Array.from(this);
}
function node_leaves() {
	var leaves = [];
	this.eachBefore(function(node) {
		if (!node.children) leaves.push(node);
	});
	return leaves;
}
function node_links() {
	var root = this;
	var links = [];
	root.each(function(node) {
		if (node !== root) links.push({
			source: node.parent,
			target: node
		});
	});
	return links;
}
function* node_iterator() {
	var node = this;
	var current;
	var next = [node];
	var children;
	var i;
	var n;
	do {
		current = next.reverse(), next = [];
		while (node = current.pop()) {
			yield node;
			if (children = node.children) for (i = 0, n = children.length; i < n; ++i) next.push(children[i]);
		}
	} while (next.length);
}
function hierarchy(data, children) {
	if (data instanceof Map) {
		data = [void 0, data];
		if (children === void 0) children = mapChildren;
	} else if (children === void 0) children = objectChildren;
	var root = new Node$1(data);
	var node;
	var nodes = [root];
	var child;
	var childs;
	var i;
	var n;
	while (node = nodes.pop()) if ((childs = children(node.data)) && (n = (childs = Array.from(childs)).length)) {
		node.children = childs;
		for (i = n - 1; i >= 0; --i) {
			nodes.push(child = childs[i] = new Node$1(childs[i]));
			child.parent = node;
			child.depth = node.depth + 1;
		}
	}
	return root.eachBefore(computeHeight);
}
function node_copy() {
	return hierarchy(this).eachBefore(copyData);
}
function objectChildren(d) {
	return d.children;
}
function mapChildren(d) {
	return Array.isArray(d) ? d[1] : null;
}
function copyData(node) {
	if (node.data.value !== void 0) node.value = node.data.value;
	node.data = node.data.data;
}
function computeHeight(node) {
	var height = 0;
	do
		node.height = height;
	while ((node = node.parent) && node.height < ++height);
}
function Node$1(data) {
	this.data = data;
	this.depth = this.height = 0;
	this.parent = null;
}
Node$1.prototype = hierarchy.prototype = {
	constructor: Node$1,
	count: node_count,
	each: node_each,
	eachAfter: node_eachAfter,
	eachBefore: node_eachBefore,
	find: node_find,
	sum: node_sum,
	sort: node_sort,
	path: node_path,
	ancestors: node_ancestors,
	descendants: node_descendants,
	leaves: node_leaves,
	links: node_links,
	copy: node_copy,
	[Symbol.iterator]: node_iterator
};
function required(f) {
	if (typeof f !== "function") throw new Error();
	return f;
}
function constantZero() {
	return 0;
}
function constant(x) {
	return function() {
		return x;
	};
}
function roundNode(node) {
	node.x0 = Math.round(node.x0);
	node.y0 = Math.round(node.y0);
	node.x1 = Math.round(node.x1);
	node.y1 = Math.round(node.y1);
}
function treemapDice(parent, x0, y0, x1, y1) {
	var nodes = parent.children;
	var node;
	var i = -1;
	var n = nodes.length;
	var k = parent.value && (x1 - x0) / parent.value;
	while (++i < n) {
		node = nodes[i], node.y0 = y0, node.y1 = y1;
		node.x0 = x0, node.x1 = x0 += node.value * k;
	}
}
function TreeNode(node, i) {
	this._ = node;
	this.parent = null;
	this.children = null;
	this.A = null;
	this.a = this;
	this.z = 0;
	this.m = 0;
	this.c = 0;
	this.s = 0;
	this.t = null;
	this.i = i;
}
TreeNode.prototype = Object.create(Node$1.prototype);
function treemapSlice(parent, x0, y0, x1, y1) {
	var nodes = parent.children;
	var node;
	var i = -1;
	var n = nodes.length;
	var k = parent.value && (y1 - y0) / parent.value;
	while (++i < n) {
		node = nodes[i], node.x0 = x0, node.x1 = x1;
		node.y0 = y0, node.y1 = y0 += node.value * k;
	}
}
var phi = (1 + Math.sqrt(5)) / 2;
function squarifyRatio(ratio, parent, x0, y0, x1, y1) {
	var rows = [];
	var nodes = parent.children;
	var row;
	var nodeValue;
	var i0 = 0;
	var i1 = 0;
	var n = nodes.length;
	var dx;
	var dy;
	var value = parent.value;
	var sumValue;
	var minValue;
	var maxValue;
	var newRatio;
	var minRatio;
	var alpha;
	var beta;
	while (i0 < n) {
		dx = x1 - x0, dy = y1 - y0;
		do
			sumValue = nodes[i1++].value;
		while (!sumValue && i1 < n);
		minValue = maxValue = sumValue;
		alpha = Math.max(dy / dx, dx / dy) / (value * ratio);
		beta = sumValue * sumValue * alpha;
		minRatio = Math.max(maxValue / beta, beta / minValue);
		for (; i1 < n; ++i1) {
			sumValue += nodeValue = nodes[i1].value;
			if (nodeValue < minValue) minValue = nodeValue;
			if (nodeValue > maxValue) maxValue = nodeValue;
			beta = sumValue * sumValue * alpha;
			newRatio = Math.max(maxValue / beta, beta / minValue);
			if (newRatio > minRatio) {
				sumValue -= nodeValue;
				break;
			}
			minRatio = newRatio;
		}
		rows.push(row = {
			value: sumValue,
			dice: dx < dy,
			children: nodes.slice(i0, i1)
		});
		if (row.dice) treemapDice(row, x0, y0, x1, value ? y0 += dy * sumValue / value : y1);
		else treemapSlice(row, x0, y0, value ? x0 += dx * sumValue / value : x1, y1);
		value -= sumValue, i0 = i1;
	}
	return rows;
}
var squarify = (function custom(ratio) {
	function squarify(parent, x0, y0, x1, y1) {
		squarifyRatio(ratio, parent, x0, y0, x1, y1);
	}
	squarify.ratio = function(x) {
		return custom((x = +x) > 1 ? x : 1);
	};
	return squarify;
})(phi);
function index() {
	var tile = squarify;
	var round = false;
	var dx = 1;
	var dy = 1;
	var paddingStack = [0];
	var paddingInner = constantZero;
	var paddingTop = constantZero;
	var paddingRight = constantZero;
	var paddingBottom = constantZero;
	var paddingLeft = constantZero;
	function treemap(root) {
		root.x0 = root.y0 = 0;
		root.x1 = dx;
		root.y1 = dy;
		root.eachBefore(positionNode);
		paddingStack = [0];
		if (round) root.eachBefore(roundNode);
		return root;
	}
	function positionNode(node) {
		var p = paddingStack[node.depth];
		var x0 = node.x0 + p;
		var y0 = node.y0 + p;
		var x1 = node.x1 - p;
		var y1 = node.y1 - p;
		if (x1 < x0) x0 = x1 = (x0 + x1) / 2;
		if (y1 < y0) y0 = y1 = (y0 + y1) / 2;
		node.x0 = x0;
		node.y0 = y0;
		node.x1 = x1;
		node.y1 = y1;
		if (node.children) {
			p = paddingStack[node.depth + 1] = paddingInner(node) / 2;
			x0 += paddingLeft(node) - p;
			y0 += paddingTop(node) - p;
			x1 -= paddingRight(node) - p;
			y1 -= paddingBottom(node) - p;
			if (x1 < x0) x0 = x1 = (x0 + x1) / 2;
			if (y1 < y0) y0 = y1 = (y0 + y1) / 2;
			tile(node, x0, y0, x1, y1);
		}
	}
	treemap.round = function(x) {
		return arguments.length ? (round = !!x, treemap) : round;
	};
	treemap.size = function(x) {
		return arguments.length ? (dx = +x[0], dy = +x[1], treemap) : [dx, dy];
	};
	treemap.tile = function(x) {
		return arguments.length ? (tile = required(x), treemap) : tile;
	};
	treemap.padding = function(x) {
		return arguments.length ? treemap.paddingInner(x).paddingOuter(x) : treemap.paddingInner();
	};
	treemap.paddingInner = function(x) {
		return arguments.length ? (paddingInner = typeof x === "function" ? x : constant(+x), treemap) : paddingInner;
	};
	treemap.paddingOuter = function(x) {
		return arguments.length ? treemap.paddingTop(x).paddingRight(x).paddingBottom(x).paddingLeft(x) : treemap.paddingTop();
	};
	treemap.paddingTop = function(x) {
		return arguments.length ? (paddingTop = typeof x === "function" ? x : constant(+x), treemap) : paddingTop;
	};
	treemap.paddingRight = function(x) {
		return arguments.length ? (paddingRight = typeof x === "function" ? x : constant(+x), treemap) : paddingRight;
	};
	treemap.paddingBottom = function(x) {
		return arguments.length ? (paddingBottom = typeof x === "function" ? x : constant(+x), treemap) : paddingBottom;
	};
	treemap.paddingLeft = function(x) {
		return arguments.length ? (paddingLeft = typeof x === "function" ? x : constant(+x), treemap) : paddingLeft;
	};
	return treemap;
}
(function custom(ratio) {
	function resquarify(parent, x0, y0, x1, y1) {
		if ((rows = parent._squarify) && rows.ratio === ratio) {
			var rows;
			var row;
			var nodes;
			var i;
			var j = -1;
			var n;
			var m = rows.length;
			var value = parent.value;
			while (++j < m) {
				row = rows[j], nodes = row.children;
				for (i = row.value = 0, n = nodes.length; i < n; ++i) row.value += nodes[i].value;
				if (row.dice) treemapDice(row, x0, y0, x1, value ? y0 += (y1 - y0) * row.value / value : y1);
				else treemapSlice(row, x0, y0, value ? x0 += (x1 - x0) * row.value / value : x1, y1);
				value -= row.value;
			}
		} else {
			parent._squarify = rows = squarifyRatio(ratio, parent, x0, y0, x1, y1);
			rows.ratio = ratio;
		}
	}
	resquarify.ratio = function(x) {
		return custom((x = +x) > 1 ? x : 1);
	};
	return resquarify;
})(phi);
//#endregion
export { index as n, hierarchy as t };
