import { i as __name } from "../../_runtime.mjs";
import { g as ccount } from "../@shikijs/core+[...].mjs";
//#region node_modules/devlop/lib/default.js
function ok$1() {}
__name(ok$1, "ok");
//#endregion
//#region node_modules/micromark-util-character/index.js
/**
* @import {Code} from 'micromark-util-types'
*/
/**
* Check whether the character code represents an ASCII alpha (`a` through `z`,
* case insensitive).
*
* An **ASCII alpha** is an ASCII upper alpha or ASCII lower alpha.
*
* An **ASCII upper alpha** is a character in the inclusive range U+0041 (`A`)
* to U+005A (`Z`).
*
* An **ASCII lower alpha** is a character in the inclusive range U+0061 (`a`)
* to U+007A (`z`).
*
* @param code
*   Code.
* @returns {boolean}
*   Whether it matches.
*/
var asciiAlpha = regexCheck$1(/[A-Za-z]/);
/**
* Check whether the character code represents an ASCII alphanumeric (`a`
* through `z`, case insensitive, or `0` through `9`).
*
* An **ASCII alphanumeric** is an ASCII digit (see `asciiDigit`) or ASCII alpha
* (see `asciiAlpha`).
*
* @param code
*   Code.
* @returns {boolean}
*   Whether it matches.
*/
var asciiAlphanumeric = regexCheck$1(/[\dA-Za-z]/);
/**
* Check whether the character code represents an ASCII atext.
*
* atext is an ASCII alphanumeric (see `asciiAlphanumeric`), or a character in
* the inclusive ranges U+0023 NUMBER SIGN (`#`) to U+0027 APOSTROPHE (`'`),
* U+002A ASTERISK (`*`), U+002B PLUS SIGN (`+`), U+002D DASH (`-`), U+002F
* SLASH (`/`), U+003D EQUALS TO (`=`), U+003F QUESTION MARK (`?`), U+005E
* CARET (`^`) to U+0060 GRAVE ACCENT (`` ` ``), or U+007B LEFT CURLY BRACE
* (`{`) to U+007E TILDE (`~`).
*
* See:
* **\[RFC5322]**:
* [Internet Message Format](https://tools.ietf.org/html/rfc5322).
* P. Resnick.
* IETF.
*
* @param code
*   Code.
* @returns {boolean}
*   Whether it matches.
*/
var asciiAtext = regexCheck$1(/[#-'*+\--9=?A-Z^-~]/);
/**
* Check whether a character code is an ASCII control character.
*
* An **ASCII control** is a character in the inclusive range U+0000 NULL (NUL)
* to U+001F (US), or U+007F (DEL).
*
* @param {Code} code
*   Code.
* @returns {boolean}
*   Whether it matches.
*/
function asciiControl(code) {
	return code !== null && (code < 32 || code === 127);
}
/**
* Check whether the character code represents an ASCII digit (`0` through `9`).
*
* An **ASCII digit** is a character in the inclusive range U+0030 (`0`) to
* U+0039 (`9`).
*
* @param code
*   Code.
* @returns {boolean}
*   Whether it matches.
*/
var asciiDigit = regexCheck$1(/\d/);
/**
* Check whether the character code represents an ASCII hex digit (`a` through
* `f`, case insensitive, or `0` through `9`).
*
* An **ASCII hex digit** is an ASCII digit (see `asciiDigit`), ASCII upper hex
* digit, or an ASCII lower hex digit.
*
* An **ASCII upper hex digit** is a character in the inclusive range U+0041
* (`A`) to U+0046 (`F`).
*
* An **ASCII lower hex digit** is a character in the inclusive range U+0061
* (`a`) to U+0066 (`f`).
*
* @param code
*   Code.
* @returns {boolean}
*   Whether it matches.
*/
var asciiHexDigit = regexCheck$1(/[\dA-Fa-f]/);
/**
* Check whether the character code represents ASCII punctuation.
*
* An **ASCII punctuation** is a character in the inclusive ranges U+0021
* EXCLAMATION MARK (`!`) to U+002F SLASH (`/`), U+003A COLON (`:`) to U+0040 AT
* SIGN (`@`), U+005B LEFT SQUARE BRACKET (`[`) to U+0060 GRAVE ACCENT
* (`` ` ``), or U+007B LEFT CURLY BRACE (`{`) to U+007E TILDE (`~`).
*
* @param code
*   Code.
* @returns {boolean}
*   Whether it matches.
*/
var asciiPunctuation = regexCheck$1(/[!-/:-@[-`{-~]/);
/**
* Check whether a character code is a markdown line ending.
*
* A **markdown line ending** is the virtual characters M-0003 CARRIAGE RETURN
* LINE FEED (CRLF), M-0004 LINE FEED (LF) and M-0005 CARRIAGE RETURN (CR).
*
* In micromark, the actual character U+000A LINE FEED (LF) and U+000D CARRIAGE
* RETURN (CR) are replaced by these virtual characters depending on whether
* they occurred together.
*
* @param {Code} code
*   Code.
* @returns {boolean}
*   Whether it matches.
*/
function markdownLineEnding(code) {
	return code !== null && code < -2;
}
/**
* Check whether a character code is a markdown line ending (see
* `markdownLineEnding`) or markdown space (see `markdownSpace`).
*
* @param {Code} code
*   Code.
* @returns {boolean}
*   Whether it matches.
*/
function markdownLineEndingOrSpace(code) {
	return code !== null && (code < 0 || code === 32);
}
/**
* Check whether a character code is a markdown space.
*
* A **markdown space** is the concrete character U+0020 SPACE (SP) and the
* virtual characters M-0001 VIRTUAL SPACE (VS) and M-0002 HORIZONTAL TAB (HT).
*
* In micromark, the actual character U+0009 CHARACTER TABULATION (HT) is
* replaced by one M-0002 HORIZONTAL TAB (HT) and between 0 and 3 M-0001 VIRTUAL
* SPACE (VS) characters, depending on the column at which the tab occurred.
*
* @param {Code} code
*   Code.
* @returns {boolean}
*   Whether it matches.
*/
function markdownSpace(code) {
	return code === -2 || code === -1 || code === 32;
}
/**
* Check whether the character code represents Unicode punctuation.
*
* A **Unicode punctuation** is a character in the Unicode `Pc` (Punctuation,
* Connector), `Pd` (Punctuation, Dash), `Pe` (Punctuation, Close), `Pf`
* (Punctuation, Final quote), `Pi` (Punctuation, Initial quote), `Po`
* (Punctuation, Other), or `Ps` (Punctuation, Open) categories, or an ASCII
* punctuation (see `asciiPunctuation`).
*
* See:
* **\[UNICODE]**:
* [The Unicode Standard](https://www.unicode.org/versions/).
* Unicode Consortium.
*
* @param code
*   Code.
* @returns
*   Whether it matches.
*/
var unicodePunctuation$1 = regexCheck$1(/\p{P}|\p{S}/u);
/**
* Check whether the character code represents Unicode whitespace.
*
* Note that this does handle micromark specific markdown whitespace characters.
* See `markdownLineEndingOrSpace` to check that.
*
* A **Unicode whitespace** is a character in the Unicode `Zs` (Separator,
* Space) category, or U+0009 CHARACTER TABULATION (HT), U+000A LINE FEED (LF),
* U+000C (FF), or U+000D CARRIAGE RETURN (CR) (**\[UNICODE]**).
*
* See:
* **\[UNICODE]**:
* [The Unicode Standard](https://www.unicode.org/versions/).
* Unicode Consortium.
*
* @param code
*   Code.
* @returns
*   Whether it matches.
*/
var unicodeWhitespace$1 = regexCheck$1(/\s/);
/**
* Create a code check from a regex.
*
* @param {RegExp} regex
*   Expression.
* @returns {(code: Code) => boolean}
*   Check.
*/
function regexCheck$1(regex) {
	return check;
	/**
	* Check whether a code matches the bound regex.
	*
	* @param {Code} code
	*   Character code.
	* @returns {boolean}
	*   Whether the character code matches the bound regex.
	*/
	function check(code) {
		return code !== null && code > -1 && regex.test(String.fromCharCode(code));
	}
}
__name(regexCheck$1, "regexCheck");
//#endregion
//#region node_modules/escape-string-regexp/index.js
function escapeStringRegexp(string) {
	if (typeof string !== "string") throw new TypeError("Expected a string");
	return string.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d");
}
//#endregion
//#region node_modules/unist-util-is/lib/index.js
/**
* Generate an assertion from a test.
*
* Useful if you’re going to test many nodes, for example when creating a
* utility where something else passes a compatible test.
*
* The created function is a bit faster because it expects valid input only:
* a `node`, `index`, and `parent`.
*
* @param {Test} test
*   *   when nullish, checks if `node` is a `Node`.
*   *   when `string`, works like passing `(node) => node.type === test`.
*   *   when `function` checks if function passed the node is true.
*   *   when `object`, checks that all keys in test are in node, and that they have (strictly) equal values.
*   *   when `array`, checks if any one of the subtests pass.
* @returns {Check}
*   An assertion.
*/
var convert = (
/**
* @param {Test} [test]
* @returns {Check}
*/
function(test) {
	if (test === null || test === void 0) return ok;
	if (typeof test === "function") return castFactory(test);
	if (typeof test === "object") return Array.isArray(test) ? anyFactory(test) : propertiesFactory(test);
	if (typeof test === "string") return typeFactory(test);
	throw new Error("Expected function, string, or object as test");
});
/**
* @param {Array<Props | TestFunction | string>} tests
* @returns {Check}
*/
function anyFactory(tests) {
	/** @type {Array<Check>} */
	const checks = [];
	let index = -1;
	while (++index < tests.length) checks[index] = convert(tests[index]);
	return castFactory(any);
	/**
	* @this {unknown}
	* @type {TestFunction}
	*/
	function any(...parameters) {
		let index = -1;
		while (++index < checks.length) if (checks[index].apply(this, parameters)) return true;
		return false;
	}
}
/**
* Turn an object into a test for a node with a certain fields.
*
* @param {Props} check
* @returns {Check}
*/
function propertiesFactory(check) {
	const checkAsRecord = check;
	return castFactory(all);
	/**
	* @param {Node} node
	* @returns {boolean}
	*/
	function all(node) {
		const nodeAsRecord = node;
		/** @type {string} */
		let key;
		for (key in check) if (nodeAsRecord[key] !== checkAsRecord[key]) return false;
		return true;
	}
}
/**
* Turn a string into a test for a node with a certain type.
*
* @param {string} check
* @returns {Check}
*/
function typeFactory(check) {
	return castFactory(type);
	/**
	* @param {Node} node
	*/
	function type(node) {
		return node && node.type === check;
	}
}
/**
* Turn a custom test into a test for a node that passes that test.
*
* @param {TestFunction} testFunction
* @returns {Check}
*/
function castFactory(testFunction) {
	return check;
	/**
	* @this {unknown}
	* @type {Check}
	*/
	function check(value, index, parent) {
		return Boolean(looksLikeANode(value) && testFunction.call(this, value, typeof index === "number" ? index : void 0, parent || void 0));
	}
}
function ok() {
	return true;
}
/**
* @param {unknown} value
* @returns {value is Node}
*/
function looksLikeANode(value) {
	return value !== null && typeof value === "object" && "type" in value;
}
//#endregion
//#region node_modules/unist-util-visit-parents/lib/color.js
/**
* Color a string.
*
* @param {string} d
*   Value.
* @returns {string}
*   Colored value.
*/
function color(d) {
	return d;
}
//#endregion
//#region node_modules/unist-util-visit-parents/lib/index.js
/**
* @import {Node as UnistNode, Parent as UnistParent} from 'unist'
*/
/**
* @typedef {Exclude<import('unist-util-is').Test, undefined> | undefined} Test
*   Test from `unist-util-is`.
*
*   Note: we have remove and add `undefined`, because otherwise when generating
*   automatic `.d.ts` files, TS tries to flatten paths from a local perspective,
*   which doesn’t work when publishing on npm.
*/
/**
* @typedef {(
*   Fn extends (value: any) => value is infer Thing
*   ? Thing
*   : Fallback
* )} Predicate
*   Get the value of a type guard `Fn`.
* @template Fn
*   Value; typically function that is a type guard (such as `(x): x is Y`).
* @template Fallback
*   Value to yield if `Fn` is not a type guard.
*/
/**
* @typedef {(
*   Check extends null | undefined // No test.
*   ? Value
*   : Value extends {type: Check} // String (type) test.
*   ? Value
*   : Value extends Check // Partial test.
*   ? Value
*   : Check extends Function // Function test.
*   ? Predicate<Check, Value> extends Value
*     ? Predicate<Check, Value>
*     : never
*   : never // Some other test?
* )} MatchesOne
*   Check whether a node matches a primitive check in the type system.
* @template Value
*   Value; typically unist `Node`.
* @template Check
*   Value; typically `unist-util-is`-compatible test, but not arrays.
*/
/**
* @typedef {(
*   Check extends ReadonlyArray<infer T>
*   ? MatchesOne<Value, T>
*   : Check extends Array<infer T>
*   ? MatchesOne<Value, T>
*   : MatchesOne<Value, Check>
* )} Matches
*   Check whether a node matches a check in the type system.
* @template Value
*   Value; typically unist `Node`.
* @template Check
*   Value; typically `unist-util-is`-compatible test.
*/
/**
* @typedef {0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10} Uint
*   Number; capped reasonably.
*/
/**
* @typedef {I extends 0 ? 1 : I extends 1 ? 2 : I extends 2 ? 3 : I extends 3 ? 4 : I extends 4 ? 5 : I extends 5 ? 6 : I extends 6 ? 7 : I extends 7 ? 8 : I extends 8 ? 9 : 10} Increment
*   Increment a number in the type system.
* @template {Uint} [I=0]
*   Index.
*/
/**
* @typedef {(
*   Node extends UnistParent
*   ? Node extends {children: Array<infer Children>}
*     ? Child extends Children ? Node : never
*     : never
*   : never
* )} InternalParent
*   Collect nodes that can be parents of `Child`.
* @template {UnistNode} Node
*   All node types in a tree.
* @template {UnistNode} Child
*   Node to search for.
*/
/**
* @typedef {InternalParent<InclusiveDescendant<Tree>, Child>} Parent
*   Collect nodes in `Tree` that can be parents of `Child`.
* @template {UnistNode} Tree
*   All node types in a tree.
* @template {UnistNode} Child
*   Node to search for.
*/
/**
* @typedef {(
*   Depth extends Max
*   ? never
*   :
*     | InternalParent<Node, Child>
*     | InternalAncestor<Node, InternalParent<Node, Child>, Max, Increment<Depth>>
* )} InternalAncestor
*   Collect nodes in `Tree` that can be ancestors of `Child`.
* @template {UnistNode} Node
*   All node types in a tree.
* @template {UnistNode} Child
*   Node to search for.
* @template {Uint} [Max=10]
*   Max; searches up to this depth.
* @template {Uint} [Depth=0]
*   Current depth.
*/
/**
* @typedef {InternalAncestor<InclusiveDescendant<Tree>, Child>} Ancestor
*   Collect nodes in `Tree` that can be ancestors of `Child`.
* @template {UnistNode} Tree
*   All node types in a tree.
* @template {UnistNode} Child
*   Node to search for.
*/
/**
* @typedef {(
*   Tree extends UnistParent
*     ? Depth extends Max
*       ? Tree
*       : Tree | InclusiveDescendant<Tree['children'][number], Max, Increment<Depth>>
*     : Tree
* )} InclusiveDescendant
*   Collect all (inclusive) descendants of `Tree`.
*
*   > 👉 **Note**: for performance reasons, this seems to be the fastest way to
*   > recurse without actually running into an infinite loop, which the
*   > previous version did.
*   >
*   > Practically, a max of `2` is typically enough assuming a `Root` is
*   > passed, but it doesn’t improve performance.
*   > It gets higher with `List > ListItem > Table > TableRow > TableCell`.
*   > Using up to `10` doesn’t hurt or help either.
* @template {UnistNode} Tree
*   Tree type.
* @template {Uint} [Max=10]
*   Max; searches up to this depth.
* @template {Uint} [Depth=0]
*   Current depth.
*/
/**
* @typedef {'skip' | boolean} Action
*   Union of the action types.
*
* @typedef {number} Index
*   Move to the sibling at `index` next (after node itself is completely
*   traversed).
*
*   Useful if mutating the tree, such as removing the node the visitor is
*   currently on, or any of its previous siblings.
*   Results less than 0 or greater than or equal to `children.length` stop
*   traversing the parent.
*
* @typedef {[(Action | null | undefined | void)?, (Index | null | undefined)?]} ActionTuple
*   List with one or two values, the first an action, the second an index.
*
* @typedef {Action | ActionTuple | Index | null | undefined | void} VisitorResult
*   Any value that can be returned from an enter visitor.
*
*   Like `VisitorResultExit`,
*   but `SKIP` can also be returned,
*   to not walk the children of the node,
*   and `ActionTuple` can be used to combine an action with an index.
*
* @typedef {Index | boolean | null | undefined | void} VisitorResultExit
*   Any value that can be returned from an exit visitor.
*/
/**
* @callback Visitor
*   Handle a node (matching `test`, if given) before its children.
*
*   Changes inside `node` are walked next.
*   Replacing or removing it is easier in `exit`.
*   When replacing or removing it here,
*   return `SKIP` (as otherwise its old children are walked),
*   or `[SKIP, index]` to continue with the node now at `index`.
*   Changing next siblings (in walk order) is fine;
*   changing previous siblings needs a new `Index`.
*   Removing an ancestor or changing its previous siblings is not supported.
* @param {Visited} node
*   Found node.
* @param {Array<VisitedParents>} ancestors
*   Ancestors of `node`.
* @param {number | undefined} index
*   Index of `node` in its parent (the last of `ancestors`),
*   or `undefined` for the tree itself.
* @returns {VisitorResult}
*   What to do next.
*
*   Like `VisitorExit`,
*   but `SKIP` can also be returned,
*   to not walk the children of `node`.
*   Passing a tuple back (`ActionTuple`) only makes sense as `[SKIP, Index]`.
* @template {UnistNode} [Visited=UnistNode]
*   Visited node type.
* @template {UnistParent} [VisitedParents=UnistParent]
*   Ancestor type.
*/
/**
* @callback VisitorExit
*   Handle a node (matching `test`, if given) after its children.
*
*   Changes inside `node` are not walked,
*   which makes this a good place to change `node` based on its children,
*   or to replace or remove it.
*   When removing `node` or changing previous siblings (in walk order),
*   return a new `Index`.
*   Removing an ancestor or changing its previous siblings is not supported.
* @param {Visited} node
*   Found node.
* @param {Array<VisitedParents>} ancestors
*   Ancestors of `node`.
* @param {number | undefined} index
*   Index of `node` in its parent (the last of `ancestors`),
*   or `undefined` for the tree itself.
* @returns {VisitorResultExit}
*   What to do next.
*
*   `CONTINUE` (`true`, nothing) continues as normal,
*   `EXIT` (`false`) stops traversing,
*   and `Index` continues at that sibling.
* @template {UnistNode} [Visited=UnistNode]
*   Visited node type.
* @template {UnistParent} [VisitedParents=UnistParent]
*   Ancestor type.
*/
/**
* @template {UnistNode} [Visited=UnistNode]
*   Visited node type.
* @template {UnistParent} [VisitedParents=UnistParent]
*   Ancestor type.
* @typedef Visitors
*   Handle nodes when entering and exiting them.
*   The `enter` visitor is optional while `exit` is required.
*
*   Pass an `enter` visitor directly to only handle nodes when entering them.
*
*   `enter` is called before children (if any) are walked and `exit` after that.
*   `exit` is still called when `enter` returns `SKIP`.
*   Both `enter` and `exit` are only called for nodes that match an optional `test`.
* @property {Visitor<Visited, VisitedParents> | null | undefined} [enter]
*   Handle a node before its children (optional).
* @property {VisitorExit<Visited, VisitedParents>} exit
*   Handle a node after its children.
*/
/**
* @typedef {Visitor<Matches<InclusiveDescendant<Tree>, Check>, Ancestor<Tree, Matches<InclusiveDescendant<Tree>, Check>>>} BuildVisitor
*   Build a typed `Visitor` function from a tree and a test.
*
*   It will infer which values are passed as `node` and which as `parents`.
* @template {UnistNode} [Tree=UnistNode]
*   Tree type.
* @template {Test} [Check=Test]
*   Test type.
*/
/**
* @typedef {Visitors<Matches<InclusiveDescendant<Tree>, Check>, Ancestor<Tree, Matches<InclusiveDescendant<Tree>, Check>>>} BuildVisitors
*   Build typed `Visitors` from a tree and a test.
*
*   It will infer which values are passed as `node` and which as `parents`.
* @template {UnistNode} [Tree=UnistNode]
*   Tree type.
* @template {Test} [Check=Test]
*   Test type.
*/
/** @type {Readonly<ActionTuple>} */
var empty = [];
/**
* Do not traverse this node’s children.
* Only works when entering a node.
*/
var SKIP = "skip";
/**
* Visit nodes, with ancestral information.
*
* This algorithm performs *depth-first* *tree traversal* in *preorder*
* (**NLR**) or if `reverse` is given,
* in *reverse preorder* (**NRL**).
* An `exit` visitor is called in *postorder* (**LRN**)
* or if `reverse` is given, in *reverse postorder* (**RLN**).
*
* You can choose which nodes are visited by passing a `test`.
* For complex tests, you should test yourself in a visitor, as it will be
* faster and will have improved type information.
*
* Walking the tree is an intensive task.
* Make use of the return values of the visitor when possible.
* Instead of walking a tree multiple times, walk it once, use `unist-util-is`
* to check if a node matches, and then perform different operations.
*
* You can change the tree.
* Changes inside a node made when entering it are walked,
* changes made when exiting it are not.
* See `Visitor` and `VisitorExit` for more info.
*
* @overload
* @param {Tree} tree
*   Tree to traverse.
* @param {Check} check
*   `unist-util-is`-compatible test.
* @param {BuildVisitor<Tree, Check>} enter
*   Handle each node when entering it.
* @param {boolean | null | undefined} [reverse]
*   Walk children from last to first;
*   for `enter`, reverse preorder (NRL) instead of preorder (NLR);
*   for `exit`, reverse postorder (RLN) instead of postorder (LRN).
* @returns {undefined}
*   Nothing.
*
* @overload
* @param {Tree} tree
*   Tree to traverse.
* @param {Check} check
*   `unist-util-is`-compatible test.
* @param {BuildVisitors<Tree, Check>} visitors
*   Handle each node when exiting it, and optionally when entering it.
* @param {boolean | null | undefined} [reverse]
*   Walk children from last to first;
*   for `enter`, reverse preorder (NRL) instead of preorder (NLR);
*   for `exit`, reverse postorder (RLN) instead of postorder (LRN).
* @returns {undefined}
*   Nothing.
*
* @overload
* @param {Tree} tree
*   Tree to traverse.
* @param {BuildVisitor<Tree>} enter
*   Handle each node when entering it.
* @param {boolean | null | undefined} [reverse]
*   Walk children from last to first;
*   for `enter`, reverse preorder (NRL) instead of preorder (NLR);
*   for `exit`, reverse postorder (RLN) instead of postorder (LRN).
* @returns {undefined}
*   Nothing.
*
* @overload
* @param {Tree} tree
*   Tree to traverse.
* @param {BuildVisitors<Tree>} visitors
*   Handle each node when exiting it, and optionally when entering it.
* @param {boolean | null | undefined} [reverse]
*   Walk children from last to first;
*   for `enter`, reverse preorder (NRL) instead of preorder (NLR);
*   for `exit`, reverse postorder (RLN) instead of postorder (LRN).
* @returns {undefined}
*   Nothing.
*
* @param {UnistNode} tree
*   Tree to traverse.
* @param {Visitor | Visitors | Test} testOrEnterOrVisitors
*   `unist-util-is`-compatible test, `enter`, or `visitors`.
* @param {Visitor | Visitors | boolean | null | undefined} [enterOrVisitorsOrReverse]
*   `enter`, `visitors`, or `reverse` after a test.
* @param {boolean | null | undefined} [reverse]
*   Walk children from last to first;
*   for `enter`, reverse preorder (NRL) instead of preorder (NLR);
*   for `exit`, reverse postorder (RLN) instead of postorder (LRN).
* @returns {undefined}
*   Nothing.
*
* @template {UnistNode} Tree
*   Node type.
* @template {Test} Check
*   `unist-util-is`-compatible test.
*/
function visitParents(tree, testOrEnterOrVisitors, enterOrVisitorsOrReverse, reverse) {
	if (!tree || typeof tree !== "object") throw new Error("Unexpected value `" + tree + "` for `tree`, expected node");
	let preorder = true;
	/** @type {Test} */
	let check;
	/** @type {Visitors | Visitor} */
	let visitors;
	/** @type {Visitor | null | undefined} */
	let enter;
	/** @type {VisitorExit | null | undefined} */
	let exit;
	if (typeof enterOrVisitorsOrReverse === "function" || enterOrVisitorsOrReverse && typeof enterOrVisitorsOrReverse === "object") {
		check = testOrEnterOrVisitors;
		visitors = enterOrVisitorsOrReverse;
		if (reverse) preorder = false;
	} else {
		visitors = testOrEnterOrVisitors;
		if (enterOrVisitorsOrReverse) preorder = false;
	}
	if (typeof visitors === "function") enter = visitors;
	else if (visitors && typeof visitors === "object") {
		if (visitors.enter === null || visitors.enter === void 0) {} else if (typeof visitors.enter === "function") enter = visitors.enter;
		else throw new Error("Unexpected value `" + visitors.enter + "` for `visitors.enter`, expected optional visitor");
		if (typeof visitors.exit === "function") exit = visitors.exit;
		else throw new Error("Unexpected value `" + visitors.exit + "` for `visitors.exit`, expected visitor (pass a visitor directly if you only want an enter visitor)");
	} else throw new Error("Unexpected value `" + visitors + "` for `enter` or `visitors`, expected visitor or object with visitors");
	const is = convert(check);
	const step = preorder ? 1 : -1;
	factory(tree, void 0, [])();
	/**
	* Create a function to visit a node.
	*
	* @param {UnistNode} node
	*   Node to visit.
	* @param {number | undefined} index
	*   Index of `node` in its parent.
	* @param {Array<UnistParent>} parents
	*   Ancestors of `node`.
	* @returns {() => Readonly<ActionTuple>}
	*   Visit `node`.
	*/
	function factory(node, index, parents) {
		const value = node && typeof node === "object" ? node : {};
		if (typeof value.type === "string") {
			const name = typeof value.tagName === "string" ? value.tagName : typeof value.name === "string" ? value.name : void 0;
			Object.defineProperty(visit, "name", { value: "node (" + color(node.type + (name ? "<" + name + ">" : "")) + ")" });
		}
		return visit;
		function visit() {
			const matches = !check || is(node, index, parents[parents.length - 1] || void 0);
			/** @type {Readonly<ActionTuple>} */
			let result = empty;
			if (enter && matches) {
				result = toResult(enter(node, parents, index));
				if (result[0] === false) return result;
			}
			if ("children" in node && node.children) {
				const nodeAsParent = node;
				if (nodeAsParent.children && result[0] !== "skip") {
					let offset = (preorder ? -1 : nodeAsParent.children.length) + step;
					const grandparents = [...parents, nodeAsParent];
					while (offset > -1 && offset < nodeAsParent.children.length) {
						const child = nodeAsParent.children[offset];
						const subresult = factory(child, offset, grandparents)();
						if (subresult[0] === false) return subresult;
						offset = typeof subresult[1] === "number" ? subresult[1] : offset + step;
					}
				}
			}
			if (exit && matches) {
				const exitResult = toResult(exit(node, parents, index));
				if (exitResult[0] === "skip") throw new Error("Unexpected value `" + exitResult[0] + "` from `exit`, expected `CONTINUE`, `EXIT`, index, or nothing");
				if (exitResult[0] === false || typeof exitResult[1] === "number") return exitResult;
			}
			return result;
		}
	}
}
/**
* Turn a return value into a clean result.
*
* @param {VisitorResult} value
*   Valid return values from visitors.
* @returns {Readonly<ActionTuple>}
*   Clean result.
*/
function toResult(value) {
	if (Array.isArray(value)) return value;
	if (typeof value === "number") return [true, value];
	return value === null || value === void 0 ? empty : [value];
}
//#endregion
//#region node_modules/mdast-util-find-and-replace/lib/index.js
/**
* @import {Nodes, Parents, PhrasingContent, Root, Text} from 'mdast'
* @import {BuildVisitor, Test, VisitorResult} from 'unist-util-visit-parents'
*/
/**
* @typedef RegExpMatchObject
*   Info on the match.
* @property {number} index
*   The index of the search at which the result was found.
* @property {string} input
*   A copy of the search string in the text node.
* @property {[...Array<Parents>, Text]} stack
*   All ancestors of the text node, where the last node is the text itself.
*
* @typedef {RegExp | string} Find
*   Pattern to find.
*
*   Strings are escaped and then turned into global expressions.
*
* @typedef {Array<FindAndReplaceTuple>} FindAndReplaceList
*   Several find and replaces, in array form.
*
* @typedef {[Find, Replace?]} FindAndReplaceTuple
*   Find and replace in tuple form.
*
* @typedef {ReplaceFunction | string | null | undefined} Replace
*   Thing to replace with.
*
* @callback ReplaceFunction
*   Callback called when a search matches.
* @param {...any} parameters
*   The parameters are the result of corresponding search expression:
*
*   * `value` (`string`) — whole match
*   * `...capture` (`Array<string>`) — matches from regex capture groups
*   * `match` (`RegExpMatchObject`) — info on the match
* @returns {Array<PhrasingContent> | PhrasingContent | string | false | null | undefined}
*   Thing to replace with.
*
*   * when `null`, `undefined`, `''`, remove the match
*   * …or when `false`, do not replace at all
*   * …or when `string`, replace with a text node of that value
*   * …or when `Node` or `Array<Node>`, replace with those nodes
*
* @typedef {[RegExp, ReplaceFunction]} Pair
*   Normalized find and replace.
*
* @typedef {Array<Pair>} Pairs
*   All find and replaced.
*
* @typedef Options
*   Configuration.
* @property {Test | null | undefined} [ignore]
*   Test for which nodes to ignore (optional).
*/
/**
* Find patterns in a tree and replace them.
*
* The algorithm searches the tree in *preorder* for complete values in `Text`
* nodes.
* Partial matches are not supported.
*
* @param {Nodes} tree
*   Tree to change.
* @param {FindAndReplaceList | FindAndReplaceTuple} list
*   Patterns to find.
* @param {Options | null | undefined} [options]
*   Configuration (optional).
* @returns {undefined}
*   Nothing.
*/
function findAndReplace(tree, list, options) {
	const ignored = convert((options || {}).ignore || []);
	const pairs = toPairs(list);
	let pairIndex = -1;
	while (++pairIndex < pairs.length) visitParents(tree, visitor);
	/**
	* Handle text nodes and skip ignored nodes.
	*
	* @type {BuildVisitor<Root>}
	*/
	function visitor(node, parents, index) {
		if (node.type === "text" && typeof index === "number") return handler(node, parents, index);
		if (ignored(node, index, parents[parents.length - 1])) return SKIP;
	}
	/**
	* Handle a text node which is not in an ignored parent.
	*
	* @param {Text} node
	*   Text node to search in.
	* @param {Array<Parents>} parents
	*   Ancestors of `node`.
	* @param {number} index
	*   Index of `node` in its parent.
	* @returns {VisitorResult}
	*   Where to continue visiting.
	*/
	function handler(node, parents, index) {
		const parent = parents[parents.length - 1];
		const find = pairs[pairIndex][0];
		const replace = pairs[pairIndex][1];
		let start = 0;
		let change = false;
		/** @type {Array<PhrasingContent>} */
		let nodes = [];
		find.lastIndex = 0;
		let match = find.exec(node.value);
		while (match) {
			const position = match.index;
			/** @type {RegExpMatchObject} */
			const matchObject = {
				index: match.index,
				input: match.input,
				stack: [...parents, node]
			};
			let value = replace(...match, matchObject);
			if (typeof value === "string") value = value.length > 0 ? {
				type: "text",
				value
			} : void 0;
			if (value === false) find.lastIndex = position + 1;
			else {
				if (start !== position) add({
					type: "text",
					value: node.value.slice(start, position)
				});
				if (Array.isArray(value)) for (const child of value) add(child);
				else if (value) add(value);
				start = position + match[0].length;
				change = true;
			}
			if (!find.global) break;
			match = find.exec(node.value);
		}
		if (change) {
			if (start < node.value.length) add({
				type: "text",
				value: node.value.slice(start)
			});
			parent.children.splice(index, 1, ...nodes);
		} else nodes = [node];
		return index + nodes.length;
		/**
		* Add a node.
		*
		* @param {PhrasingContent} child
		*   Node to add.
		* @returns {undefined}
		*   Nothing.
		*/
		function add(child) {
			const previous = nodes[nodes.length - 1];
			if (previous && previous.type === "text" && child.type === "text") previous.value += child.value;
			else nodes.push(child);
		}
	}
}
/**
* Turn a tuple or a list of tuples into pairs.
*
* @param {FindAndReplaceList | FindAndReplaceTuple} tupleOrList
*   Schema.
* @returns {Pairs}
*   Clean pairs.
*/
function toPairs(tupleOrList) {
	if (!Array.isArray(tupleOrList)) throw new TypeError("Expected find and replace tuple or list of tuples");
	/** @type {Pairs} */
	const result = [];
	const list = !tupleOrList[0] || Array.isArray(tupleOrList[0]) ? tupleOrList : [tupleOrList];
	let index = -1;
	while (++index < list.length) {
		const tuple = list[index];
		result.push([toExpression(tuple[0]), toFunction(tuple[1])]);
	}
	return result;
}
/**
* Turn a find into an expression.
*
* @param {Find} find
*   Pattern to find.
* @returns {RegExp}
*   Global expression.
*/
function toExpression(find) {
	return typeof find === "string" ? new RegExp(escapeStringRegexp(find), "g") : find;
}
/**
* Turn a replace into a function.
*
* @param {Replace} replace
*   Thing to replace with.
* @returns {ReplaceFunction}
*   Function that returns that thing.
*/
function toFunction(replace) {
	return typeof replace === "function" ? replace : function() {
		return replace;
	};
}
//#endregion
//#region node_modules/mdast-util-gfm-autolink-literal/lib/index.js
/**
* @import {RegExpMatchObject, ReplaceFunction} from 'mdast-util-find-and-replace'
* @import {CompileContext, Extension as FromMarkdownExtension, Handle as FromMarkdownHandle, Transform as FromMarkdownTransform} from 'mdast-util-from-markdown'
* @import {ConstructName, Options as ToMarkdownExtension} from 'mdast-util-to-markdown'
* @import {Link, PhrasingContent} from 'mdast'
*/
/** @type {ConstructName} */
var inConstruct = "phrasing";
/** @type {Array<ConstructName>} */
var notInConstruct = [
	"autolink",
	"link",
	"image",
	"label"
];
/**
* Create an extension for `mdast-util-from-markdown` to enable GFM autolink
* literals in markdown.
*
* @returns {FromMarkdownExtension}
*   Extension for `mdast-util-to-markdown` to enable GFM autolink literals.
*/
function gfmAutolinkLiteralFromMarkdown() {
	return {
		transforms: [transformGfmAutolinkLiterals],
		enter: {
			literalAutolink: enterLiteralAutolink,
			literalAutolinkEmail: enterLiteralAutolinkValue,
			literalAutolinkHttp: enterLiteralAutolinkValue,
			literalAutolinkWww: enterLiteralAutolinkValue
		},
		exit: {
			literalAutolink: exitLiteralAutolink,
			literalAutolinkEmail: exitLiteralAutolinkEmail,
			literalAutolinkHttp: exitLiteralAutolinkHttp,
			literalAutolinkWww: exitLiteralAutolinkWww
		}
	};
}
/**
* Create an extension for `mdast-util-to-markdown` to enable GFM autolink
* literals in markdown.
*
* @returns {ToMarkdownExtension}
*   Extension for `mdast-util-to-markdown` to enable GFM autolink literals.
*/
function gfmAutolinkLiteralToMarkdown() {
	return { unsafe: [
		{
			character: "@",
			before: "[+\\-.\\w]",
			after: "[\\-.\\w]",
			inConstruct,
			notInConstruct
		},
		{
			character: ".",
			before: "[Ww]",
			after: "[\\-.\\w]",
			inConstruct,
			notInConstruct
		},
		{
			character: ":",
			before: "[ps]",
			after: "\\/",
			inConstruct,
			notInConstruct
		}
	] };
}
/**
* @this {CompileContext}
* @type {FromMarkdownHandle}
*/
function enterLiteralAutolink(token) {
	this.enter({
		type: "link",
		title: null,
		url: "",
		children: []
	}, token);
}
/**
* @this {CompileContext}
* @type {FromMarkdownHandle}
*/
function enterLiteralAutolinkValue(token) {
	this.config.enter.autolinkProtocol.call(this, token);
}
/**
* @this {CompileContext}
* @type {FromMarkdownHandle}
*/
function exitLiteralAutolinkHttp(token) {
	this.config.exit.autolinkProtocol.call(this, token);
}
/**
* @this {CompileContext}
* @type {FromMarkdownHandle}
*/
function exitLiteralAutolinkWww(token) {
	this.config.exit.data.call(this, token);
	const node = this.stack[this.stack.length - 1];
	node.type;
	node.url = "http://" + this.sliceSerialize(token);
}
/**
* @this {CompileContext}
* @type {FromMarkdownHandle}
*/
function exitLiteralAutolinkEmail(token) {
	this.config.exit.autolinkEmail.call(this, token);
}
/**
* @this {CompileContext}
* @type {FromMarkdownHandle}
*/
function exitLiteralAutolink(token) {
	this.exit(token);
}
/** @type {FromMarkdownTransform} */
function transformGfmAutolinkLiterals(tree) {
	findAndReplace(tree, [[/(https?:\/\/|www(?=\.))([-.\w]+)([^ \t\r\n]*)/gi, findUrl], [/(?<=^|\s|\p{P}|\p{S})([-.\w+]+)@([-\w]+(?:\.[-\w]+)+)/gu, findEmail]], { ignore: ["link", "linkReference"] });
}
/**
* @type {ReplaceFunction}
* @param {string} _
* @param {string} protocol
* @param {string} domain
* @param {string} path
* @param {RegExpMatchObject} match
* @returns {Array<PhrasingContent> | Link | false}
*/
function findUrl(_, protocol, domain, path, match) {
	let prefix = "";
	if (!previous(match)) return false;
	if (/^w/i.test(protocol)) {
		domain = protocol + domain;
		protocol = "";
		prefix = "http://";
	}
	if (!isCorrectDomain(domain)) return false;
	const parts = splitUrl(domain + path);
	if (!parts[0]) return false;
	/** @type {Link} */
	const result = {
		type: "link",
		title: null,
		url: prefix + protocol + parts[0],
		children: [{
			type: "text",
			value: protocol + parts[0]
		}]
	};
	if (parts[1]) return [result, {
		type: "text",
		value: parts[1]
	}];
	return result;
}
/**
* @type {ReplaceFunction}
* @param {string} _
* @param {string} atext
* @param {string} label
* @param {RegExpMatchObject} match
* @returns {Link | false}
*/
function findEmail(_, atext, label, match) {
	if (!previous(match, true) || /[-\d_]$/.test(label)) return false;
	return {
		type: "link",
		title: null,
		url: "mailto:" + atext + "@" + label,
		children: [{
			type: "text",
			value: atext + "@" + label
		}]
	};
}
/**
* @param {string} domain
* @returns {boolean}
*/
function isCorrectDomain(domain) {
	const parts = domain.split(".");
	if (parts.length < 2 || parts[parts.length - 1] && (/_/.test(parts[parts.length - 1]) || !/[a-zA-Z\d]/.test(parts[parts.length - 1])) || parts[parts.length - 2] && (/_/.test(parts[parts.length - 2]) || !/[a-zA-Z\d]/.test(parts[parts.length - 2]))) return false;
	return true;
}
/**
* @param {string} url
* @returns {[string, string | undefined]}
*/
function splitUrl(url) {
	const trailExec = /[!"&'),.:;<>?\]}]+$/.exec(url);
	if (!trailExec) return [url, void 0];
	url = url.slice(0, trailExec.index);
	let trail = trailExec[0];
	let closingParenIndex = trail.indexOf(")");
	const openingParens = ccount(url, "(");
	let closingParens = ccount(url, ")");
	while (closingParenIndex !== -1 && openingParens > closingParens) {
		url += trail.slice(0, closingParenIndex + 1);
		trail = trail.slice(closingParenIndex + 1);
		closingParenIndex = trail.indexOf(")");
		closingParens++;
	}
	return [url, trail];
}
/**
* @param {RegExpMatchObject} match
* @param {boolean | null | undefined} [email=false]
* @returns {boolean}
*/
function previous(match, email) {
	const code = match.input.charCodeAt(match.index - 1);
	return (match.index === 0 || unicodeWhitespace$1(code) || unicodePunctuation$1(code)) && (!email || code !== 47);
}
//#endregion
//#region node_modules/micromark-util-symbol/lib/codes.js
/**
* Character codes.
*
* This module is compiled away!
*
* micromark works based on character codes.
* This module contains constants for the ASCII block and the replacement
* character.
* A couple of them are handled in a special way, such as the line endings
* (CR, LF, and CR+LF, commonly known as end-of-line: EOLs), the tab (horizontal
* tab) and its expansion based on what column it’s at (virtual space),
* and the end-of-file (eof) character.
* As values are preprocessed before handling them, the actual characters LF,
* CR, HT, and NUL (which is present as the replacement character), are
* guaranteed to not exist.
*
* Unicode basic latin block.
*/
var codes = {
	carriageReturn: -5,
	lineFeed: -4,
	carriageReturnLineFeed: -3,
	horizontalTab: -2,
	virtualSpace: -1,
	eof: null,
	nul: 0,
	soh: 1,
	stx: 2,
	etx: 3,
	eot: 4,
	enq: 5,
	ack: 6,
	bel: 7,
	bs: 8,
	ht: 9,
	lf: 10,
	vt: 11,
	ff: 12,
	cr: 13,
	so: 14,
	si: 15,
	dle: 16,
	dc1: 17,
	dc2: 18,
	dc3: 19,
	dc4: 20,
	nak: 21,
	syn: 22,
	etb: 23,
	can: 24,
	em: 25,
	sub: 26,
	esc: 27,
	fs: 28,
	gs: 29,
	rs: 30,
	us: 31,
	space: 32,
	exclamationMark: 33,
	quotationMark: 34,
	numberSign: 35,
	dollarSign: 36,
	percentSign: 37,
	ampersand: 38,
	apostrophe: 39,
	leftParenthesis: 40,
	rightParenthesis: 41,
	asterisk: 42,
	plusSign: 43,
	comma: 44,
	dash: 45,
	dot: 46,
	slash: 47,
	digit0: 48,
	digit1: 49,
	digit2: 50,
	digit3: 51,
	digit4: 52,
	digit5: 53,
	digit6: 54,
	digit7: 55,
	digit8: 56,
	digit9: 57,
	colon: 58,
	semicolon: 59,
	lessThan: 60,
	equalsTo: 61,
	greaterThan: 62,
	questionMark: 63,
	atSign: 64,
	uppercaseA: 65,
	uppercaseB: 66,
	uppercaseC: 67,
	uppercaseD: 68,
	uppercaseE: 69,
	uppercaseF: 70,
	uppercaseG: 71,
	uppercaseH: 72,
	uppercaseI: 73,
	uppercaseJ: 74,
	uppercaseK: 75,
	uppercaseL: 76,
	uppercaseM: 77,
	uppercaseN: 78,
	uppercaseO: 79,
	uppercaseP: 80,
	uppercaseQ: 81,
	uppercaseR: 82,
	uppercaseS: 83,
	uppercaseT: 84,
	uppercaseU: 85,
	uppercaseV: 86,
	uppercaseW: 87,
	uppercaseX: 88,
	uppercaseY: 89,
	uppercaseZ: 90,
	leftSquareBracket: 91,
	backslash: 92,
	rightSquareBracket: 93,
	caret: 94,
	underscore: 95,
	graveAccent: 96,
	lowercaseA: 97,
	lowercaseB: 98,
	lowercaseC: 99,
	lowercaseD: 100,
	lowercaseE: 101,
	lowercaseF: 102,
	lowercaseG: 103,
	lowercaseH: 104,
	lowercaseI: 105,
	lowercaseJ: 106,
	lowercaseK: 107,
	lowercaseL: 108,
	lowercaseM: 109,
	lowercaseN: 110,
	lowercaseO: 111,
	lowercaseP: 112,
	lowercaseQ: 113,
	lowercaseR: 114,
	lowercaseS: 115,
	lowercaseT: 116,
	lowercaseU: 117,
	lowercaseV: 118,
	lowercaseW: 119,
	lowercaseX: 120,
	lowercaseY: 121,
	lowercaseZ: 122,
	leftCurlyBrace: 123,
	verticalBar: 124,
	rightCurlyBrace: 125,
	tilde: 126,
	del: 127,
	byteOrderMarker: 65279,
	replacementCharacter: 65533
};
//#endregion
//#region node_modules/micromark-util-symbol/lib/constants.js
/**
* This module is compiled away!
*
* Parsing markdown comes with a couple of constants, such as minimum or maximum
* sizes of certain sequences.
* Additionally, there are a couple symbols used inside micromark.
* These are all defined here, but compiled away by scripts.
*/
var constants = {
	attentionSideAfter: 2,
	attentionSideBefore: 1,
	atxHeadingOpeningFenceSizeMax: 6,
	autolinkDomainSizeMax: 63,
	autolinkSchemeSizeMax: 32,
	cdataOpeningString: "CDATA[",
	characterGroupPunctuation: 2,
	characterGroupWhitespace: 1,
	characterReferenceDecimalSizeMax: 7,
	characterReferenceHexadecimalSizeMax: 6,
	characterReferenceNamedSizeMax: 31,
	codeFencedSequenceSizeMin: 3,
	contentTypeContent: "content",
	contentTypeDocument: "document",
	contentTypeFlow: "flow",
	contentTypeString: "string",
	contentTypeText: "text",
	hardBreakPrefixSizeMin: 2,
	htmlBasic: 6,
	htmlCdata: 5,
	htmlComment: 2,
	htmlComplete: 7,
	htmlDeclaration: 4,
	htmlInstruction: 3,
	htmlRawSizeMax: 8,
	htmlRaw: 1,
	linkResourceDestinationBalanceMax: 32,
	linkReferenceSizeMax: 999,
	listItemValueSizeMax: 10,
	numericBaseDecimal: 10,
	numericBaseHexadecimal: 16,
	tabSize: 4,
	thematicBreakMarkerCountMin: 3,
	v8MaxSafeChunkSize: 1e4
};
//#endregion
//#region node_modules/micromark-util-symbol/lib/types.js
/**
* This module is compiled away!
*
* Here is the list of all types of tokens exposed by micromark, with a short
* explanation of what they include and where they are found.
* In picking names, generally, the rule is to be as explicit as possible
* instead of reusing names.
* For example, there is a `definitionDestination` and a `resourceDestination`,
* instead of one shared name.
*/
var types = {
	data: "data",
	whitespace: "whitespace",
	lineEnding: "lineEnding",
	lineEndingBlank: "lineEndingBlank",
	linePrefix: "linePrefix",
	lineSuffix: "lineSuffix",
	atxHeading: "atxHeading",
	atxHeadingSequence: "atxHeadingSequence",
	atxHeadingText: "atxHeadingText",
	autolink: "autolink",
	autolinkEmail: "autolinkEmail",
	autolinkMarker: "autolinkMarker",
	autolinkProtocol: "autolinkProtocol",
	characterEscape: "characterEscape",
	characterEscapeValue: "characterEscapeValue",
	characterReference: "characterReference",
	characterReferenceMarker: "characterReferenceMarker",
	characterReferenceMarkerNumeric: "characterReferenceMarkerNumeric",
	characterReferenceMarkerHexadecimal: "characterReferenceMarkerHexadecimal",
	characterReferenceValue: "characterReferenceValue",
	codeFenced: "codeFenced",
	codeFencedFence: "codeFencedFence",
	codeFencedFenceSequence: "codeFencedFenceSequence",
	codeFencedFenceInfo: "codeFencedFenceInfo",
	codeFencedFenceMeta: "codeFencedFenceMeta",
	codeFlowValue: "codeFlowValue",
	codeIndented: "codeIndented",
	codeText: "codeText",
	codeTextData: "codeTextData",
	codeTextPadding: "codeTextPadding",
	codeTextSequence: "codeTextSequence",
	content: "content",
	definition: "definition",
	definitionDestination: "definitionDestination",
	definitionDestinationLiteral: "definitionDestinationLiteral",
	definitionDestinationLiteralMarker: "definitionDestinationLiteralMarker",
	definitionDestinationRaw: "definitionDestinationRaw",
	definitionDestinationString: "definitionDestinationString",
	definitionLabel: "definitionLabel",
	definitionLabelMarker: "definitionLabelMarker",
	definitionLabelString: "definitionLabelString",
	definitionMarker: "definitionMarker",
	definitionTitle: "definitionTitle",
	definitionTitleMarker: "definitionTitleMarker",
	definitionTitleString: "definitionTitleString",
	emphasis: "emphasis",
	emphasisSequence: "emphasisSequence",
	emphasisText: "emphasisText",
	escapeMarker: "escapeMarker",
	hardBreakEscape: "hardBreakEscape",
	hardBreakTrailing: "hardBreakTrailing",
	htmlFlow: "htmlFlow",
	htmlFlowData: "htmlFlowData",
	htmlText: "htmlText",
	htmlTextData: "htmlTextData",
	image: "image",
	label: "label",
	labelText: "labelText",
	labelLink: "labelLink",
	labelImage: "labelImage",
	labelMarker: "labelMarker",
	labelImageMarker: "labelImageMarker",
	labelEnd: "labelEnd",
	link: "link",
	paragraph: "paragraph",
	reference: "reference",
	referenceMarker: "referenceMarker",
	referenceString: "referenceString",
	resource: "resource",
	resourceDestination: "resourceDestination",
	resourceDestinationLiteral: "resourceDestinationLiteral",
	resourceDestinationLiteralMarker: "resourceDestinationLiteralMarker",
	resourceDestinationRaw: "resourceDestinationRaw",
	resourceDestinationString: "resourceDestinationString",
	resourceMarker: "resourceMarker",
	resourceTitle: "resourceTitle",
	resourceTitleMarker: "resourceTitleMarker",
	resourceTitleString: "resourceTitleString",
	setextHeading: "setextHeading",
	setextHeadingText: "setextHeadingText",
	setextHeadingLine: "setextHeadingLine",
	setextHeadingLineSequence: "setextHeadingLineSequence",
	strong: "strong",
	strongSequence: "strongSequence",
	strongText: "strongText",
	thematicBreak: "thematicBreak",
	thematicBreakSequence: "thematicBreakSequence",
	blockQuote: "blockQuote",
	blockQuotePrefix: "blockQuotePrefix",
	blockQuoteMarker: "blockQuoteMarker",
	blockQuotePrefixWhitespace: "blockQuotePrefixWhitespace",
	listOrdered: "listOrdered",
	listUnordered: "listUnordered",
	listItemIndent: "listItemIndent",
	listItemMarker: "listItemMarker",
	listItemPrefix: "listItemPrefix",
	listItemPrefixWhitespace: "listItemPrefixWhitespace",
	listItemValue: "listItemValue",
	chunkDocument: "chunkDocument",
	chunkContent: "chunkContent",
	chunkFlow: "chunkFlow",
	chunkText: "chunkText",
	chunkString: "chunkString"
};
var ambiguousRanges = [
	161,
	161,
	164,
	164,
	167,
	168,
	170,
	170,
	173,
	174,
	176,
	180,
	182,
	186,
	188,
	191,
	198,
	198,
	208,
	208,
	215,
	216,
	222,
	225,
	230,
	230,
	232,
	234,
	236,
	237,
	240,
	240,
	242,
	243,
	247,
	250,
	252,
	252,
	254,
	254,
	257,
	257,
	273,
	273,
	275,
	275,
	283,
	283,
	294,
	295,
	299,
	299,
	305,
	307,
	312,
	312,
	319,
	322,
	324,
	324,
	328,
	331,
	333,
	333,
	338,
	339,
	358,
	359,
	363,
	363,
	462,
	462,
	464,
	464,
	466,
	466,
	468,
	468,
	470,
	470,
	472,
	472,
	474,
	474,
	476,
	476,
	593,
	593,
	609,
	609,
	708,
	708,
	711,
	711,
	713,
	715,
	717,
	717,
	720,
	720,
	728,
	731,
	733,
	733,
	735,
	735,
	768,
	879,
	913,
	929,
	931,
	937,
	945,
	961,
	963,
	969,
	1025,
	1025,
	1040,
	1103,
	1105,
	1105,
	8208,
	8208,
	8211,
	8214,
	8216,
	8217,
	8220,
	8221,
	8224,
	8226,
	8228,
	8231,
	8240,
	8240,
	8242,
	8243,
	8245,
	8245,
	8251,
	8251,
	8254,
	8254,
	8308,
	8308,
	8319,
	8319,
	8321,
	8324,
	8364,
	8364,
	8451,
	8451,
	8453,
	8453,
	8457,
	8457,
	8467,
	8467,
	8470,
	8470,
	8481,
	8482,
	8486,
	8486,
	8491,
	8491,
	8531,
	8532,
	8539,
	8542,
	8544,
	8555,
	8560,
	8569,
	8585,
	8585,
	8592,
	8601,
	8632,
	8633,
	8658,
	8658,
	8660,
	8660,
	8679,
	8679,
	8704,
	8704,
	8706,
	8707,
	8711,
	8712,
	8715,
	8715,
	8719,
	8719,
	8721,
	8721,
	8725,
	8725,
	8730,
	8730,
	8733,
	8736,
	8739,
	8739,
	8741,
	8741,
	8743,
	8748,
	8750,
	8750,
	8756,
	8759,
	8764,
	8765,
	8776,
	8776,
	8780,
	8780,
	8786,
	8786,
	8800,
	8801,
	8804,
	8807,
	8810,
	8811,
	8814,
	8815,
	8834,
	8835,
	8838,
	8839,
	8853,
	8853,
	8857,
	8857,
	8869,
	8869,
	8895,
	8895,
	8978,
	8978,
	9312,
	9449,
	9451,
	9547,
	9552,
	9587,
	9600,
	9615,
	9618,
	9621,
	9632,
	9633,
	9635,
	9641,
	9650,
	9651,
	9654,
	9655,
	9660,
	9661,
	9664,
	9665,
	9670,
	9672,
	9675,
	9675,
	9678,
	9681,
	9698,
	9701,
	9711,
	9711,
	9733,
	9734,
	9737,
	9737,
	9742,
	9743,
	9756,
	9756,
	9758,
	9758,
	9792,
	9792,
	9794,
	9794,
	9824,
	9825,
	9827,
	9829,
	9831,
	9834,
	9836,
	9837,
	9839,
	9839,
	9886,
	9887,
	9919,
	9919,
	9926,
	9933,
	9935,
	9939,
	9941,
	9953,
	9955,
	9955,
	9960,
	9961,
	9963,
	9969,
	9972,
	9972,
	9974,
	9977,
	9979,
	9980,
	9982,
	9983,
	10045,
	10045,
	10102,
	10111,
	11094,
	11097,
	12872,
	12879,
	57344,
	63743,
	65024,
	65039,
	65533,
	65533,
	127232,
	127242,
	127248,
	127277,
	127280,
	127337,
	127344,
	127373,
	127375,
	127376,
	127387,
	127404,
	917760,
	917999,
	983040,
	1048573,
	1048576,
	1114109
];
var fullwidthRanges = [
	12288,
	12288,
	65281,
	65376,
	65504,
	65510
];
var halfwidthRanges = [
	8361,
	8361,
	65377,
	65470,
	65474,
	65479,
	65482,
	65487,
	65490,
	65495,
	65498,
	65500,
	65512,
	65518
];
var narrowRanges = [
	32,
	126,
	162,
	163,
	165,
	166,
	172,
	172,
	175,
	175,
	10214,
	10221,
	10629,
	10630
];
var wideRanges = [
	4352,
	4447,
	8986,
	8987,
	9001,
	9002,
	9193,
	9196,
	9200,
	9200,
	9203,
	9203,
	9725,
	9726,
	9748,
	9749,
	9776,
	9783,
	9800,
	9811,
	9855,
	9855,
	9866,
	9871,
	9875,
	9875,
	9889,
	9889,
	9898,
	9899,
	9917,
	9918,
	9924,
	9925,
	9934,
	9934,
	9940,
	9940,
	9962,
	9962,
	9970,
	9971,
	9973,
	9973,
	9978,
	9978,
	9981,
	9981,
	9989,
	9989,
	9994,
	9995,
	10024,
	10024,
	10060,
	10060,
	10062,
	10062,
	10067,
	10069,
	10071,
	10071,
	10133,
	10135,
	10160,
	10160,
	10175,
	10175,
	11035,
	11036,
	11088,
	11088,
	11093,
	11093,
	11904,
	11929,
	11931,
	12019,
	12032,
	12245,
	12272,
	12287,
	12289,
	12350,
	12353,
	12438,
	12441,
	12543,
	12549,
	12591,
	12593,
	12686,
	12688,
	12773,
	12783,
	12830,
	12832,
	12871,
	12880,
	42124,
	42128,
	42182,
	43360,
	43388,
	44032,
	55203,
	63744,
	64255,
	65040,
	65049,
	65072,
	65106,
	65108,
	65126,
	65128,
	65131,
	94176,
	94180,
	94192,
	94198,
	94208,
	101594,
	101631,
	101664,
	101760,
	101874,
	101888,
	102801,
	102816,
	102866,
	110576,
	110579,
	110581,
	110587,
	110589,
	110590,
	110592,
	110888,
	110898,
	110898,
	110928,
	110930,
	110933,
	110933,
	110948,
	110952,
	110960,
	111355,
	119552,
	119638,
	119648,
	119670,
	126980,
	126980,
	127183,
	127183,
	127374,
	127374,
	127377,
	127386,
	127406,
	127406,
	127488,
	127490,
	127504,
	127547,
	127552,
	127560,
	127568,
	127569,
	127584,
	127589,
	127744,
	127776,
	127789,
	127797,
	127799,
	127868,
	127870,
	127891,
	127904,
	127946,
	127951,
	127955,
	127968,
	127984,
	127988,
	127988,
	127992,
	128062,
	128064,
	128064,
	128066,
	128252,
	128255,
	128317,
	128331,
	128334,
	128336,
	128359,
	128378,
	128378,
	128405,
	128406,
	128420,
	128420,
	128507,
	128591,
	128640,
	128709,
	128716,
	128716,
	128720,
	128722,
	128725,
	128729,
	128732,
	128735,
	128747,
	128748,
	128756,
	128764,
	128986,
	128986,
	128992,
	129003,
	129008,
	129008,
	129292,
	129338,
	129340,
	129349,
	129351,
	129535,
	129648,
	129660,
	129664,
	129734,
	129736,
	129736,
	129740,
	129757,
	129759,
	129771,
	129775,
	129786,
	131072,
	196605,
	196608,
	262141
];
//#endregion
//#region node_modules/get-east-asian-width/utilities.js
/**
Binary search on a sorted flat array of [start, end] pairs.

@param {number[]} ranges - Flat array of inclusive [start, end] range pairs, e.g. [0, 5, 10, 20].
@param {number} codePoint - The value to search for.
@returns {boolean} Whether the value falls within any of the ranges.
*/
var isInRange = (ranges, codePoint) => {
	let low = 0;
	let high = Math.floor(ranges.length / 2) - 1;
	while (low <= high) {
		const mid = Math.floor((low + high) / 2);
		const i = mid * 2;
		if (codePoint < ranges[i]) high = mid - 1;
		else if (codePoint > ranges[i + 1]) low = mid + 1;
		else return true;
	}
	return false;
};
//#endregion
//#region node_modules/get-east-asian-width/lookup.js
var commonCjkCodePoint = 19968;
var [wideFastPathStart, wideFastPathEnd] = /* #__PURE__ */ findWideFastPathRange(wideRanges);
function findWideFastPathRange(ranges) {
	let fastPathStart = ranges[0];
	let fastPathEnd = ranges[1];
	for (let index = 0; index < ranges.length; index += 2) {
		const start = ranges[index];
		const end = ranges[index + 1];
		if (commonCjkCodePoint >= start && commonCjkCodePoint <= end) return [start, end];
		if (end - start > fastPathEnd - fastPathStart) {
			fastPathStart = start;
			fastPathEnd = end;
		}
	}
	return [fastPathStart, fastPathEnd];
}
var isAmbiguous = (codePoint) => {
	if (codePoint < 161 || codePoint > 1114109) return false;
	return isInRange(ambiguousRanges, codePoint);
};
var isFullwidth = (codePoint) => {
	if (codePoint < 12288 || codePoint > 65510) return false;
	return isInRange(fullwidthRanges, codePoint);
};
var isHalfwidth = (codePoint) => {
	if (codePoint < 8361 || codePoint > 65518) return false;
	return isInRange(halfwidthRanges, codePoint);
};
var isNarrow = (codePoint) => {
	if (codePoint < 32 || codePoint > 10630) return false;
	return isInRange(narrowRanges, codePoint);
};
var isWide = (codePoint) => {
	if (codePoint >= wideFastPathStart && codePoint <= wideFastPathEnd) return true;
	if (codePoint < 4352 || codePoint > 262141) return false;
	return isInRange(wideRanges, codePoint);
};
function getCategory(codePoint) {
	if (isAmbiguous(codePoint)) return "ambiguous";
	if (isFullwidth(codePoint)) return "fullwidth";
	if (isHalfwidth(codePoint)) return "halfwidth";
	if (isNarrow(codePoint)) return "narrow";
	if (isWide(codePoint)) return "wide";
	return "neutral";
}
//#endregion
//#region node_modules/get-east-asian-width/index.js
function validate(codePoint) {
	if (!Number.isSafeInteger(codePoint)) throw new TypeError(`Expected a code point, got \`${typeof codePoint}\`.`);
}
function eastAsianWidthType(codePoint) {
	validate(codePoint);
	return getCategory(codePoint);
}
//#endregion
//#region node_modules/micromark-extension-cjk-friendly-util/dist/characterWithNonBmp.js
function isEmoji(uc) {
	return /^\p{Emoji_Presentation}/u.test(String.fromCodePoint(uc));
}
/**
* Check if `uc` is CJK or IVS
*
* @param uc code point
* @returns `true` if `uc` is CJK, `null` if IVS, or `false` if neither
*/
function cjkOrIvs(uc) {
	if (!uc || uc < 4352) return false;
	switch (eastAsianWidthType(uc)) {
		case "fullwidth":
		case "halfwidth": return true;
		case "wide": return !isEmoji(uc);
		case "narrow": return false;
		case "ambiguous": return 917760 <= uc && uc <= 917999 ? null : false;
		case "neutral": return /^\p{sc=Hangul}/u.test(String.fromCodePoint(uc));
	}
}
function isCjkAmbiguousPunctuation(main, vs) {
	if (vs !== 65025 || !main || main < 8216) return false;
	return main === 8216 || main === 8217 || main === 8220 || main === 8221;
}
/**
* Check whether the character code represents Non-emoji General-use Variation Selector (U+FE00-U+FE0E).
*/
function nonEmojiGeneralUseVS(code) {
	return code !== null && code >= 65024 && code <= 65038;
}
/**
* Check whether the character code represents Unicode punctuation.
*
* A **Unicode punctuation** is a character in the Unicode `Pc` (Punctuation,
* Connector), `Pd` (Punctuation, Dash), `Pe` (Punctuation, Close), `Pf`
* (Punctuation, Final quote), `Pi` (Punctuation, Initial quote), `Po`
* (Punctuation, Other), or `Ps` (Punctuation, Open) categories, or an ASCII
* punctuation (see `asciiPunctuation`).
*
* See:
* **\[UNICODE]**:
* [The Unicode Standard](https://www.unicode.org/versions/).
* Unicode Consortium.
*
* @param code
*   Code.
* @returns
*   Whether it matches.
*/
var unicodePunctuation = regexCheck(/\p{P}|\p{S}/u);
/**
* Check whether the character code represents Unicode whitespace.
*
* Note that this does handle micromark specific markdown whitespace characters.
* See `markdownLineEndingOrSpace` to check that.
*
* A **Unicode whitespace** is a character in the Unicode `Zs` (Separator,
* Space) category, or U+0009 CHARACTER TABULATION (HT), U+000A LINE FEED (LF),
* U+000C (FF), or U+000D CARRIAGE RETURN (CR) (**\[UNICODE]**).
*
* See:
* **\[UNICODE]**:
* [The Unicode Standard](https://www.unicode.org/versions/).
* Unicode Consortium.
*
* @param code
*   Code.
* @returns
*   Whether it matches.
*/
var unicodeWhitespace = regexCheck(/\s/);
/**
* Create a code check from a regex.
*
* @param regex
*   Expression.
* @returns
*   Check.
*/
function regexCheck(regex) {
	return check;
	/**
	* Check whether a code matches the bound regex.
	*
	* @param code
	*   Character code.
	* @returns
	*   Whether the character code matches the bound regex.
	*/
	function check(code) {
		return code !== null && code > -1 && regex.test(String.fromCodePoint(code));
	}
}
//#endregion
//#region node_modules/micromark-extension-cjk-friendly-util/dist/categoryUtil.js
/**
* `true` if the code point represents a [Unicode whitespace character](https://spec.commonmark.org/0.31.2/#unicode-whitespace-character).
*
* @param category the return value of `classifyCharacter`.
* @returns `true` if the code point represents a Unicode whitespace character
*/
function isUnicodeWhitespace(category) {
	return Boolean(category & constants.characterGroupWhitespace);
}
/**
* `true` if the code point represents a [non-CJK punctuation character](https://github.com/tats-u/markdown-cjk-friendly/blob/main/specification.md#non-cjk-punctuation-character).
*
* @param category the return value of `classifyCharacter`.
* @returns `true` if the code point represents a non-CJK punctuation character
*/
function isNonCjkPunctuation(category) {
	return (category & constantsEx.cjkPunctuation) === constants.characterGroupPunctuation;
}
/**
* `true` if the code point represents a [CJK character](https://github.com/tats-u/markdown-cjk-friendly/blob/main/specification.md#cjk-character).
*
* @param category the return value of `classifyCharacter`.
* @returns `true` if the code point represents a CJK character
*/
function isCjk(category) {
	return Boolean(category & constantsEx.cjk);
}
/**
* `true` if the code point represents an [Ideographic Variation Selector](https://github.com/tats-u/markdown-cjk-friendly/blob/main/specification.md#ideographi-variation-selector).
*
* @param category the return value of `classifyCharacter`.
* @returns `true` if the code point represents an IVS
*/
function isIvs(category) {
	return category === constantsEx.ivs;
}
/**
* `true` if {@link isCjk} or {@link isIvs}.
*
* @param category the return value of {@link classifyCharacter}.
* @returns `true` if the code point represents a CJK or IVS
*/
function isCjkOrIvs(category) {
	return Boolean(category & constantsEx.cjkOrIvs);
}
/**
* `true` if the code point represents a [Non-emoji General-use Variation Selector](https://github.com/tats-u/markdown-cjk-friendly/blob/main/specification.md#non-emoji-general-use-variation-selector).
*
* @param category the return value of `classifyCharacter`.
* @returns `true` if the code point represents an Non-emoji General-use Variation Selector
*/
function isNonEmojiGeneralUseVS(category) {
	return category === constantsEx.nonEmojiGeneralUseVS;
}
/**
* `true` if the code point represents a [Unicode whitespace character](https://spec.commonmark.org/0.31.2/#unicode-whitespace-character) or a [Unicode punctuation character](https://spec.commonmark.org/0.31.2/#unicode-punctuation-character).
*
* @param category the return value of `classifyCharacter`.
* @returns `true` if the code point represents a space or punctuation
*/
function isSpaceOrPunctuation(category) {
	return Boolean(category & constantsEx.spaceOrPunctuation);
}
//#endregion
//#region node_modules/micromark-extension-cjk-friendly-util/dist/classifyCharacter.js
var constantsEx;
(function(_constantsEx) {
	_constantsEx.spaceOrPunctuation = 3;
	_constantsEx.cjk = 4096;
	_constantsEx.cjkPunctuation = 4098;
	_constantsEx.ivs = 8192;
	_constantsEx.cjkOrIvs = 12288;
	_constantsEx.nonEmojiGeneralUseVS = 16384;
	_constantsEx.variationSelector = 24576;
	_constantsEx.ivsToCjkRightShift = 1;
})(constantsEx || (constantsEx = {}));
/**
* Classify whether a code represents whitespace, punctuation, or something
* else.
*
* Used for attention (emphasis, strong), whose sequences can open or close
* based on the class of surrounding characters.
*
* > 👉 **Note**: eof (`null`) is seen as whitespace.
*
* @param code
*   Code.
* @returns
*   Group.
*/
function classifyCharacter$1(code) {
	if (code === codes.eof || markdownLineEndingOrSpace(code) || unicodeWhitespace(code)) return constants.characterGroupWhitespace;
	let value = 0;
	if (code >= 4352) {
		if (nonEmojiGeneralUseVS(code)) return constantsEx.nonEmojiGeneralUseVS;
		switch (cjkOrIvs(code)) {
			case null: return constantsEx.ivs;
			case true:
				value |= constantsEx.cjk;
				break;
		}
	}
	if (unicodePunctuation(code)) value |= constants.characterGroupPunctuation;
	return value;
}
__name(classifyCharacter$1, "classifyCharacter");
/**}
* Classify whether a code represents whitespace, punctuation, or something else.
*
* Recognizes general-use variation selectors. Use this instead of {@linkcode classifyCharacter} for previous character.
*
* @param before result of {@linkcode classifyCharacter} of the preceding character.
* @param get2Previous a function that returns the code point of the character before the preceding character. Use lambda or {@linkcode Function.prototype.bind}.
* @param previous code point of the preceding character
* @returns
*   Group of the main code point of the preceding character. Use `isCjkOrIvs` to check whether it is CJK
*/
function classifyPrecedingCharacter(before, get2Previous, previous) {
	if (!isNonEmojiGeneralUseVS(before)) return before;
	const twoPrevious = get2Previous();
	const twoBefore = classifyCharacter$1(twoPrevious);
	return !twoPrevious || isUnicodeWhitespace(twoBefore) ? before : isCjkAmbiguousPunctuation(twoPrevious, previous) ? constantsEx.cjkPunctuation : stripIvs(twoBefore);
}
function stripIvs(twoBefore) {
	return twoBefore & ~constantsEx.ivs;
}
//#endregion
//#region node_modules/micromark-extension-cjk-friendly-util/dist/codeUtil.js
/**
* Check if the given code is a [High-Surrogate Code Unit](https://www.unicode.org/glossary/#high_surrogate_code_unit).
*
* A High-Surrogate Code Unit is the _first_ half of a [Surrogate Pair](https://www.unicode.org/glossary/#surrogate_pair).
*
* @param code Code.
* @returns `true` if the code is a High-Surrogate Code Unit, `false` otherwise.
*/
function isCodeHighSurrogate(code) {
	return Boolean(code && code >= 55296 && code <= 56319);
}
/**
* Check if the given code is a [Low-Surrogate Code Unit](https://www.unicode.org/glossary/#low_surrogate_code_unit).
*
* A Low-Surrogate Code Unit is the _second_ half of a [Surrogate Pair](https://www.unicode.org/glossary/#surrogate_pair).
* @param code
*   The character code to check.
* @returns
*   True if the code is a Low-Surrogate Code Unit, false otherwise.
*/
function isCodeLowSurrogate(code) {
	return Boolean(code && code >= 56320 && code <= 57343);
}
/**
* If `code` is a [Low-Surrogate Code Unit](https://www.unicode.org/glossary/#low_surrogate_code_unit), try to get a genuine previous [Unicode Scalar Value](https://www.unicode.org/glossary/#unicode_scalar_value) corresponding to the Low-Surrogate Code Unit.
* @param code a tentative previous [code unit](https://www.unicode.org/glossary/#code_unit) less than 65,536, including a Low-Surrogate one
* @param nowPoint `this.now()` (`this` = `TokenizeContext`)
* @param sliceSerialize `this.sliceSerialize` (`this` = `TokenizeContext`)
* @returns a value greater than 65,535 if the previous code point represents a [Supplementary Character](https://www.unicode.org/glossary/#supplementary_character), or `code` otherwise
*/
function tryGetGenuinePreviousCode(code, nowPoint, sliceSerialize) {
	if (nowPoint._bufferIndex < 2) return code;
	const previousCandidate = sliceSerialize({
		start: {
			...nowPoint,
			_bufferIndex: nowPoint._bufferIndex - 2
		},
		end: nowPoint
	}).codePointAt(0);
	return previousCandidate && previousCandidate >= 65536 ? previousCandidate : code;
}
/**
* Try to get the [Unicode Code Point](https://www.unicode.org/glossary/#code_point) two positions before the current position.
*
* @param previousCode a previous code point. Should be greater than 65,535 if it represents a [Supplementary Character](https://www.unicode.org/glossary/#supplementary_character).
* @param nowPoint `this.now()` (`this` = `TokenizeContext`)
* @param sliceSerialize `this.sliceSerialize` (`this` = `TokenizeContext`)
* @returns a value greater than 65,535 if the code point two positions before represents a [Supplementary Character](https://www.unicode.org/glossary/#supplementary_character), a value less than 65,536 for a [BMP Character](https://www.unicode.org/glossary/#bmp_character), or `null` if not found
*/
function tryGetCodeTwoBefore(previousCode, nowPoint, sliceSerialize) {
	const previousWidth = previousCode >= 65536 ? 2 : 1;
	if (nowPoint._bufferIndex < 1 + previousWidth) return null;
	const idealStart = nowPoint._bufferIndex - previousWidth - 2;
	const twoPreviousBuffer = sliceSerialize({
		start: {
			...nowPoint,
			_bufferIndex: idealStart >= 0 ? idealStart : 0
		},
		end: {
			...nowPoint,
			_bufferIndex: nowPoint._bufferIndex - previousWidth
		}
	});
	const twoPreviousLast = twoPreviousBuffer.charCodeAt(twoPreviousBuffer.length - 1);
	if (Number.isNaN(twoPreviousLast)) return null;
	if (twoPreviousBuffer.length < 2 || twoPreviousLast < 56320 || 57343 < twoPreviousLast) return twoPreviousLast;
	const twoPreviousCandidate = twoPreviousBuffer.codePointAt(0);
	if (twoPreviousCandidate && twoPreviousCandidate >= 65536) return twoPreviousCandidate;
	return twoPreviousLast;
}
/**
* Lazily get the [Unicode Code Point](https://www.unicode.org/glossary/#code_point) two positions before the current position only if necessary.
*
* @see {@link tryGetCodeTwoBefore}
*/
var TwoPreviousCode = class {
	cachedValue = void 0;
	/**
	* @see {@link tryGetCodeTwoBefore}
	*
	* @param previousCode a previous code point. Should be greater than 65,535 if it represents a [Supplementary Character](https://www.unicode.org/glossary/#supplementary_character).
	* @param nowPoint `this.now()` (`this` = `TokenizeContext`)
	* @param sliceSerialize `this.sliceSerialize` (`this` = `TokenizeContext`)
	*/
	constructor(previousCode, nowPoint, sliceSerialize) {
		this.previousCode = previousCode;
		this.nowPoint = nowPoint;
		this.sliceSerialize = sliceSerialize;
	}
	/**
	* Returns the return value of {@link tryGetCodeTwoBefore}.
	*
	* If the value has not been computed yet, it will be computed and cached.
	*
	* @see {@link tryGetCodeTwoBefore}
	*
	* @returns a value greater than 65,535 if the code point two positions before represents a [Supplementary Character](https://www.unicode.org/glossary/#supplementary_character), a value less than 65,536 for a [BMP Character](https://www.unicode.org/glossary/#bmp_character), or `null` if not found
	*/
	value() {
		if (this.cachedValue === void 0) this.cachedValue = tryGetCodeTwoBefore(this.previousCode, this.nowPoint, this.sliceSerialize);
		return this.cachedValue;
	}
};
/**
* If `code` is a [High-Surrogate Code Unit](https://www.unicode.org/glossary/#high_surrogate_code_unit), try to get a genuine next [Unicode Scalar Value](https://www.unicode.org/glossary/#unicode_scalar_value) corresponding to the High-Surrogate Code Unit.
* @param code a tentative next [code unit](https://www.unicode.org/glossary/#code_unit) less than 65,536, including a High-Surrogate one
* @param nowPoint `this.now()` (`this` = `TokenizeContext`)
* @param sliceSerialize `this.sliceSerialize` (`this` = `TokenizeContext`)
* @returns a value greater than 65,535 if the next code point represents a [Supplementary Character](https://www.unicode.org/glossary/#supplementary_character), or `code` otherwise
*/
function tryGetGenuineNextCode(code, nowPoint, sliceSerialize) {
	const nextCandidate = sliceSerialize({
		start: nowPoint,
		end: {
			...nowPoint,
			_bufferIndex: nowPoint._bufferIndex + 2
		}
	}).codePointAt(0);
	return nextCandidate && nextCandidate >= 65536 ? nextCandidate : code;
}
//#endregion
//#region node_modules/micromark-util-chunked/index.js
/**
* Like `Array#splice`, but smarter for giant arrays.
*
* `Array#splice` takes all items to be inserted as individual argument which
* causes a stack overflow in V8 when trying to insert 100k items for instance.
*
* Otherwise, this does not return the removed items, and takes `items` as an
* array instead of rest parameters.
*
* @template {unknown} T
*   Item type.
* @param {Array<T>} list
*   List to operate on.
* @param {number} start
*   Index to remove/insert at (can be negative).
* @param {number} remove
*   Number of items to remove.
* @param {Array<T>} items
*   Items to inject into `list`.
* @returns {undefined}
*   Nothing.
*/
function splice(list, start, remove, items) {
	const end = list.length;
	let chunkStart = 0;
	/** @type {Array<unknown>} */
	let parameters;
	if (start < 0) start = -start > end ? 0 : end + start;
	else start = start > end ? end : start;
	remove = remove > 0 ? remove : 0;
	if (items.length < 1e4) {
		parameters = Array.from(items);
		parameters.unshift(start, remove);
		list.splice(...parameters);
	} else {
		if (remove) list.splice(start, remove);
		while (chunkStart < items.length) {
			parameters = items.slice(chunkStart, chunkStart + 1e4);
			parameters.unshift(start, 0);
			list.splice(...parameters);
			chunkStart += 1e4;
			start += 1e4;
		}
	}
}
/**
* Append `items` (an array) at the end of `list` (another array).
* When `list` was empty, returns `items` instead.
*
* This prevents a potentially expensive operation when `list` is empty,
* and adds items in batches to prevent V8 from hanging.
*
* @template {unknown} T
*   Item type.
* @param {Array<T>} list
*   List to operate on.
* @param {Array<T>} items
*   Items to add to `list`.
* @returns {Array<T>}
*   Either `list` or `items`.
*/
function push(list, items) {
	if (list.length > 0) {
		splice(list, list.length, 0, items);
		return list;
	}
	return items;
}
//#endregion
//#region node_modules/micromark-util-resolve-all/index.js
/**
* @import {Event, Resolver, TokenizeContext} from 'micromark-util-types'
*/
/**
* Call all `resolveAll`s.
*
* @param {ReadonlyArray<{resolveAll?: Resolver | undefined}>} constructs
*   List of constructs, optionally with `resolveAll`s.
* @param {Array<Event>} events
*   List of events.
* @param {TokenizeContext} context
*   Context used by `tokenize`.
* @returns {Array<Event>}
*   Changed events.
*/
function resolveAll(constructs, events, context) {
	/** @type {Array<Resolver>} */
	const called = [];
	let index = -1;
	while (++index < constructs.length) {
		const resolve = constructs[index].resolveAll;
		if (resolve && !called.includes(resolve)) {
			events = resolve(events, context);
			called.push(resolve);
		}
	}
	return events;
}
//#endregion
//#region node_modules/micromark-extension-cjk-friendly/dist/ext/attention.js
var attention$2 = {
	name: "attention",
	resolveAll: resolveAllAttention,
	tokenize: tokenizeAttention
};
function resolveAllAttention(events, context) {
	let index = -1;
	let open;
	let group;
	let text;
	let openingSequence;
	let closingSequence;
	let use;
	let nextEvents;
	let offset;
	while (++index < events.length) if (events[index][0] === "enter" && events[index][1].type === "attentionSequence" && events[index][1]._close) {
		open = index;
		while (open--) if (events[open][0] === "exit" && events[open][1].type === "attentionSequence" && events[open][1]._open && context.sliceSerialize(events[open][1]).charCodeAt(0) === context.sliceSerialize(events[index][1]).charCodeAt(0)) {
			if ((events[open][1]._close || events[index][1]._open) && (events[index][1].end.offset - events[index][1].start.offset) % 3 && !((events[open][1].end.offset - events[open][1].start.offset + events[index][1].end.offset - events[index][1].start.offset) % 3)) continue;
			use = events[open][1].end.offset - events[open][1].start.offset > 1 && events[index][1].end.offset - events[index][1].start.offset > 1 ? 2 : 1;
			const start = { ...events[open][1].end };
			const end = { ...events[index][1].start };
			movePoint(start, -use);
			movePoint(end, use);
			openingSequence = {
				type: use > 1 ? types.strongSequence : types.emphasisSequence,
				start,
				end: { ...events[open][1].end }
			};
			closingSequence = {
				type: use > 1 ? types.strongSequence : types.emphasisSequence,
				start: { ...events[index][1].start },
				end
			};
			text = {
				type: use > 1 ? types.strongText : types.emphasisText,
				start: { ...events[open][1].end },
				end: { ...events[index][1].start }
			};
			group = {
				type: use > 1 ? types.strong : types.emphasis,
				start: { ...openingSequence.start },
				end: { ...closingSequence.end }
			};
			events[open][1].end = { ...openingSequence.start };
			events[index][1].start = { ...closingSequence.end };
			nextEvents = [];
			if (events[open][1].end.offset - events[open][1].start.offset) nextEvents = push(nextEvents, [[
				"enter",
				events[open][1],
				context
			], [
				"exit",
				events[open][1],
				context
			]]);
			nextEvents = push(nextEvents, [
				[
					"enter",
					group,
					context
				],
				[
					"enter",
					openingSequence,
					context
				],
				[
					"exit",
					openingSequence,
					context
				],
				[
					"enter",
					text,
					context
				]
			]);
			context.parser.constructs.insideSpan.null;
			nextEvents = push(nextEvents, resolveAll(context.parser.constructs.insideSpan.null, events.slice(open + 1, index), context));
			nextEvents = push(nextEvents, [
				[
					"exit",
					text,
					context
				],
				[
					"enter",
					closingSequence,
					context
				],
				[
					"exit",
					closingSequence,
					context
				],
				[
					"exit",
					group,
					context
				]
			]);
			if (events[index][1].end.offset - events[index][1].start.offset) {
				offset = 2;
				nextEvents = push(nextEvents, [[
					"enter",
					events[index][1],
					context
				], [
					"exit",
					events[index][1],
					context
				]]);
			} else offset = 0;
			splice(events, open - 1, index - open + 3, nextEvents);
			index = open + nextEvents.length - offset - 2;
			break;
		}
	}
	index = -1;
	while (++index < events.length) if (events[index][1].type === "attentionSequence") events[index][1].type = "data";
	return events;
}
/**
* @this {TokenizeContext}
*   Context.
* @type {Tokenizer}
*/
function tokenizeAttention(effects, ok$1$2) {
	const attentionMarkers = this.parser.constructs.attentionMarkers.null;
	const { now, sliceSerialize, previous: tentativePrevious } = this;
	const previous = isCodeLowSurrogate(tentativePrevious) ? tryGetGenuinePreviousCode(tentativePrevious, now(), sliceSerialize) : tentativePrevious;
	const before = classifyCharacter$1(previous);
	const twoPrevious = new TwoPreviousCode(previous, now(), sliceSerialize);
	const beforePrimary = classifyPrecedingCharacter(before, twoPrevious.value.bind(twoPrevious), previous);
	/** @type {NonNullable<Code>} */
	let marker;
	return start;
	/**
	* Before a sequence.
	*
	* ```markdown
	* > | **
	*     ^
	* ```
	*
	* @type {State}
	*/
	function start(code) {
		code === codes.asterisk || codes.underscore;
		marker = code;
		effects.enter("attentionSequence");
		return inside(code);
	}
	/**
	* In a sequence.
	*
	* ```markdown
	* > | **
	*     ^^
	* ```
	*
	* @type {State}
	*/
	function inside(code) {
		if (code === marker) {
			effects.consume(code);
			return inside;
		}
		const token = effects.exit("attentionSequence");
		const after = classifyCharacter$1(isCodeHighSurrogate(code) ? tryGetGenuineNextCode(code, now(), sliceSerialize) : code);
		const beforeNonCjkPunctuation = isNonCjkPunctuation(beforePrimary);
		const beforeCoreAttentionMarker = previous === codes.asterisk || previous === codes.underscore;
		const beforeSpaceOrNonCjkPunctuation = beforeNonCjkPunctuation || isUnicodeWhitespace(beforePrimary) || beforeCoreAttentionMarker;
		const afterNonCjkPunctuation = isNonCjkPunctuation(after);
		const afterCoreAttentionMarker = code === codes.asterisk || code === codes.underscore;
		const afterSpaceOrNonCjkPunctuation = afterNonCjkPunctuation || isUnicodeWhitespace(after) || afterCoreAttentionMarker;
		const beforeCjkOrIvs = isCjkOrIvs(beforePrimary);
		const open = !afterSpaceOrNonCjkPunctuation || afterNonCjkPunctuation && (beforeSpaceOrNonCjkPunctuation || beforeCjkOrIvs) || attentionMarkers.includes(code) && code !== codes.asterisk && code !== codes.underscore;
		const close = !beforeSpaceOrNonCjkPunctuation || beforeNonCjkPunctuation && (afterSpaceOrNonCjkPunctuation || isCjk(after)) || attentionMarkers.includes(previous) && previous !== codes.asterisk && previous !== codes.underscore;
		token._open = Boolean(marker === codes.asterisk ? open : open && (isSpaceOrPunctuation(beforePrimary) || !close));
		token._close = Boolean(marker === codes.asterisk ? close : close && (isSpaceOrPunctuation(after) || !open));
		return ok$1$2(code);
	}
}
/**
* Move a point a bit.
*
* Note: `move` only works inside lines! It’s not possible to move past other
* chunks (replacement characters, tabs, or line endings).
*
* @param {Point} point
*   Point.
* @param {number} offset
*   Amount to move.
* @returns {undefined}
*   Nothing.
*/
function movePoint(point, offset) {
	point.column += offset;
	point.offset += offset;
	point._bufferIndex += offset;
}
//#endregion
//#region node_modules/micromark-extension-cjk-friendly/dist/index.js
/**
* Make Markdown emphasis (`**`) in CommonMark more friendly with Chinese, Japanese, and Korean (CJK).
*/
function cjkFriendlyExtension() {
	return {
		text: {
			[codes.asterisk]: attention$2,
			[codes.underscore]: attention$2
		},
		insideSpan: { null: [attention$2] }
	};
}
//#endregion
//#region node_modules/remark-cjk-friendly/dist/parseOnly.js
/**
* Make Markdown emphasis (`**`) in CommonMark more friendly with Chinese, Japanese, and Korean (CJK).
*
* This plugin only supports parsing. If you have been using `remark-cjk-friendly` since v2.0.1 or earlier, it is recommended to migrate to this to minimize bundled dependencies.
*/
function remarkCjkFriendly$2() {
	const data = this.data();
	(data.micromarkExtensions || (data.micromarkExtensions = [])).push(cjkFriendlyExtension());
}
__name(remarkCjkFriendly$2, "remarkCjkFriendly");
//#endregion
//#region node_modules/mdast-util-phrasing/lib/index.js
/**
* @typedef {import('mdast').Html} Html
* @typedef {import('mdast').PhrasingContent} PhrasingContent
*/
/**
* Check if the given value is *phrasing content*.
*
* > 👉 **Note**: Excludes `html`, which can be both phrasing or flow.
*
* @param node
*   Thing to check, typically `Node`.
* @returns
*   Whether `value` is phrasing content.
*/
var phrasing$2 = convert([
	"break",
	"delete",
	"emphasis",
	"footnote",
	"footnoteReference",
	"image",
	"imageReference",
	"inlineCode",
	"inlineMath",
	"link",
	"linkReference",
	"mdxJsxTextElement",
	"mdxTextExpression",
	"strong",
	"text",
	"textDirective"
]);
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/handle/blockquote.js
/**
* @import {Blockquote, Parents} from 'mdast'
* @import {Info, Map, State} from 'mdast-util-to-markdown'
*/
/**
* Serialize a blockquote node.
*
* @param {Blockquote} node
*   Node to serialize.
* @param {Parents | undefined} _
*   Parent node.
* @param {State} state
*   Info passed around.
* @param {Info} info
*   Info on surrounding context.
* @returns {string}
*   Serialized markdown.
*/
function blockquote(node, _, state, info) {
	const exit = state.enter("blockquote");
	const tracker = state.createTracker(info);
	tracker.move("> ");
	tracker.shift(2);
	const value = state.indentLines(state.containerFlow(node, tracker.current()), map$1);
	exit();
	return value;
}
/**
* Indent lines w/ blockquote markers.
*
* @type {Map}
*/
function map$1(line, _, blank) {
	return ">" + (blank ? "" : " ") + line;
}
__name(map$1, "map");
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/util/pattern-in-scope.js
/**
* @import {ConstructName, Unsafe} from 'mdast-util-to-markdown'
*/
/**
* Check if a pattern is in scope based on the current stack of constructs.
*
* @param {Array<ConstructName>} stack
*   Current stack of constructs.
* @param {Unsafe} pattern
*   Pattern to check.
* @returns {boolean}
*   Whether the pattern is in scope.
*/
function patternInScope(stack, pattern) {
	return listInScope(stack, pattern.inConstruct, true) && !listInScope(stack, pattern.notInConstruct, false);
}
/**
* Check if any of the constructs in the list are present in the stack.
*
* @param {Array<ConstructName>} stack
*   Current stack of constructs.
* @param {Unsafe['inConstruct']} list
*   List of constructs to check for in the stack.
* @param {boolean} none
*   Value to return if the list is empty or not provided.
* @returns {boolean}
*   Whether any of the constructs in the list are present in the stack.
*/
function listInScope(stack, list, none) {
	if (typeof list === "string") list = [list];
	if (!list || list.length === 0) return none;
	let index = -1;
	while (++index < list.length) if (stack.includes(list[index])) return true;
	return false;
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/handle/break.js
/**
* @import {Break, Parents} from 'mdast'
* @import {Info, State} from 'mdast-util-to-markdown'
*/
/**
* Serialize a break node.
*
* @param {Break} _
*   Node to serialize.
* @param {Parents | undefined} _1
*   Parent node.
* @param {State} state
*   Info passed around.
* @param {Info} info
*   Info on surrounding context.
* @returns {string}
*   Serialized markdown.
*/
function hardBreak(_, _1, state, info) {
	let index = -1;
	while (++index < state.unsafe.length) {
		const pattern = state.unsafe[index];
		if (pattern.character === "\n" && !pattern.before && !pattern.after && patternInScope(state.stack, pattern)) return /[\t ]/.test(info.before) ? "" : " ";
	}
	return "\\\n";
}
//#endregion
//#region node_modules/longest-streak/index.js
/**
* Get the count of the longest repeating streak of `substring` in `value`.
*
* @param {string} value
*   Content to search in.
* @param {string} substring
*   Substring to look for, typically one character.
* @returns {number}
*   Count of most frequent adjacent `substring`s in `value`.
*/
function longestStreak(value, substring) {
	const source = String(value);
	let index = source.indexOf(substring);
	let expected = index;
	let count = 0;
	let max = 0;
	if (typeof substring !== "string") throw new TypeError("Expected substring");
	while (index !== -1) {
		if (index === expected) {
			if (++count > max) max = count;
		} else count = 1;
		expected = index + substring.length;
		index = source.indexOf(substring, expected);
	}
	return max;
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/util/format-code-as-indented.js
/**
* @import {State} from 'mdast-util-to-markdown'
* @import {Code} from 'mdast'
*/
/**
* Checks if a code block can be formatted as an indented code block.
*
* @param {Code} node
*   Node to check.
* @param {State} state
*   Info passed around.
* @returns {boolean}
*   Whether the code can be formatted as an indented code block.
*/
function formatCodeAsIndented(node, state) {
	return Boolean(state.options.fences === false && node.value && !node.lang && /[^\n\r ]/.test(node.value) && !/^[\t ]*(?:[\n\r]|$)|(?:^|[\n\r])[\t ]*$/.test(node.value));
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/util/check-fence.js
/**
* @import {Options, State} from 'mdast-util-to-markdown'
*/
/**
* Checks the preferred fence option.
*
* @param {State} state
*   Info passed around.
* @returns {Exclude<Options['fence'], null | undefined>}
*   Preferred fence marker.
*/
function checkFence(state) {
	const marker = state.options.fence || "`";
	if (marker !== "`" && marker !== "~") throw new Error("Cannot serialize code with `" + marker + "` for `options.fence`, expected `` ` `` or `~`");
	return marker;
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/handle/code.js
/**
* @import {Info, Map, State} from 'mdast-util-to-markdown'
* @import {Code, Parents} from 'mdast'
*/
/**
* Serialize a code node.
*
* @param {Code} node
*   Node to serialize.
* @param {Parents | undefined} _
*   Parent node.
* @param {State} state
*   Info passed around.
* @param {Info} info
*   Info on surrounding context.
* @returns {string}
*   Serialized markdown.
*/
function code(node, _, state, info) {
	const marker = checkFence(state);
	const raw = node.value || "";
	if (formatCodeAsIndented(node, state)) {
		const exit = state.enter("codeIndented");
		const value = state.indentLines(raw, map);
		exit();
		return value;
	}
	const tracker = state.createTracker(info);
	const sequence = marker.repeat(Math.max(longestStreak(raw, marker) + 1, 3));
	const exit = state.enter("codeFenced");
	const suffix = marker === "`" ? "GraveAccent" : "Tilde";
	let value = tracker.move(sequence);
	if (node.lang) {
		const subexit = state.enter(`codeFencedLang${suffix}`);
		value += tracker.move(state.safe(node.lang, {
			before: value,
			after: " ",
			encode: ["`"],
			...tracker.current()
		}));
		subexit();
	}
	if (node.lang && node.meta) {
		const subexit = state.enter(`codeFencedMeta${suffix}`);
		value += tracker.move(" ");
		value += tracker.move(state.safe(node.meta, {
			before: value,
			after: "\n",
			encode: ["`"],
			...tracker.current()
		}));
		subexit();
	}
	value += tracker.move("\n");
	if (raw) value += tracker.move(raw + "\n");
	value += tracker.move(sequence);
	exit();
	return value;
}
/**
* Indent lines w/ code indent.
*
* @type {Map}
*/
function map(line, _, blank) {
	return (blank ? "" : "    ") + line;
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/util/check-quote.js
/**
* @import {Options, State} from 'mdast-util-to-markdown'
*/
/**
* Checks the preferred quote option.
*
* @param {State} state
*   Info passed around.
* @returns {Exclude<Options['quote'], null | undefined>}
*   Preferred quote.
*/
function checkQuote(state) {
	const marker = state.options.quote || "\"";
	if (marker !== "\"" && marker !== "'") throw new Error("Cannot serialize title with `" + marker + "` for `options.quote`, expected `\"`, or `'`");
	return marker;
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/handle/definition.js
/**
* @import {Info, State} from 'mdast-util-to-markdown'
* @import {Definition, Parents} from 'mdast'
*/
/**
* Serialize a definition node.
*
* @param {Definition} node
*   Node to serialize.
* @param {Parents | undefined} _
*   Parent node.
* @param {State} state
*   Info passed around.
* @param {Info} info
*   Info on surrounding context.
* @returns {string}
*   Serialized markdown.
*/
function definition(node, _, state, info) {
	const quote = checkQuote(state);
	const suffix = quote === "\"" ? "Quote" : "Apostrophe";
	const exit = state.enter("definition");
	let subexit = state.enter("label");
	const tracker = state.createTracker(info);
	let value = tracker.move("[");
	value += tracker.move(state.safe(state.associationId(node), {
		before: value,
		after: "]",
		...tracker.current()
	}));
	value += tracker.move("]: ");
	subexit();
	if (!node.url || /[\0- \u007F]/.test(node.url)) {
		subexit = state.enter("destinationLiteral");
		value += tracker.move("<");
		value += tracker.move(state.safe(node.url, {
			before: value,
			after: ">",
			...tracker.current()
		}));
		value += tracker.move(">");
	} else {
		subexit = state.enter("destinationRaw");
		value += tracker.move(state.safe(node.url, {
			before: value,
			after: node.title ? " " : "\n",
			...tracker.current()
		}));
	}
	subexit();
	if (node.title) {
		subexit = state.enter(`title${suffix}`);
		value += tracker.move(" " + quote);
		value += tracker.move(state.safe(node.title, {
			before: value,
			after: quote,
			...tracker.current()
		}));
		value += tracker.move(quote);
		subexit();
	}
	exit();
	return value;
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/util/check-emphasis.js
/**
* @import {Options, State} from 'mdast-util-to-markdown'
*/
/**
* Checks the preferred emphasis option.
*
* @param {State} state
*   Info passed around.
* @returns {Exclude<Options['emphasis'], null | undefined>}
*   Preferred emphasis marker.
*/
function checkEmphasis(state) {
	const marker = state.options.emphasis || "*";
	if (marker !== "*" && marker !== "_") throw new Error("Cannot serialize emphasis with `" + marker + "` for `options.emphasis`, expected `*`, or `_`");
	return marker;
}
//#endregion
//#region node_modules/micromark-util-classify-character/index.js
/**
* @import {Code} from 'micromark-util-types'
*/
/**
* Classify whether a code represents whitespace, punctuation, or something
* else.
*
* Used for attention (emphasis, strong), whose sequences can open or close
* based on the class of surrounding characters.
*
* > 👉 **Note**: eof (`null`) is seen as whitespace.
*
* @param {Code} code
*   Code.
* @returns {typeof constants.characterGroupWhitespace | typeof constants.characterGroupPunctuation | undefined}
*   Group.
*/
function classifyCharacter(code) {
	if (code === null || markdownLineEndingOrSpace(code) || unicodeWhitespace$1(code)) return 1;
	if (unicodePunctuation$1(code)) return 2;
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/util/character.js
/**
* Get the first character of a value.
*
* Is aware of astral characters (such as emoji).
*
* @param {string} value
*   Value.
* @returns {string}
*   First character; empty if `value` is empty.
*/
function firstCharacter$1(value) {
	const code = value.codePointAt(0);
	return code === void 0 ? "" : String.fromCodePoint(code);
}
__name(firstCharacter$1, "firstCharacter");
/**
* Get the last character of a value.
*
* Is aware of astral characters (such as emoji).
*
* @param {string} value
*   Value.
* @returns {string}
*   Last character; empty if `value` is empty.
*/
function lastCharacter$1(value) {
	const code = value.codePointAt(value.length - 2);
	return code !== void 0 && code > 65535 ? value.slice(-2) : value.slice(-1);
}
__name(lastCharacter$1, "lastCharacter");
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/util/encode-character-reference.js
/**
* Encode a code point as a character reference.
*
* @param {number} code
*   Code point to encode.
* @returns {string}
*   Encoded character reference.
*/
function encodeCharacterReference(code) {
	return "&#x" + code.toString(16).toUpperCase() + ";";
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/util/encode-info.js
/**
* @import {EncodeSides} from '../types.js'
*/
/**
* Check whether to encode (as a character reference) the characters
* surrounding an attention run.
*
* Which characters are around an attention run influence whether it works or
* not.
*
* See <https://github.com/orgs/syntax-tree/discussions/60> for more info.
* See this markdown in a particular renderer to see what works:
*
* ```markdown
* |                         | A (letter inside) | B (punctuation inside) | C (whitespace inside) | D (nothing inside) |
* | ----------------------- | ----------------- | ---------------------- | --------------------- | ------------------ |
* | 1 (letter outside)      | x*y*z             | x*.*z                  | x* *z                 | x**z               |
* | 2 (punctuation outside) | .*y*.             | .*.*.                  | .* *.                 | .**.               |
* | 3 (whitespace outside)  | x *y* z           | x *.* z                | x * * z               | x ** z             |
* | 4 (nothing outside)     | *x*               | *.*                    | * *                   | **                 |
* ```
*
* @param {number} outside
*   Code point on the outer side of the run.
* @param {number} inside
*   Code point on the inner side of the run.
* @param {string} marker
*   Marker of the run.
*   Underscores are handled more strictly (they form less often) than
*   asterisks.
* @returns {EncodeSides}
*   Whether to encode characters.
*/
function encodeInfo$1(outside, inside, marker) {
	const outsideKind = classifyCharacter(outside);
	const insideKind = classifyCharacter(inside);
	if (outsideKind === void 0) return insideKind === void 0 ? marker === "_" ? {
		inside: true,
		outside: true
	} : {
		inside: false,
		outside: false
	} : insideKind === 1 ? {
		inside: true,
		outside: true
	} : {
		inside: false,
		outside: true
	};
	if (outsideKind === 1) return insideKind === void 0 ? {
		inside: false,
		outside: false
	} : insideKind === 1 ? {
		inside: true,
		outside: true
	} : {
		inside: false,
		outside: false
	};
	return insideKind === void 0 ? {
		inside: false,
		outside: false
	} : insideKind === 1 ? {
		inside: true,
		outside: false
	} : {
		inside: false,
		outside: false
	};
}
__name(encodeInfo$1, "encodeInfo");
//#endregion
//#region node_modules/micromark-util-html-tag-name/index.js
/**
* List of lowercase HTML “block” tag names.
*
* The list, when parsing HTML (flow), results in more relaxed rules (condition
* 6).
* Because they are known blocks, the HTML-like syntax doesn’t have to be
* strictly parsed.
* For tag names not in this list, a more strict algorithm (condition 7) is used
* to detect whether the HTML-like syntax is seen as HTML (flow) or not.
*
* This is copied from:
* <https://spec.commonmark.org/0.30/#html-blocks>.
*
* > 👉 **Note**: `search` was added in `CommonMark@0.31`.
*/
var htmlBlockNames = [
	"address",
	"article",
	"aside",
	"base",
	"basefont",
	"blockquote",
	"body",
	"caption",
	"center",
	"col",
	"colgroup",
	"dd",
	"details",
	"dialog",
	"dir",
	"div",
	"dl",
	"dt",
	"fieldset",
	"figcaption",
	"figure",
	"footer",
	"form",
	"frame",
	"frameset",
	"h1",
	"h2",
	"h3",
	"h4",
	"h5",
	"h6",
	"head",
	"header",
	"hr",
	"html",
	"iframe",
	"legend",
	"li",
	"link",
	"main",
	"menu",
	"menuitem",
	"nav",
	"noframes",
	"ol",
	"optgroup",
	"option",
	"p",
	"param",
	"search",
	"section",
	"summary",
	"table",
	"tbody",
	"td",
	"tfoot",
	"th",
	"thead",
	"title",
	"tr",
	"track",
	"ul"
];
/**
* List of lowercase HTML “raw” tag names.
*
* The list, when parsing HTML (flow), results in HTML that can include lines
* without exiting, until a closing tag also in this list is found (condition
* 1).
*
* This module is copied from:
* <https://spec.commonmark.org/0.30/#html-blocks>.
*
* > 👉 **Note**: `textarea` was added in `CommonMark@0.30`.
*/
var htmlRawNames = [
	"pre",
	"script",
	"style",
	"textarea"
];
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/util/html-kind.js
/**
* @typedef {1 | 2 | 3 | 4 | 5 | 6 | 7} Kind
*   Kind of HTML (flow) element.
*/
/**
* Infer the kind of HTML that `value` is.
*
* This works on valid trees as produced by `micromark`.
* Kinds:
*
* 1. raw
* 2. comment
* 3. instruction
* 4. declaration
* 5. cdata
* 6. block
* 7. other
*
* See: <https://spec.commonmark.org/0.31.2/#html-blocks>.
*
* @param {string} value
*   HTML.
* @returns {Kind | undefined}
*   Kind; `undefined` if unknown.
*/
function htmlKind$1(value) {
	if (value.charCodeAt(0) !== 60) return;
	const next = value.charCodeAt(1);
	if (next === 33) {
		const code = value.charCodeAt(2);
		if (code === 45) return 2;
		if (code === 91) return 5;
		if (asciiAlpha(code)) return 4;
		return;
	}
	if (next === 63) return 3;
	const closing = next === 47;
	const start = closing ? 2 : 1;
	let end = start;
	let code = value.charCodeAt(end);
	if (!asciiAlpha(code)) return;
	while (code === 45 || asciiAlphanumeric(code)) code = value.charCodeAt(++end);
	const name = value.slice(start, end).toLowerCase();
	if (!closing && code !== 47 && htmlRawNames.includes(name)) return 1;
	return htmlBlockNames.includes(name) ? 6 : 7;
}
__name(htmlKind$1, "htmlKind");
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/util/container-phrasing.js
/**
* @import {Attention, Handle, Info, State, Tracker} from 'mdast-util-to-markdown'
* @import {PhrasingParents} from '../types.js'
*/
/**
* Markers for builtin attention (emphasis, strong) to whether they are stricter:
* whether they cannot open and close inside words.
*
* Builtin runs pair following CommonMark rules for emphasis and strong:
* they are split,
* using one or two markers at a time,
* with the rule of 3.
* Other markers pair like GFM strikethrough:
* whole runs pair with a run of the same size.
*
* @type {Map<string, boolean>}
*/
var builtins = /* @__PURE__ */ new Map([["*", false], ["_", true]]);
/**
* @typedef AttentionResult
*   Attention, of which the sequence is chosen later.
* @property {Array<Item>} children
*   Serialized children.
* @property {Array<string>} sequences
*   Sequences that can be used, in order of preference.
*/
/**
* @typedef Improvement
*   Improvement of attention sequences.
* @property {Map<AttentionResult, string>} chosen
*   Chosen sequences for each attention.
* @property {Array<Token>} tokens
*   Tokens involved in the improvement.
* @property {Mistake | undefined} mistake
*   Mistake that led to this improvement, if any.
*/
/**
* @typedef {AttentionResult | string} Item
*   Serialized phrasing.
*/
/**
* @typedef Mistake
*   Sequence that does not form its attention.
* @property {Array<AttentionResult>} attention
*   Attention to try other sequences for.
* @property {number} index
*   Index of the token.
*/
/**
* @typedef Run
*   Sequences next to each other with the same marker.
* @property {boolean} close
*   Whether it can close.
* @property {number} end
*   Index after the last marker not used (to open).
* @property {Array<Token>} markers
*   Sequence of each marker.
* @property {boolean} open
*   Whether it can open.
* @property {boolean} split
*   Whether it can be split (built-in attention).
* @property {number} start
*   Index of the first marker not used (to close).
* @property {Array<Token>} tokens
*   Sequences.
*/
/**
* @typedef Token
*   Rendered phrasing.
* @property {AttentionResult | undefined} attention
*   Attention, if this is one of its sequences.
* @property {string} value
*   Value.
*/
/**
* Get candidates for a mistake:
* attention to try other sequences for,
* later first.
*
* @param {Array<Token>} tokens
*   Tokens.
* @param {Array<Token>} involved
*   Sequences involved in the mistake.
* @param {Map<Token, Run>} runOf
*   Run of each sequence.
* @returns {Array<AttentionResult>}
*   Candidates.
*/
function candidates$1(tokens, involved, runOf) {
	/** @type {Set<AttentionResult | undefined>} */
	const related = /* @__PURE__ */ new Set();
	for (const token of tokens) {
		const siblings = runOf.get(token);
		if (siblings && token.attention && involved.some((d) => d.attention === token.attention)) for (const sibling of siblings.tokens) related.add(sibling.attention);
	}
	/** @type {Array<AttentionResult>} */
	const ordered = [];
	for (const token of tokens) if (token.attention && related.delete(token.attention)) ordered.push(token.attention);
	ordered.reverse();
	return ordered;
}
__name(candidates$1, "candidates");
/**
* Check whether sequences form their attention, like `micromark`.
*
* Sequences of `*` and `_` pair like emphasis and strong in CommonMark,
* others like strikethrough in GFM.
*
* @param {Array<Token>} tokens
*   Tokens.
* @param {string} before
*   Characters before.
* @param {string} after
*   Characters after.
* @returns {Mistake | undefined}
*   First mistake, if any.
*/
function check$1(tokens, before, after) {
	/** @type {Array<Run>} */
	const runs = [];
	/** @type {Map<Token, Array<Token>>} */
	const wrong = /* @__PURE__ */ new Map();
	/** @type {Map<Token, Run>} */
	const runOf = /* @__PURE__ */ new Map();
	let index = 0;
	while (index < tokens.length) {
		if (!tokens[index].attention) {
			index++;
			continue;
		}
		const marker = tokens[index].value.charAt(0);
		const strict = builtins.get(marker);
		let end = index + 1;
		while (end < tokens.length && tokens[end].attention && tokens[end].value.charAt(0) === marker) end++;
		const head = index ? tokens[index - 1].value : before;
		const previous = classifyCharacter(head.charCodeAt(head.length - 1));
		const next = classifyCharacter((end < tokens.length ? tokens[end].value : after).charCodeAt(0));
		const open = !next || next === 2 && Boolean(previous);
		const close = !previous || previous === 2 && Boolean(next);
		/** @type {Run} */
		const run = {
			tokens: tokens.slice(index, end),
			markers: [],
			start: 0,
			end: 0,
			open: strict ? open && (Boolean(previous) || !close) : open,
			close: strict ? close && (Boolean(next) || !open) : close,
			split: strict !== void 0
		};
		for (const token of run.tokens) {
			wrong.set(token, [...run.tokens]);
			runOf.set(token, run);
			let size = token.value.length;
			while (size--) run.markers.push(token);
		}
		run.end = run.markers.length;
		runs.push(run);
		index = end;
	}
	pair$1(runs, wrong);
	index = -1;
	while (++index < tokens.length) {
		const involved = wrong.get(tokens[index]);
		if (involved) return {
			attention: candidates$1(tokens, involved, runOf),
			index
		};
	}
}
__name(check$1, "check");
/**
* Encode the first or last character of tokens as a character reference,
* if it is text.
*
* @param {Array<Token>} tokens
*   Tokens.
* @param {boolean} start
*   Whether to encode the first or last character.
* @returns {undefined}
*   Nothing.
*/
function encode$1(tokens, start) {
	const token = tokens[start ? 0 : tokens.length - 1];
	if (!token || token.attention) return;
	const character = start ? firstCharacter$1(token.value) : lastCharacter$1(token.value);
	const reference = encodeCharacterReference(character.codePointAt(0));
	if (start) token.value = reference + token.value.slice(character.length);
	else {
		let value = token.value.slice(0, token.value.length - character.length);
		let escapes = 0;
		while (value.charCodeAt(value.length - 1 - escapes) === 92) escapes++;
		if (escapes % 2) value += "\\";
		token.value = value + reference;
	}
}
__name(encode$1, "encode");
/**
* Try other sequences for the candidates of a mistake and use the first that
* moves the mistake further.
*
* @param {Array<Item>} items
*   Items.
* @param {Map<AttentionResult, string>} chosen
*   Sequences to use instead of preferred sequences.
* @param {Mistake} mistake
*   Mistake.
* @param {string} before
*   Characters before.
* @param {string} after
*   Characters after.
* @returns {Improvement | undefined}
*   Result if better.
*/
function improve(items, chosen, mistake, before, after) {
	for (const attention of mistake.attention) {
		const current = chosen.get(attention) || attention.sequences[0];
		for (const sequence of attention.sequences) {
			if (sequence === current) continue;
			const trial = new Map(chosen);
			trial.set(attention, sequence);
			const tokens = render$1(items, trial, before, after);
			const next = check$1(tokens, before, after);
			if (!next || next.index > mistake.index) return {
				chosen: trial,
				mistake: next,
				tokens
			};
		}
	}
}
/**
* Pair runs like `micromark` and mark sequences that do form their attention
* as fine.
*
* Each pair uses markers from the end of an opener and the start of a closer.
* It forms the intended attention if those markers are exactly the whole
* opening and closing sequence of one attention.
* Otherwise attention is mixed up:
* either sequences of different attention pair,
* part of a sequence is used (such as `**` of strong as `*`),
* or several sequences are used together (such as `*` and `*` as `**`).
* Then the sequences involved are recorded with each other.
*
* @param {Array<Run>} runs
*   Runs.
* @param {Map<Token, Array<Token>>} wrong
*   Sequences that are wrong, with the sequences involved.
* @returns {undefined}
*   Nothing, `wrong` is changed.
*/
function pair$1(runs, wrong) {
	/** @type {Map<string, Array<Run>>} */
	const openersByMarker = /* @__PURE__ */ new Map();
	for (const closer of runs) {
		const marker = closer.tokens[0].value.charAt(0);
		let openers = openersByMarker.get(marker);
		if (!openers) {
			openers = [];
			openersByMarker.set(marker, openers);
		}
		let open = closer.close ? openers.length : 0;
		while (open-- && closer.start < closer.end) {
			const opener = openers[open];
			const openerSize = opener.end - opener.start;
			const closerSize = closer.end - closer.start;
			if (closer.split ? (opener.close || closer.open) && closerSize % 3 && !((openerSize + closerSize) % 3) : openerSize !== opener.markers.length || openerSize !== closerSize) continue;
			const size = closer.split ? openerSize > 1 && closerSize > 1 ? 2 : 1 : closerSize;
			const opening = opener.markers.slice(opener.end - size, opener.end);
			const closing = closer.markers.slice(closer.start, closer.start + size);
			const openToken = opening[0];
			const closeToken = closing[0];
			if (openToken === opening[size - 1] && openToken.value.length === size && closeToken === closing[size - 1] && closeToken.value.length === size && openToken.attention === closeToken.attention) {
				wrong.delete(openToken);
				wrong.delete(closeToken);
			} else {
				const involved = [.../* @__PURE__ */ new Set([...opening, ...closing])];
				for (const token of involved) {
					const list = wrong.get(token);
					if (list) list.push(...involved);
				}
			}
			opener.end -= size;
			closer.start += size;
			if (opener.start === opener.end) openers.splice(open, 1);
			open = openers.length;
		}
		if (closer.open && closer.start < closer.end) openers.push(closer);
	}
}
__name(pair$1, "pair");
/**
* Get the sequences that can be used for attention, in order of preference.
*
* @param {string} type
*   Node type.
* @param {Array<string>} markers
*   Markers.
* @param {Array<number>} sizes
*   Sizes.
* @returns {Array<string>}
*   Sequences.
*/
function attentionSequences$1(type, markers, sizes) {
	if (markers.length === 0) throw new Error("Cannot serialize `" + type + "` as attention without markers, expected one or more markers");
	if (sizes.length === 0) throw new Error("Cannot serialize `" + type + "` as attention without sizes, expected one or more sizes");
	for (const size of sizes) if (!Number.isSafeInteger(size) || size < 1) throw new Error("Cannot serialize `" + type + "` as attention with `" + size + "` as size, expected positive integer");
	/** @type {Array<string>} */
	const sequences = [];
	for (const marker of markers) {
		if (marker.length !== 1) throw new Error("Cannot serialize `" + type + "` as attention with `" + marker + "` as marker, expected a single ascii character");
		if (!asciiPunctuation(marker.charCodeAt(0))) throw new Error("Cannot serialize `" + type + "` as attention with `" + marker + "` as marker, expected ascii punctuation");
		for (const size of sizes) sequences.push(marker.repeat(size));
	}
	return sequences;
}
__name(attentionSequences$1, "attentionSequences");
/**
* Serialize the children of a parent that contains phrasing children,
* keeping attention separate,
* so that its markers can be chosen later.
*
* @param {PhrasingParents} parent
*   Parent of phrasing nodes.
* @param {State} state
*   Info passed around about the current state.
* @param {Info} info
*   Info on where we are in the document we are generating.
* @returns {Array<Item>}
*   Items.
*/
function phrasing$1(parent, state, info) {
	const indexStack = state.indexStack;
	const children = parent.children || [];
	/** @type {Array<Item>} */
	const results = [];
	let index = -1;
	let before = info.before;
	indexStack.push(-1);
	let tracker = state.createTracker(info);
	while (++index < children.length) {
		const child = children[index];
		/** @type {string} */
		let after;
		indexStack[indexStack.length - 1] = index;
		if (index + 1 < children.length) {
			/** @type {Handle} */
			let handle = state.handle.handlers[children[index + 1].type];
			if (handle && handle.peek) handle = handle.peek;
			after = handle ? firstCharacter$1(handle(children[index + 1], parent, state, {
				before: "",
				after: "",
				...tracker.current()
			})) : "";
		} else after = info.after;
		const previous = results[results.length - 1];
		if (typeof previous === "string" && (before === "\r" || before === "\n") && child.type === "html" && htmlKind$1(child.value) !== 7) {
			results[results.length - 1] = previous.replace(/(\r?\n|\r)$/, " ");
			before = " ";
			tracker = state.createTracker(info);
			tracker.move(serialize$1(results, info.before, info.after));
		}
		/** @type {(Handle & {attention?: Attention | undefined}) | undefined} */
		const handle = state.handle.handlers[child.type];
		if (handle && handle.attention) {
			const item = attentionItem(child, handle.attention, state, tracker);
			results.push(item);
			before = lastCharacter$1(item.sequences[0]);
		} else {
			const value = state.handle(child, parent, state, {
				...tracker.current(),
				after,
				before
			});
			if (!value) continue;
			tracker.move(value);
			results.push(value);
			before = lastCharacter$1(value);
		}
	}
	indexStack.pop();
	return results;
}
__name(phrasing$1, "phrasing");
/**
* Serialize a node as attention,
* with its sequence chosen later.
*
* @param {PhrasingParents} node
*   Node.
* @param {Attention} attention
*   Attention of the node.
* @param {State} state
*   Info passed around about the current state.
* @param {Tracker} tracker
*   Tracker.
* @returns {AttentionResult}
*   Attention.
*/
function attentionItem(node, attention, state, tracker) {
	const { construct, markers, sizes } = attention(node, state);
	const sequences = attentionSequences$1(node.type, markers, sizes);
	const sequence = sequences[0];
	const exit = state.enter(construct);
	tracker.move(sequence);
	const children = phrasing$1(node, state, {
		...tracker.current(),
		before: sequence,
		after: sequence
	});
	tracker.move(serialize$1(children, sequence, sequence));
	tracker.move(sequence);
	exit();
	return {
		children,
		sequences
	};
}
/**
* Render items with sequences;
* encoding characters around attention where needed.
*
* @param {Array<Item>} items
*   Serialized phrasing.
* @param {Map<AttentionResult, string>} chosen
*   Sequences to use instead of preferred sequences.
* @param {string} before
*   Characters before.
* @param {string} after
*   Characters after.
* @returns {Array<Token>}
*   Tokens.
*/
function render$1(items, chosen, before, after) {
	/** @type {Array<Token>} */
	const tokens = [];
	/** @type {string | undefined} */
	let encodeAfter;
	let previous = lastCharacter$1(before);
	let index = -1;
	while (++index < items.length) {
		const item = items[index];
		if (typeof item === "string") {
			/** @type {Token} */
			const token = {
				value: item,
				attention: void 0
			};
			if (encodeAfter && encodeAfter === firstCharacter$1(item)) encode$1([token], true);
			encodeAfter = void 0;
			tokens.push(token);
			if (token.value) previous = lastCharacter$1(token.value);
			continue;
		}
		const sequence = chosen.get(item) || item.sequences[0];
		const marker = sequence.charAt(0);
		const next = items[index + 1];
		const outsideBefore = previous;
		const outsideAfter = firstCharacter$1(next === void 0 ? after : typeof next === "string" ? next : chosen.get(next) || next.sequences[0]);
		const inside = render$1(item.children, chosen, sequence, sequence);
		const head = inside.length > 0 ? inside[0].value : "";
		const open = encodeInfo$1(outsideBefore.charCodeAt(outsideBefore.length - 1), head.charCodeAt(0), marker);
		if (open.inside) encode$1(inside, true);
		const tail = inside.length > 0 ? lastCharacter$1(inside[inside.length - 1].value) : "";
		const close = encodeInfo$1(outsideAfter.charCodeAt(0), tail.charCodeAt(tail.length - 1), marker);
		if (close.inside) encode$1(inside, false);
		if (open.outside && outsideBefore !== "\n" && outsideBefore !== "\r") encode$1(tokens, false);
		if (close.outside) encodeAfter = outsideAfter;
		tokens.push({
			value: sequence,
			attention: item
		}, ...inside, {
			value: sequence,
			attention: item
		});
		previous = sequence.charAt(sequence.length - 1);
	}
	return tokens;
}
__name(render$1, "render");
/**
* Serialize phrasing with attention.
*
* Whether attention forms depends on everything around it.
* This checks that it does and tries other sequences if not.
*
* @param {Array<Item>} items
*   Phrasing items.
* @param {string} before
*   Characters before.
* @param {string} after
*   Characters after.
* @returns {string}
*   Serialized markdown.
*/
function serialize$1(items, before, after) {
	/** @type {Map<AttentionResult, string>} */
	let chosen = /* @__PURE__ */ new Map();
	const initial = render$1(items, chosen, before, after);
	let tokens = initial;
	let mistake = check$1(tokens, before, after);
	while (mistake) {
		const next = improve(items, chosen, mistake, before, after);
		if (!next) {
			tokens = initial;
			break;
		}
		chosen = next.chosen;
		tokens = next.tokens;
		mistake = next.mistake;
	}
	let result = "";
	for (const token of tokens) result += token.value;
	return result;
}
__name(serialize$1, "serialize");
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/handle/emphasis.js
/**
* @import {AttentionInfo, Info, State} from 'mdast-util-to-markdown'
* @import {Emphasis, Parents} from 'mdast'
*/
emphasis.attention = attention$1;
emphasis.peek = peek$1;
/**
* Serialize an emphasis node.
*
* Attention is properly handled by `containerPhrasing`.
*
* @param {Emphasis} node
*   Node to serialize.
* @param {Parents | undefined} _
*   Parent node.
* @param {State} state
*   Info passed around.
* @param {Info} info
*   Info on surrounding context.
* @returns {string}
*   Serialized markdown.
*/
function emphasis(node, _, state, info) {
	const exit = state.enter("phrasing");
	const value = serialize$1([attentionItem(node, attention$1, state, state.createTracker(info))], info.before, info.after);
	exit();
	return value;
}
/**
* Serialize an emphasis node as attention.
*
* @param {Emphasis} _
*   Node to serialize.
* @param {State} state
*   Info passed around.
* @returns {AttentionInfo}
*   Info on how to serialize the node.
*/
function attention$1(_, state) {
	return {
		construct: "emphasis",
		markers: checkEmphasis(state) === "*" ? ["*", "_"] : ["_", "*"],
		sizes: [1]
	};
}
__name(attention$1, "attention");
/**
* Peek at this node.
*
* @param {Emphasis} _
*   Node to serialize.
* @param {Parents | undefined} _1
*   Parent node.
* @param {State} state
*   Info passed around.
* @returns {string}
*   Start of the serialized markdown.
*/
function peek$1(_, _1, state) {
	return state.options.emphasis || "*";
}
__name(peek$1, "peek");
//#endregion
//#region node_modules/unist-util-visit/lib/index.js
/**
* @import {Node as UnistNode, Parent as UnistParent} from 'unist'
* @import {
*   InclusiveDescendant,
*   Matches,
*   Visitors as ParentsVisitors,
*   VisitorResult,
*   VisitorResultExit
* } from 'unist-util-visit-parents'
*/
/**
* @typedef {Exclude<import('unist-util-is').Test, undefined> | undefined} Test
*   Test from `unist-util-is`.
*
*   Note: we have remove and add `undefined`, because otherwise when generating
*   automatic `.d.ts` files, TS tries to flatten paths from a local perspective,
*   which doesn’t work when publishing on npm.
*/
/**
* @typedef {(
*   Node extends UnistParent
*   ? Node extends {children: Array<infer Children>}
*     ? Child extends Children ? Node : never
*     : never
*   : never
* )} InternalParent
*   Collect nodes that can be parents of `Child`.
* @template {UnistNode} Node
*   All node types in a tree.
* @template {UnistNode} Child
*   Node to search for.
*/
/**
* @typedef {InternalParent<InclusiveDescendant<Tree>, Child>} Parent
*   Collect nodes in `Tree` that can be parents of `Child`.
* @template {UnistNode} Tree
*   All node types in a tree.
* @template {UnistNode} Child
*   Node to search for.
*/
/**
* @callback Visitor
*   Handle a node (matching `test`, if given) before its children.
*
*   Like `Visitor` in `unist-util-visit-parents`,
*   but with `index` and `parent` instead of `parents`.
* @param {Visited} node
*   Found node.
* @param {Visited extends UnistNode ? number | undefined : never} index
*   Index of `node` in `parent`,
*   or `undefined` for the tree itself.
* @param {Ancestor extends UnistParent ? Ancestor | undefined : never} parent
*   Parent of `node`,
*   or `undefined` for the tree itself.
* @returns {VisitorResult}
*   What to do next.
* @template {UnistNode} [Visited=UnistNode]
*   Visited node type.
* @template {UnistParent} [Ancestor=UnistParent]
*   Ancestor type.
*/
/**
* @callback VisitorExit
*   Handle a node (matching `test`, if given) after its children.
*
*   Like `VisitorExit` in `unist-util-visit-parents`,
*   but with `index` and `parent` instead of `parents`.
* @param {Visited} node
*   Found node.
* @param {Visited extends UnistNode ? number | undefined : never} index
*   Index of `node` in `parent`,
*   or `undefined` for the tree itself.
* @param {Ancestor extends UnistParent ? Ancestor | undefined : never} parent
*   Parent of `node`,
*   or `undefined` for the tree itself.
* @returns {VisitorResultExit}
*   What to do next.
* @template {UnistNode} [Visited=UnistNode]
*   Visited node type.
* @template {UnistParent} [Ancestor=UnistParent]
*   Ancestor type.
*/
/**
* @template {UnistNode} [Visited=UnistNode]
*   Visited node type.
* @template {UnistParent} [Ancestor=UnistParent]
*   Ancestor type.
* @typedef Visitors
*   Handle nodes when entering and exiting them.
*
*   Like `Visitors` in `unist-util-visit-parents`.
* @property {Visitor<Visited, Ancestor> | null | undefined} [enter]
*   Handle a node before its children (optional).
* @property {VisitorExit<Visited, Ancestor>} exit
*   Handle a node after its children.
*/
/**
* @typedef {Visitor<Visited, Parent<Ancestor, Visited>>} BuildVisitorFromMatch
*   Build a typed `Visitor` function from a node and all possible parents.
*
*   It will infer which values are passed as `node` and which as `parent`.
* @template {UnistNode} Visited
*   Node type.
* @template {UnistParent} Ancestor
*   Parent type.
*/
/**
* @typedef {(
*   BuildVisitorFromMatch<
*     Matches<Descendant, Check>,
*     Extract<Descendant, UnistParent>
*   >
* )} BuildVisitorFromDescendants
*   Build a typed `Visitor` function from a list of descendants and a test.
*
*   It will infer which values are passed as `node` and which as `parent`.
* @template {UnistNode} Descendant
*   Node type.
* @template {Test} Check
*   Test type.
*/
/**
* @typedef {(
*   BuildVisitorFromDescendants<
*     InclusiveDescendant<Tree>,
*     Check
*   >
* )} BuildVisitor
*   Build a typed `Visitor` function from a tree and a test.
*
*   It will infer which values are passed as `node` and which as `parent`.
* @template {UnistNode} [Tree=UnistNode]
*   Node type.
* @template {Test} [Check=Test]
*   Test type.
*/
/**
* @typedef {(
*   Visitors<
*     Matches<InclusiveDescendant<Tree>, Check>,
*     Parent<
*       Extract<InclusiveDescendant<Tree>, UnistParent>,
*       Matches<InclusiveDescendant<Tree>, Check>
*     >
*   >
* )} BuildVisitors
*   Build typed `Visitors` from a tree and a test.
*
*   It will infer which values are passed as `node` and which as `parent`.
* @template {UnistNode} [Tree=UnistNode]
*   Node type.
* @template {Test} [Check=Test]
*   Test type.
*/
/**
* Visit nodes.
*
* This algorithm performs *depth-first* *tree traversal* in *preorder*
* (**NLR**) or if `reverse` is given,
* in *reverse preorder* (**NRL**).
* An `exit` visitor is called in *postorder* (**LRN**)
* or if `reverse` is given, in *reverse postorder* (**RLN**).
*
* You can choose which nodes are visited by passing a `test`.
* For complex tests, you should test yourself in a visitor, as it will be
* faster and will have improved type information.
*
* Walking the tree is an intensive task.
* Make use of the return values of the visitor when possible.
* Instead of walking a tree multiple times, walk it once, use `unist-util-is`
* to check if a node matches, and then perform different operations.
*
* You can change the tree.
* Changes inside a node made when entering it are walked,
* changes made when exiting it are not.
* See `Visitor` and `VisitorExit` for more info.
*
* @overload
* @param {Tree} tree
*   Tree to traverse.
* @param {Check} check
*   `unist-util-is`-compatible test.
* @param {BuildVisitor<Tree, Check> | BuildVisitors<Tree, Check>} visitors
*   Handle each node when entering it,
*   or `{enter, exit}` to also handle it when exiting it.
* @param {boolean | null | undefined} [reverse]
*   Walk children from last to first;
*   for `enter`, reverse preorder (NRL) instead of preorder (NLR);
*   for `exit`, reverse postorder (RLN) instead of postorder (LRN).
* @returns {undefined}
*   Nothing.
*
* @overload
* @param {Tree} tree
*   Tree to traverse.
* @param {BuildVisitor<Tree> | BuildVisitors<Tree>} visitors
*   Handle each node when entering it,
*   or `{enter, exit}` to also handle it when exiting it.
* @param {boolean | null | undefined} [reverse]
*   Walk children from last to first;
*   for `enter`, reverse preorder (NRL) instead of preorder (NLR);
*   for `exit`, reverse postorder (RLN) instead of postorder (LRN).
* @returns {undefined}
*   Nothing.
*
* @param {UnistNode} tree
*   Tree to traverse.
* @param {Visitor | Visitors | Test} testOrEnterOrVisitors
*   `unist-util-is`-compatible test, `enter`, or `visitors`.
* @param {Visitor | Visitors | boolean | null | undefined} [enterOrVisitorsOrReverse]
*   `enter`, `visitors`, or `reverse` after a test.
* @param {boolean | null | undefined} [maybeReverse]
*   Walk children from last to first;
*   for `enter`, reverse preorder (NRL) instead of preorder (NLR);
*   for `exit`, reverse postorder (RLN) instead of postorder (LRN).
* @returns {undefined}
*   Nothing.
*
* @template {UnistNode} Tree
*   Node type.
* @template {Test} Check
*   `unist-util-is`-compatible test.
*/
function visit(tree, testOrEnterOrVisitors, enterOrVisitorsOrReverse, maybeReverse) {
	/** @type {Test} */
	let check;
	/** @type {Visitor | Visitors} */
	let visitors;
	/** @type {boolean | null | undefined} */
	let reverse;
	if (typeof enterOrVisitorsOrReverse === "function" || enterOrVisitorsOrReverse && typeof enterOrVisitorsOrReverse === "object") {
		check = testOrEnterOrVisitors;
		visitors = enterOrVisitorsOrReverse;
		reverse = maybeReverse;
	} else {
		visitors = testOrEnterOrVisitors;
		reverse = enterOrVisitorsOrReverse;
	}
	if (typeof visitors === "function") visitParents(tree, check, wrap(visitors), reverse);
	else visitParents(tree, check, wrapVisitors(visitors), reverse);
}
/**
* Turn `visit` visitors into `visitParents` visitors.
*
* @param {Visitors} visitors
*   Visitors for `visit`.
* @returns {ParentsVisitors}
*   Visitors for `visitParents`.
*/
function wrapVisitors(visitors) {
	if (!visitors || typeof visitors !== "object") return visitors;
	return {
		enter: typeof visitors.enter === "function" ? wrap(visitors.enter) : visitors.enter,
		exit: typeof visitors.exit === "function" ? wrap(visitors.exit) : visitors.exit
	};
}
/**
* Turn a `visit` visitor into a `visitParents` one.
*
* @template {VisitorResult} Result
*   Result type.
* @param {(node: UnistNode, index: number | undefined, parent: UnistParent | undefined) => Result} visitor
*   Visitor for `visit`.
* @returns {(node: UnistNode, parents: Array<UnistParent>, index: number | undefined) => Result}
*   Visitor for `visitParents`.
*/
function wrap(visitor) {
	return overload;
	/**
	* Call `visitor` with `index` and `parent` instead of `parents`.
	*
	* @param {UnistNode} node
	*   Visited node.
	* @param {Array<UnistParent>} parents
	*   Ancestors of `node`.
	* @param {number | undefined} index
	*   Index of `node` in its parent.
	* @returns {Result}
	*   What to do next.
	*/
	function overload(node, parents, index) {
		return visitor(node, index, parents[parents.length - 1]);
	}
}
//#endregion
//#region node_modules/mdast-util-to-string/lib/index.js
/**
* @typedef {import('mdast').Nodes} Nodes
*
* @typedef Options
*   Configuration (optional).
* @property {boolean | null | undefined} [includeImageAlt=true]
*   Whether to use `alt` for `image`s (default: `true`).
* @property {boolean | null | undefined} [includeHtml=true]
*   Whether to use `value` of HTML (default: `true`).
*/
/** @type {Options} */
var emptyOptions = {};
/**
* Get the text content of a node or list of nodes.
*
* Prefers the node’s plain-text fields, otherwise serializes its children,
* and if the given value is an array, serialize the nodes in it.
*
* @param {unknown} [value]
*   Thing to serialize, typically `Node`.
* @param {Options | null | undefined} [options]
*   Configuration (optional).
* @returns {string}
*   Serialized `value`.
*/
function toString(value, options) {
	const settings = options || emptyOptions;
	return one(value, typeof settings.includeImageAlt === "boolean" ? settings.includeImageAlt : true, typeof settings.includeHtml === "boolean" ? settings.includeHtml : true);
}
/**
* One node or several nodes.
*
* @param {unknown} value
*   Thing to serialize.
* @param {boolean} includeImageAlt
*   Include image `alt`s.
* @param {boolean} includeHtml
*   Include HTML.
* @returns {string}
*   Serialized node.
*/
function one(value, includeImageAlt, includeHtml) {
	if (node(value)) {
		if ("value" in value) return value.type === "html" && !includeHtml ? "" : value.value;
		if (includeImageAlt && "alt" in value && value.alt) return value.alt;
		if ("children" in value) return all(value.children, includeImageAlt, includeHtml);
	}
	if (Array.isArray(value)) return all(value, includeImageAlt, includeHtml);
	return "";
}
/**
* Serialize a list of nodes.
*
* @param {Array<unknown>} values
*   Thing to serialize.
* @param {boolean} includeImageAlt
*   Include image `alt`s.
* @param {boolean} includeHtml
*   Include HTML.
* @returns {string}
*   Serialized nodes.
*/
function all(values, includeImageAlt, includeHtml) {
	/** @type {Array<string>} */
	const result = [];
	let index = -1;
	while (++index < values.length) result[index] = one(values[index], includeImageAlt, includeHtml);
	return result.join("");
}
/**
* Check if `value` looks like a node.
*
* @param {unknown} value
*   Thing.
* @returns {value is Nodes}
*   Whether `value` is a node.
*/
function node(value) {
	return Boolean(value && typeof value === "object");
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/util/format-heading-as-setext.js
/**
* @import {State} from 'mdast-util-to-markdown'
* @import {Heading} from 'mdast'
*/
/**
* Checks if a heading can be formatted as a setext heading.
*
* @param {Heading} node
*   Node to check.
* @param {State} state
*   Info passed around.
* @returns {boolean}
*   Whether the heading can be formatted as a setext heading.
*/
function formatHeadingAsSetext(node, state) {
	let literalWithBreak = false;
	visit(node, function(node) {
		if ("value" in node && /\r?\n|\r/.test(node.value) || node.type === "break") {
			literalWithBreak = true;
			return false;
		}
	});
	return Boolean((!node.depth || node.depth < 3) && toString(node) && (state.options.setext || literalWithBreak));
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/handle/heading.js
/**
* @import {Info, State} from 'mdast-util-to-markdown'
* @import {Heading, Parents} from 'mdast'
*/
/**
* Serialize a heading node.
*
* @param {Heading} node
*   Node to serialize.
* @param {Parents | undefined} _
*   Parent node.
* @param {State} state
*   Info passed around.
* @param {Info} info
*   Info on surrounding context.
* @returns {string}
*   Serialized markdown.
*/
function heading(node, _, state, info) {
	const rank = Math.max(Math.min(6, node.depth || 1), 1);
	const tracker = state.createTracker(info);
	if (formatHeadingAsSetext(node, state)) {
		const exit = state.enter("headingSetext");
		const subexit = state.enter("phrasing");
		const value = state.containerPhrasing(node, {
			...tracker.current(),
			before: "\n",
			after: "\n"
		});
		subexit();
		exit();
		return value + "\n" + (rank === 1 ? "=" : "-").repeat(value.length - (Math.max(value.lastIndexOf("\r"), value.lastIndexOf("\n")) + 1));
	}
	const sequence = "#".repeat(rank);
	const exit = state.enter("headingAtx");
	const subexit = state.enter("phrasing");
	tracker.move(sequence + " ");
	let value = state.containerPhrasing(node, {
		before: "# ",
		after: "\n",
		...tracker.current()
	});
	const head = value.charCodeAt(0);
	if (head === 9 || head === 32) value = encodeCharacterReference(head) + value.slice(1);
	value = value ? sequence + " " + value : sequence;
	if (state.options.closeAtx) value += " " + sequence;
	subexit();
	exit();
	return value;
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/handle/html.js
/**
* @import {Html} from 'mdast'
*/
html.peek = htmlPeek;
/**
* Serialize an HTML node.
*
* @param {Html} node
*   Node to serialize.
* @returns {string}
*   Serialized markdown.
*/
function html(node) {
	return node.value || "";
}
/**
* Peek at this node.
*
* @returns {string}
*   Start of the serialized markdown.
*/
function htmlPeek() {
	return "<";
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/handle/image.js
/**
* @import {Info, State} from 'mdast-util-to-markdown'
* @import {Image, Parents} from 'mdast'
*/
image.peek = imagePeek;
/**
* Serialize an image node.
*
* @param {Image} node
*   Node to serialize.
* @param {Parents | undefined} _
*   Parent node.
* @param {State} state
*   Info passed around.
* @param {Info} info
*   Info on surrounding context.
* @returns {string}
*   Serialized markdown.
*/
function image(node, _, state, info) {
	const quote = checkQuote(state);
	const suffix = quote === "\"" ? "Quote" : "Apostrophe";
	const exit = state.enter("image");
	let subexit = state.enter("label");
	const tracker = state.createTracker(info);
	let value = tracker.move("![");
	value += tracker.move(state.safe(node.alt, {
		before: value,
		after: "]",
		...tracker.current()
	}));
	value += tracker.move("](");
	subexit();
	if (!node.url && node.title || /[\0- \u007F]/.test(node.url)) {
		subexit = state.enter("destinationLiteral");
		value += tracker.move("<");
		value += tracker.move(state.safe(node.url, {
			before: value,
			after: ">",
			...tracker.current()
		}));
		value += tracker.move(">");
	} else {
		subexit = state.enter("destinationRaw");
		value += tracker.move(state.safe(node.url, {
			before: value,
			after: node.title ? " " : ")",
			...tracker.current()
		}));
	}
	subexit();
	if (node.title) {
		subexit = state.enter(`title${suffix}`);
		value += tracker.move(" " + quote);
		value += tracker.move(state.safe(node.title, {
			before: value,
			after: quote,
			...tracker.current()
		}));
		value += tracker.move(quote);
		subexit();
	}
	value += tracker.move(")");
	exit();
	return value;
}
/**
* Peek at this node.
*
* @returns {string}
*   Start of the serialized markdown.
*/
function imagePeek() {
	return "!";
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/handle/image-reference.js
/**
* @import {Info, State} from 'mdast-util-to-markdown'
* @import {ImageReference, Parents} from 'mdast'
*/
imageReference.peek = imageReferencePeek;
/**
* Serialize an image reference node.
*
* @param {ImageReference} node
*   Node to serialize.
* @param {Parents | undefined} _
*   Parent node.
* @param {State} state
*   Info passed around.
* @param {Info} info
*   Info on surrounding context.
* @returns {string}
*   Serialized markdown.
*/
function imageReference(node, _, state, info) {
	const type = node.referenceType;
	const exit = state.enter("imageReference");
	let subexit = state.enter("label");
	const tracker = state.createTracker(info);
	let value = tracker.move("![");
	const alt = state.safe(node.alt, {
		before: value,
		after: "]",
		...tracker.current()
	});
	value += tracker.move(alt + "][");
	subexit();
	const stack = state.stack;
	state.stack = stack.filter(function(d) {
		return d !== "phrasing";
	});
	subexit = state.enter("reference");
	const reference = state.safe(state.associationId(node), {
		before: value,
		after: "]",
		...tracker.current()
	});
	subexit();
	state.stack = stack;
	exit();
	if (type === "full" || !alt || alt !== reference) value += tracker.move(reference + "]");
	else if (type === "shortcut") value = value.slice(0, -1);
	else value += tracker.move("]");
	return value;
}
/**
* Peek at this node.
*
* @returns {string}
*   Start of the serialized markdown.
*/
function imageReferencePeek() {
	return "!";
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/handle/inline-code.js
/**
* @import {State} from 'mdast-util-to-markdown'
* @import {InlineCode, Parents} from 'mdast'
*/
inlineCode.peek = inlineCodePeek;
/**
* Serialize an inline code node.
*
* @param {InlineCode} node
*   Node to serialize.
* @param {Parents | undefined} _
*   Parent node.
* @param {State} state
*   Info passed around.
* @returns {string}
*   Serialized markdown.
*/
function inlineCode(node, _, state) {
	let value = node.value || "";
	let sequence = "`";
	let index = -1;
	while (new RegExp("(^|[^`])" + sequence + "([^`]|$)").test(value)) sequence += "`";
	if (/[^\n\r ]/.test(value) && (/^[\n\r ]/.test(value) && /[\n\r ]$/.test(value) || /^`|`$/.test(value))) value = " " + value + " ";
	while (++index < state.unsafe.length) {
		const pattern = state.unsafe[index];
		const expression = state.compilePattern(pattern);
		if (!pattern.atBreak) continue;
		/** @type {RegExpExecArray | null} */
		let match;
		while (match = expression.exec(value)) {
			let position = match.index;
			if (value.charCodeAt(position) === 10 && value.charCodeAt(position - 1) === 13) position--;
			value = value.slice(0, position) + " " + value.slice(match.index + 1);
		}
	}
	return sequence + value + sequence;
}
/**
* Peek at this node.
*
* @returns {string}
*   Start of the serialized markdown.
*/
function inlineCodePeek() {
	return "`";
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/util/format-link-as-autolink.js
/**
* @import {State} from 'mdast-util-to-markdown'
* @import {Link} from 'mdast'
*/
/**
* Checks if a link can be formatted as an autolink.
*
* @param {Link} node
*   Node to check.
* @param {State} state
*   Info passed around.
* @returns {boolean}
*   Whether the link can be formatted as an autolink.
*/
function formatLinkAsAutolink(node, state) {
	const raw = toString(node);
	return Boolean(!state.options.resourceLink && node.url && !node.title && node.children && node.children.length === 1 && node.children[0].type === "text" && (raw === node.url || "mailto:" + raw === node.url) && /^[a-z][+\-.a-z]+:/i.test(node.url) && !/[\0- <>\u007F]/.test(node.url));
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/handle/link.js
/**
* @import {Info, State} from 'mdast-util-to-markdown'
* @import {Link, Parents} from 'mdast'
* @import {Exit} from '../types.js'
*/
link.peek = linkPeek;
/**
* Serialize a link node.
*
* @param {Link} node
*   Node to serialize.
* @param {Parents | undefined} _
*   Parent node.
* @param {State} state
*   Info passed around.
* @param {Info} info
*   Info on surrounding context.
* @returns {string}
*   Serialized markdown.
*/
function link(node, _, state, info) {
	const quote = checkQuote(state);
	const suffix = quote === "\"" ? "Quote" : "Apostrophe";
	const tracker = state.createTracker(info);
	if (formatLinkAsAutolink(node, state)) {
		const stack = state.stack;
		state.stack = stack.filter(function(d) {
			return d !== "phrasing";
		});
		const exit = state.enter("autolink");
		let value = tracker.move("<");
		value += tracker.move(state.containerPhrasing(node, {
			before: value,
			after: ">",
			...tracker.current()
		}));
		value += tracker.move(">");
		exit();
		state.stack = stack;
		return value;
	}
	const exit = state.enter("link");
	let subexit = state.enter("label");
	let value = tracker.move("[");
	const text = state.containerPhrasing(node, {
		before: value,
		after: "](",
		...tracker.current()
	});
	value += tracker.move(text);
	subexit();
	value += tracker.move("](");
	const enclose = /[\0- \u007F]/.test(node.url);
	const last = info.before.charAt(info.before.length - 1);
	let title = node.title || void 0;
	if (!title && !enclose && (last === "\n" || last === "\r")) {
		let index = 0;
		while (index < text.length && text.charCodeAt(index) !== 93) index += text.charCodeAt(index) === 92 ? 2 : 1;
		if (text.charCodeAt(index + 1) === 58) title = "";
	}
	if (!node.url && typeof title === "string" || enclose) {
		subexit = state.enter("destinationLiteral");
		value += tracker.move("<");
		value += tracker.move(state.safe(node.url, {
			before: value,
			after: ">",
			...tracker.current()
		}));
		value += tracker.move(">");
	} else {
		subexit = state.enter("destinationRaw");
		value += tracker.move(state.safe(node.url, {
			before: value,
			after: typeof title === "string" ? " " : ")",
			...tracker.current()
		}));
	}
	subexit();
	if (typeof title === "string") {
		subexit = state.enter(`title${suffix}`);
		value += tracker.move(" " + quote);
		value += tracker.move(state.safe(title, {
			before: value,
			after: quote,
			...tracker.current()
		}));
		value += tracker.move(quote);
		subexit();
	}
	value += tracker.move(")");
	exit();
	return value;
}
/**
* Peek at this node.
*
* @param {Link} node
*   Node to peek at.
* @param {Parents | undefined} _
*   Parent node.
* @param {State} state
*   Info passed around.
* @returns {string}
*   Start of the serialized markdown.
*/
function linkPeek(node, _, state) {
	return formatLinkAsAutolink(node, state) ? "<" : "[";
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/handle/link-reference.js
/**
* @import {Info, State} from 'mdast-util-to-markdown'
* @import {LinkReference, Parents} from 'mdast'
*/
linkReference.peek = linkReferencePeek;
/**
* Serialize a link reference node.
*
* @param {LinkReference} node
*   Node to serialize.
* @param {Parents | undefined} _
*   Parent node.
* @param {State} state
*   Info passed around.
* @param {Info} info
*   Info on surrounding context.
* @returns {string}
*   Serialized markdown.
*/
function linkReference(node, _, state, info) {
	const type = node.referenceType;
	const exit = state.enter("linkReference");
	let subexit = state.enter("label");
	const tracker = state.createTracker(info);
	let value = tracker.move("[");
	const text = state.containerPhrasing(node, {
		before: value,
		after: "]",
		...tracker.current()
	});
	value += tracker.move(text + "][");
	subexit();
	const stack = state.stack;
	state.stack = stack.filter(function(d) {
		return d !== "phrasing";
	});
	subexit = state.enter("reference");
	const reference = state.safe(state.associationId(node), {
		before: value,
		after: "]",
		...tracker.current()
	});
	subexit();
	state.stack = stack;
	exit();
	if (type === "full" || !text || text !== reference) value += tracker.move(reference + "]");
	else if (type === "shortcut") value = value.slice(0, -1);
	else value += tracker.move("]");
	return value;
}
/**
* Peek at this node.
*
* @returns {string}
*   Start of the serialized markdown.
*/
function linkReferencePeek() {
	return "[";
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/util/check-bullet.js
/**
* @import {Options, State} from 'mdast-util-to-markdown'
*/
/**
* Checks the preferred list bullet option.
*
* @param {State} state
*   Info passed around.
* @returns {Exclude<Options['bullet'], null | undefined>}
*   Preferred list bullet.
*/
function checkBullet(state) {
	const marker = state.options.bullet || "*";
	if (marker !== "*" && marker !== "+" && marker !== "-") throw new Error("Cannot serialize items with `" + marker + "` for `options.bullet`, expected `*`, `+`, or `-`");
	return marker;
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/util/check-bullet-other.js
/**
* @import {Options, State} from 'mdast-util-to-markdown'
*/
/**
* Checks the preferred alternate list bullet option.
*
* @param {State} state
*   Info passed around.
* @returns {Exclude<Options['bullet'], null | undefined>}
*   Preferred alternate list bullet.
*/
function checkBulletOther(state) {
	const bullet = checkBullet(state);
	const bulletOther = state.options.bulletOther;
	if (!bulletOther) return bullet === "*" ? "-" : "*";
	if (bulletOther !== "*" && bulletOther !== "+" && bulletOther !== "-") throw new Error("Cannot serialize items with `" + bulletOther + "` for `options.bulletOther`, expected `*`, `+`, or `-`");
	if (bulletOther === bullet) throw new Error("Expected `bullet` (`" + bullet + "`) and `bulletOther` (`" + bulletOther + "`) to be different");
	return bulletOther;
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/util/check-bullet-ordered.js
/**
* @import {Options, State} from 'mdast-util-to-markdown'
*/
/**
* Checks the preferred ordered list bullet option.
*
* @param {State} state
*   Info passed around.
* @returns {Exclude<Options['bulletOrdered'], null | undefined>}
*   Preferred ordered list bullet.
*/
function checkBulletOrdered(state) {
	const marker = state.options.bulletOrdered || ".";
	if (marker !== "." && marker !== ")") throw new Error("Cannot serialize items with `" + marker + "` for `options.bulletOrdered`, expected `.` or `)`");
	return marker;
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/util/check-rule.js
/**
* @import {Options, State} from 'mdast-util-to-markdown'
*/
/**
* Checks the preferred rule option.
*
* @param {State} state
*   Info passed around.
* @returns {Exclude<Options['rule'], null | undefined>}
*   Preferred rule marker.
*/
function checkRule(state) {
	const marker = state.options.rule || "*";
	if (marker !== "*" && marker !== "-" && marker !== "_") throw new Error("Cannot serialize rules with `" + marker + "` for `options.rule`, expected `*`, `-`, or `_`");
	return marker;
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/handle/list.js
/**
* @import {Info, State} from 'mdast-util-to-markdown'
* @import {List, Parents} from 'mdast'
*/
/**
* Serialize a list node.
*
* @param {List} node
*   Node to serialize.
* @param {Parents | undefined} parent
*   Parent node.
* @param {State} state
*   Info passed around.
* @param {Info} info
*   Info on surrounding context.
* @returns {string}
*   Serialized markdown.
*/
function list(node, parent, state, info) {
	const exit = state.enter("list");
	const bulletCurrent = state.bulletCurrent;
	/** @type {string} */
	let bullet = node.ordered ? checkBulletOrdered(state) : checkBullet(state);
	/** @type {string} */
	const bulletOther = node.ordered ? bullet === "." ? ")" : "." : checkBulletOther(state);
	let useDifferentMarker = parent && state.bulletLastUsed ? bullet === state.bulletLastUsed : false;
	if (!node.ordered) {
		const firstListItem = node.children ? node.children[0] : void 0;
		if ((bullet === "*" || bullet === "-") && firstListItem && (!firstListItem.children || !firstListItem.children[0]) && state.stack[state.stack.length - 1] === "list" && state.stack[state.stack.length - 2] === "listItem" && state.stack[state.stack.length - 3] === "list" && state.stack[state.stack.length - 4] === "listItem" && state.indexStack[state.indexStack.length - 1] === 0 && state.indexStack[state.indexStack.length - 2] === 0 && state.indexStack[state.indexStack.length - 3] === 0) useDifferentMarker = true;
		if (checkRule(state) === bullet && firstListItem) {
			let index = -1;
			while (++index < node.children.length) {
				const item = node.children[index];
				if (item && item.type === "listItem" && item.children && item.children[0] && item.children[0].type === "thematicBreak") {
					useDifferentMarker = true;
					break;
				}
			}
		}
	}
	if (useDifferentMarker) bullet = bulletOther;
	state.bulletCurrent = bullet;
	const value = state.containerFlow(node, info);
	state.bulletLastUsed = bullet;
	state.bulletCurrent = bulletCurrent;
	exit();
	return value;
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/util/check-list-item-indent.js
/**
* @import {Options, State} from 'mdast-util-to-markdown'
*/
/**
* Checks the preferred list item indent option.
*
* @param {State} state
*   Info passed around.
* @returns {Exclude<Options['listItemIndent'], null | undefined>}
*   Preferred list item indent.
*/
function checkListItemIndent(state) {
	const style = state.options.listItemIndent || "one";
	if (style !== "tab" && style !== "one" && style !== "mixed") throw new Error("Cannot serialize items with `" + style + "` for `options.listItemIndent`, expected `tab`, `one`, or `mixed`");
	return style;
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/handle/list-item.js
/**
* @import {Info, Map, State} from 'mdast-util-to-markdown'
* @import {ListItem, Parents} from 'mdast'
*/
/**
* Serialize a list item node.
*
* @param {ListItem} node
*   Node to serialize.
* @param {Parents | undefined} parent
*   Parent node.
* @param {State} state
*   Info passed around.
* @param {Info} info
*   Info on surrounding context.
* @returns {string}
*   Serialized markdown.
*/
function listItem(node, parent, state, info) {
	const listItemIndent = checkListItemIndent(state);
	let bullet = state.bulletCurrent || checkBullet(state);
	if (parent && parent.type === "list" && parent.ordered) bullet = (typeof parent.start === "number" && parent.start > -1 ? parent.start : 1) + (state.options.incrementListMarker === false ? 0 : parent.children.indexOf(node)) + bullet;
	let size = bullet.length + 1;
	if (listItemIndent === "tab" || listItemIndent === "mixed" && (parent && parent.type === "list" && parent.spread || node.spread)) size = Math.ceil(size / 4) * 4;
	const tracker = state.createTracker(info);
	tracker.move(bullet + " ".repeat(size - bullet.length));
	tracker.shift(size);
	const exit = state.enter("listItem");
	const value = state.indentLines(state.containerFlow(node, tracker.current()), map);
	exit();
	return value;
	/**
	* Indent lines of the list item.
	*
	* @type {Map}
	*/
	function map(line, index, blank) {
		if (index) return (blank ? "" : " ".repeat(size)) + line;
		return (blank ? bullet : bullet + " ".repeat(size - bullet.length)) + line;
	}
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/handle/paragraph.js
/**
* @import {Info, State} from 'mdast-util-to-markdown'
* @import {Paragraph, Parents} from 'mdast'
*/
/**
* Serialize a paragraph node.
*
* @param {Paragraph} node
*   Node to serialize.
* @param {Parents | undefined} _
*   Parent node.
* @param {State} state
*   Info passed around.
* @param {Info} info
*   Info on surrounding context.
* @returns {string}
*   Serialized markdown.
*/
function paragraph(node, _, state, info) {
	const exit = state.enter("paragraph");
	const subexit = state.enter("phrasing");
	const value = state.containerPhrasing(node, info);
	subexit();
	exit();
	return value;
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/handle/root.js
/**
* @import {Info, State} from 'mdast-util-to-markdown'
* @import {Parents, Root} from 'mdast'
*/
/**
* Serialize a root node.
*
* @param {Root} node
*   Node to serialize.
* @param {Parents | undefined} _
*   Parent node.
* @param {State} state
*   Info passed around.
* @param {Info} info
*   Info on surrounding context.
* @returns {string}
*   Serialized markdown.
*/
function root(node, _, state, info) {
	if (!node.children.some(function(d) {
		return phrasing$2(d);
	})) return state.containerFlow(node, info);
	const exit = state.enter("phrasing");
	const value = state.containerPhrasing(node, info);
	exit();
	return value;
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/util/check-strong.js
/**
* @import {Options, State} from 'mdast-util-to-markdown'
*/
/**
* Checks the preferred strong option.
*
* @param {State} state
*   Info passed around.
* @returns {Exclude<Options['strong'], null | undefined>}
*   Preferred strong marker.
*/
function checkStrong(state) {
	const marker = state.options.strong || "*";
	if (marker !== "*" && marker !== "_") throw new Error("Cannot serialize strong with `" + marker + "` for `options.strong`, expected `*`, or `_`");
	return marker;
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/handle/strong.js
/**
* @import {AttentionInfo, Info, State} from 'mdast-util-to-markdown'
* @import {Parents, Strong} from 'mdast'
*/
strong.attention = attention;
strong.peek = peek;
/**
* Serialize a strong node.
*
* Attention is properly handled by `containerPhrasing`.
*
* @param {Strong} node
*   Node to serialize.
* @param {Parents | undefined} _
*   Parent node.
* @param {State} state
*   Info passed around.
* @param {Info} info
*   Info on surrounding context.
* @returns {string}
*   Serialized markdown.
*/
function strong(node, _, state, info) {
	const exit = state.enter("phrasing");
	const value = serialize$1([attentionItem(node, attention, state, state.createTracker(info))], info.before, info.after);
	exit();
	return value;
}
/**
* Serialize a strong node as attention.
*
* @param {Strong} _
*   Node to serialize.
* @param {State} state
*   Info passed around.
* @returns {AttentionInfo}
*   Info on how to serialize the node.
*/
function attention(_, state) {
	return {
		construct: "strong",
		markers: checkStrong(state) === "*" ? ["*", "_"] : ["_", "*"],
		sizes: [2]
	};
}
/**
* Peek at this node.
*
* @param {Strong} _
*   Node to serialize.
* @param {Parents | undefined} _1
*   Parent node.
* @param {State} state
*   Info passed around.
* @returns {string}
*   Start of the serialized markdown.
*/
function peek(_, _1, state) {
	return state.options.strong || "*";
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/handle/text.js
/**
* @import {Info, State} from 'mdast-util-to-markdown'
* @import {Parents, Text} from 'mdast'
*/
/**
* Serialize a text node.
*
* @param {Text} node
*   Node to serialize.
* @param {Parents | undefined} parent
*   Parent node.
* @param {State} state
*   Info passed around.
* @param {Info} info
*   Info on surrounding context.
* @returns {string}
*   Serialized markdown.
*/
function text(node, parent, state, info) {
	/* c8 ignore next -- parent always passed */
	const siblings = parent ? parent.children : [];
	const index = state.indexStack[state.indexStack.length - 1];
	return state.safe(node.value, {
		...info,
		afterNode: siblings[index + 1],
		beforeNode: siblings[index - 1]
	});
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/util/check-rule-repetition.js
/**
* @import {Options, State} from 'mdast-util-to-markdown'
*/
/**
* Checks the preferred rule repetition option.
*
* @param {State} state
*   Info passed around.
* @returns {Exclude<Options['ruleRepetition'], null | undefined>}
*   Preferred rule repetition.
*/
function checkRuleRepetition(state) {
	const repetition = state.options.ruleRepetition || 3;
	if (repetition < 3) throw new Error("Cannot serialize rules with repetition `" + repetition + "` for `options.ruleRepetition`, expected `3` or more");
	return repetition;
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/handle/thematic-break.js
/**
* @import {State} from 'mdast-util-to-markdown'
* @import {Parents, ThematicBreak} from 'mdast'
*/
/**
* Serialize a thematic break node.
*
* @param {ThematicBreak} _
*   Node to serialize.
* @param {Parents | undefined} _1
*   Parent node.
* @param {State} state
*   Info passed around.
* @returns {string}
*   Serialized markdown.
*/
function thematicBreak(_, _1, state) {
	const value = (checkRule(state) + (state.options.ruleSpaces ? " " : "")).repeat(checkRuleRepetition(state));
	return state.options.ruleSpaces ? value.slice(0, -1) : value;
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/handle/index.js
/**
* Default (CommonMark) handlers.
*/
var handle = {
	blockquote,
	break: hardBreak,
	code,
	definition,
	emphasis,
	hardBreak,
	heading,
	html,
	image,
	imageReference,
	inlineCode,
	link,
	linkReference,
	list,
	listItem,
	paragraph,
	root,
	strong,
	text,
	thematicBreak
};
//#endregion
//#region node_modules/mdast-util-to-markdown-cjk-friendly/dist/phrasing-D74LUlZv.mjs
function firstCharacter(value) {
	return value[Symbol.iterator]().next().value ?? "";
}
function lastCharacter(value, end = value.length) {
	if (end === 0) return "";
	const lastCodeUnit = value.charCodeAt(end - 1);
	if (lastCodeUnit < 56320 || lastCodeUnit >= 57344 || end === 1 || (value.codePointAt(end - 2) ?? 0) < 65536) return value[end - 1];
	return value.slice(end - 2, end);
}
function classifyBefore(value) {
	const character = lastCharacter(value);
	const current = character.codePointAt(0) ?? null;
	const kind = classifyCharacter$1(current);
	return current !== null && isNonEmojiGeneralUseVS(kind) ? classifyPrecedingCharacter(kind, () => lastCharacter(value, value.length - character.length).codePointAt(0) ?? null, current) : kind;
}
function sides(before, after, marker) {
	const beforePunctuation = isNonCjkPunctuation(before);
	const afterPunctuation = isNonCjkPunctuation(after);
	const beforeSpaceOrPunctuation = beforePunctuation || isUnicodeWhitespace(before);
	const afterSpaceOrPunctuation = afterPunctuation || isUnicodeWhitespace(after);
	const open = !afterSpaceOrPunctuation || afterPunctuation && (beforeSpaceOrPunctuation || isCjkOrIvs(before));
	const close = !beforeSpaceOrPunctuation || beforePunctuation && (afterSpaceOrPunctuation || isCjk(after));
	return {
		open: marker === "_" ? open && (isSpaceOrPunctuation(before) || !close) : open,
		close: marker === "_" ? close && (isSpaceOrPunctuation(after) || !open) : close
	};
}
function attentionSides(before, after, marker, cjk) {
	if (cjk) return sides(classifyBefore(before), classifyCharacter$1(after.codePointAt(0) ?? null), marker);
	const previous = classifyCharacter(lastCharacter(before).codePointAt(0) ?? null);
	const next = classifyCharacter(after.codePointAt(0) ?? null);
	const open = !next || next === 2 && Boolean(previous);
	const close = !previous || previous === 2 && Boolean(next);
	return {
		open: marker === "_" ? open && (Boolean(previous) || !close) : open,
		close: marker === "_" ? close && (Boolean(next) || !open) : close
	};
}
function fallback(outside, inside, marker) {
	if (outside === void 0) return inside === void 0 ? {
		inside: marker === "_",
		outside: marker === "_"
	} : inside === 1 ? {
		inside: true,
		outside: true
	} : {
		inside: false,
		outside: true
	};
	if (outside === 1) return {
		inside: inside === 1,
		outside: inside === 1
	};
	return {
		inside: inside === 1,
		outside: false
	};
}
/** Choose boundary encodings without changing punctuation used by constructs. */
function encodeInfo(before, after, marker, opening, cjk) {
	const beforeKind = classifyBefore(before);
	const afterKind = classifyCharacter$1(after.codePointAt(0) ?? null);
	if (!cjk || !isCjkOrIvs(beforeKind) && !isCjkOrIvs(afterKind)) {
		const previous = cjk ? commonMarkKind(beforeKind) : classifyCharacter(lastCharacter(before).codePointAt(0) ?? null);
		const next = cjk ? commonMarkKind(afterKind) : classifyCharacter(after.codePointAt(0) ?? null);
		return opening ? fallback(previous, next, marker) : fallback(next, previous, marker);
	}
	for (const candidate of [
		{
			inside: false,
			outside: false
		},
		{
			inside: true,
			outside: false
		},
		{
			inside: false,
			outside: true
		},
		{
			inside: true,
			outside: true
		}
	]) {
		const encodedBefore = opening ? candidate.outside : candidate.inside;
		const encodedAfter = opening ? candidate.inside : candidate.outside;
		const forms = sides(encodedBefore ? classifyCharacter$1(";".codePointAt(0) ?? null) : beforeKind, encodedAfter ? classifyCharacter$1("&".codePointAt(0) ?? null) : afterKind, marker);
		if (opening ? forms.open : forms.close) return candidate;
	}
	return {
		inside: true,
		outside: true
	};
}
function commonMarkKind(kind) {
	return isUnicodeWhitespace(kind) ? 1 : isNonCjkPunctuation(kind) ? 2 : void 0;
}
/*!
* Phrasing algorithm adapted from mdast-util-to-markdown (commit 388140e).
* Copyright (c) Titus Wormer <tituswormer@gmail.com>
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in
* all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
*/
/** Mark an attention handler for CJK-aware encoding and pairing. */
function cjkFriendlyAttention(handle) {
	const attention = handle.attention;
	if (!attention) throw new Error("Expected a handler with the attention API");
	const result = (node, parent, state, info) => {
		install(state);
		return handle(node, parent, state, info);
	};
	result.peek = handle.peek;
	result.attention = (node, state) => ({
		...attention(node, state),
		cjkFriendly: true
	});
	return result;
}
function install(state) {
	state.containerPhrasing = (parent, info) => containerPhrasing(parent, state, info);
}
function withCjkPhrasing(handle) {
	return (node, parent, state, info) => {
		install(state);
		return handle(node, parent, state, info);
	};
}
/** Install the container before serializing a document or a phrasing block. */
var cjkFriendlyPhrasingHandlers = {
	root: withCjkPhrasing(handle.root),
	paragraph: withCjkPhrasing(handle.paragraph),
	heading: withCjkPhrasing(handle.heading)
};
function candidates(tokens, involved, runOf) {
	const related = /* @__PURE__ */ new Set();
	for (const token of tokens) {
		const siblings = runOf.get(token);
		if (siblings && token.attention && involved.some((d) => d.attention === token.attention)) for (const sibling of siblings.tokens) related.add(sibling.attention);
	}
	const ordered = [];
	for (const token of tokens) if (token.attention && related.delete(token.attention)) ordered.push(token.attention);
	return ordered.reverse();
}
function check(tokens, before, after) {
	const runs = [];
	const wrong = /* @__PURE__ */ new Map();
	const runOf = /* @__PURE__ */ new Map();
	let index = 0;
	while (index < tokens.length) {
		if (!tokens[index].attention) {
			index++;
			continue;
		}
		const marker = tokens[index].value.charAt(0);
		let end = index + 1;
		while (end < tokens.length && tokens[end].attention && tokens[end].value.charAt(0) === marker) end++;
		const group = tokens.slice(index, end);
		const { open, close } = attentionSides(index ? tokens[index - 1].value : before, end < tokens.length ? tokens[end].value : after, marker, group.some((token) => token.attention?.cjk));
		const run = {
			tokens: group,
			markers: [],
			start: 0,
			end: 0,
			open,
			close,
			split: marker === "*" || marker === "_"
		};
		for (const token of group) {
			wrong.set(token, [...group]);
			runOf.set(token, run);
			for (let size = token.value.length; size > 0; size--) run.markers.push(token);
		}
		run.end = run.markers.length;
		runs.push(run);
		index = end;
	}
	pair(runs, wrong);
	for (let index = 0; index < tokens.length; index++) {
		const involved = wrong.get(tokens[index]);
		if (involved) return {
			attention: candidates(tokens, involved, runOf),
			index
		};
	}
}
function pair(runs, wrong) {
	let index = 0;
	while (index < runs.length) {
		const closer = runs[index];
		const marker = closer.tokens[0].value.charAt(0);
		const closerSize = closer.end - closer.start;
		let open = closer.close && closerSize ? index : 0;
		while (open--) {
			const opener = runs[open];
			const openerSize = opener.end - opener.start;
			if (opener.tokens[0].value.charAt(0) === marker && opener.open && openerSize && (closer.split ? !((opener.close || closer.open) && closerSize % 3) || (openerSize + closerSize) % 3 : openerSize === opener.markers.length && openerSize === closerSize)) {
				const size = closer.split ? openerSize > 1 && closerSize > 1 ? 2 : 1 : closerSize;
				const opening = opener.markers.slice(opener.end - size, opener.end);
				const closing = closer.markers.slice(closer.start, closer.start + size);
				const openToken = opening[0];
				const closeToken = closing[0];
				if (openToken === opening[size - 1] && openToken.value.length === size && closeToken === closing[size - 1] && closeToken.value.length === size && openToken.attention === closeToken.attention) {
					wrong.delete(openToken);
					wrong.delete(closeToken);
				} else {
					const involved = [.../* @__PURE__ */ new Set([...opening, ...closing])];
					for (const token of involved) wrong.get(token)?.push(...involved);
				}
				opener.end -= size;
				closer.start += size;
				break;
			}
		}
		if (open === -1 || closer.start === closer.end) index++;
	}
}
function encode(tokens, start) {
	const token = tokens[start ? 0 : tokens.length - 1];
	if (!token || token.attention || !token.value) return;
	const character = start ? firstCharacter(token.value) : lastCharacter(token.value);
	const reference = `&#x${character.codePointAt(0)?.toString(16).toUpperCase()};`;
	if (start) token.value = reference + token.value.slice(character.length);
	else {
		let value = token.value.slice(0, -character.length);
		let escapes = 0;
		while (value.charCodeAt(value.length - 1 - escapes) === 92) escapes++;
		if (escapes % 2) value += "\\";
		token.value = value + reference;
	}
}
function attentionSequences(type, markers, sizes) {
	if (!markers.length || !sizes.length) throw new Error(`Cannot serialize ${type} as attention without markers and sizes`);
	for (const size of sizes) if (!Number.isSafeInteger(size) || size < 1) throw new Error(`Invalid attention size for ${type}: ${size}`);
	const sequences = [];
	for (const marker of markers) {
		if (marker.length !== 1 || !asciiPunctuation(marker.charCodeAt(0))) throw new Error(`Invalid attention marker for ${type}: ${marker}`);
		for (const size of sizes) sequences.push(marker.repeat(size));
	}
	return sequences;
}
function htmlKind(value) {
	if (value.charCodeAt(0) !== 60) return;
	const next = value.charCodeAt(1);
	if (next === 33) {
		const code = value.charCodeAt(2);
		if (code === 45) return 2;
		if (code === 91) return 5;
		if (asciiAlpha(code)) return 4;
		return;
	}
	if (next === 63) return 3;
	const closing = next === 47;
	const start = closing ? 2 : 1;
	let end = start;
	let code = value.charCodeAt(end);
	if (!asciiAlpha(code)) return;
	while (code === 45 || asciiAlphanumeric(code)) code = value.charCodeAt(++end);
	const name = value.slice(start, end).toLowerCase();
	if (!closing && code !== 47 && htmlRawNames.includes(name)) return 1;
	return htmlBlockNames.includes(name) ? 6 : 7;
}
function phrasing(parent, state, info) {
	const children = parent.children;
	const results = [];
	let before = info.before;
	state.indexStack.push(-1);
	let tracker = state.createTracker(info);
	try {
		for (let index = 0; index < children.length; index++) {
			const child = children[index];
			state.indexStack[state.indexStack.length - 1] = index;
			const next = children[index + 1];
			let after = info.after;
			if (next) {
				const handle = state.handlers[next.type];
				const peek = handle?.peek ?? handle;
				after = peek ? firstCharacter(peek(next, parent, state, {
					before: "",
					after: "",
					...tracker.current()
				})) : "";
			}
			const previous = results[results.length - 1];
			if (typeof previous === "string" && (before === "\r" || before === "\n") && child.type === "html" && htmlKind(child.value) !== 7) {
				results[results.length - 1] = previous.replace(/(\r?\n|\r)$/, " ");
				before = " ";
				tracker = state.createTracker(info);
				tracker.move(serialize(results, info.before, info.after));
			}
			const handle = state.handlers[child.type];
			if (handle?.attention) {
				const { construct, markers, sizes, cjkFriendly } = handle.attention(child, state);
				const sequences = attentionSequences(child.type, markers, sizes);
				const sequence = sequences[0];
				const exit = state.enter(construct);
				tracker.move(sequence);
				let inside;
				try {
					inside = phrasing(child, state, {
						...tracker.current(),
						before: sequence,
						after: sequence
					});
					tracker.move(serialize(inside, sequence, sequence));
					tracker.move(sequence);
				} finally {
					exit();
				}
				results.push({
					children: inside,
					sequences,
					cjk: Boolean(cjkFriendly)
				});
				before = lastCharacter(sequence);
			} else {
				const value = state.handle(child, parent, state, {
					...tracker.current(),
					after,
					before
				});
				if (!value) continue;
				tracker.move(value);
				results.push(value);
				before = value;
			}
		}
		return results;
	} finally {
		state.indexStack.pop();
	}
}
function render(items, chosen, before, after) {
	const tokens = [];
	let encodeAfter;
	let previous = before;
	for (let index = 0; index < items.length; index++) {
		const item = items[index];
		if (typeof item === "string") {
			const token = {
				value: item,
				attention: void 0
			};
			if (encodeAfter && encodeAfter === firstCharacter(item)) encode([token], true);
			encodeAfter = void 0;
			tokens.push(token);
			if (token.value) previous = token.value;
			continue;
		}
		const sequence = chosen.get(item) || item.sequences[0];
		const marker = sequence.charAt(0);
		const next = items[index + 1];
		const outsideAfter = next === void 0 ? after : typeof next === "string" ? next : chosen.get(next) || next.sequences[0];
		const inside = render(item.children, chosen, sequence, sequence);
		const head = inside[0]?.value ?? "";
		const open = encodeInfo(previous, head, marker, true, item.cjk);
		if (open.inside) encode(inside, true);
		const close = encodeInfo(inside[inside.length - 1]?.value ?? "", outsideAfter, marker, false, item.cjk);
		if (close.inside) encode(inside, false);
		if (open.outside && lastCharacter(previous) !== "\n" && lastCharacter(previous) !== "\r") encode(tokens, false);
		if (close.outside) encodeAfter = firstCharacter(outsideAfter);
		tokens.push({
			value: sequence,
			attention: item
		}, ...inside, {
			value: sequence,
			attention: item
		});
		previous = sequence;
	}
	return tokens;
}
function serialize(items, before, after) {
	let chosen = /* @__PURE__ */ new Map();
	const initial = render(items, chosen, before, after);
	let tokens = initial;
	let mistake = check(tokens, before, after);
	while (mistake) {
		let improvement;
		for (const attention of mistake.attention) {
			const current = chosen.get(attention) || attention.sequences[0];
			for (const sequence of attention.sequences) {
				if (sequence === current) continue;
				const trial = new Map(chosen);
				trial.set(attention, sequence);
				const rendered = render(items, trial, before, after);
				const next = check(rendered, before, after);
				if (!next || next.index > mistake.index) {
					improvement = {
						chosen: trial,
						tokens: rendered,
						mistake: next
					};
					break;
				}
			}
			if (improvement) break;
		}
		if (!improvement) {
			tokens = initial;
			break;
		}
		chosen = improvement.chosen;
		tokens = improvement.tokens;
		mistake = improvement.mistake;
	}
	return tokens.map((token) => token.value).join("");
}
function containerPhrasing(parent, state, info) {
	return serialize(phrasing(parent, state, info), info.before, info.after);
}
//#endregion
//#region node_modules/mdast-util-to-markdown-cjk-friendly/dist/index.mjs
/** Add CJK-friendly `toMarkdown` handlers for emphasis and strong. */
function cjkFriendlyToMarkdown() {
	return { handlers: {
		...cjkFriendlyPhrasingHandlers,
		emphasis: cjkFriendlyAttention(handle.emphasis),
		strong: cjkFriendlyAttention(handle.strong)
	} };
}
//#endregion
//#region node_modules/remark-cjk-friendly/dist/serializeOnly.js
/**
* Make Markdown emphasis (`**`) in CommonMark more friendly with Chinese, Japanese, and Korean (CJK).
*
* This plugin only supports serializing.
*/
function remarkCjkFriendly$1() {
	const data = this.data();
	(data.toMarkdownExtensions || (data.toMarkdownExtensions = [])).push(cjkFriendlyToMarkdown());
}
__name(remarkCjkFriendly$1, "remarkCjkFriendly");
//#endregion
//#region node_modules/remark-cjk-friendly/dist/bidi.js
/**
* Make Markdown emphasis (`**`) in CommonMark more friendly with Chinese, Japanese, and Korean (CJK).
*
* This plugin supports both parsing and serializing. If you want to support only one of them, it is recommended to import this plugin from `remark-cjk-friendly/parseOnly` or `remark-cjk-friendly/serializeOnly` instead to minimize bundled dependencies.
*/
function remarkCjkFriendly() {
	remarkCjkFriendly$2.call(this);
	remarkCjkFriendly$1.call(this);
}
//#endregion
//#region node_modules/remark-cjk-friendly/dist/index.js
var src_default$1 = remarkCjkFriendly;
//#endregion
//#region node_modules/micromark-extension-cjk-friendly-gfm-strikethrough/dist/strikethrough.js
/**
* Create an extension for `micromark` to enable GFM strikethrough syntax.
*
* @param {Options | null | undefined} [options={}]
*   Configuration.
* @returns {Extension}
*   Extension for `micromark` that can be passed in `extensions`, to
*   enable GFM strikethrough syntax.
*/
function gfmStrikethroughCjkFriendly(options) {
	let single = (options || {}).singleTilde;
	const tokenizer = {
		name: "strikethrough",
		tokenize: tokenizeStrikethrough,
		resolveAll: resolveAllStrikethrough
	};
	if (single === null || single === void 0) single = true;
	return {
		text: { [codes.tilde]: tokenizer },
		insideSpan: { null: [tokenizer] },
		attentionMarkers: { null: [codes.tilde] }
	};
	/**
	* Take events and resolve strikethrough.
	*
	* @type {Resolver}
	*/
	function resolveAllStrikethrough(events, context) {
		let index = -1;
		while (++index < events.length) if (events[index][0] === "enter" && events[index][1].type === "strikethroughSequenceTemporary" && events[index][1]._close) {
			let open = index;
			while (open--) if (events[open][0] === "exit" && events[open][1].type === "strikethroughSequenceTemporary" && events[open][1]._open && events[index][1].end.offset - events[index][1].start.offset === events[open][1].end.offset - events[open][1].start.offset) {
				events[index][1].type = "strikethroughSequence";
				events[open][1].type = "strikethroughSequence";
				const strikethrough = {
					type: "strikethrough",
					start: Object.assign({}, events[open][1].start),
					end: Object.assign({}, events[index][1].end)
				};
				const text = {
					type: "strikethroughText",
					start: Object.assign({}, events[open][1].end),
					end: Object.assign({}, events[index][1].start)
				};
				/** @type {Array<Event>} */
				const nextEvents = [
					[
						"enter",
						strikethrough,
						context
					],
					[
						"enter",
						events[open][1],
						context
					],
					[
						"exit",
						events[open][1],
						context
					],
					[
						"enter",
						text,
						context
					]
				];
				const insideSpan = context.parser.constructs.insideSpan.null;
				if (insideSpan) splice(nextEvents, nextEvents.length, 0, resolveAll(insideSpan, events.slice(open + 1, index), context));
				splice(nextEvents, nextEvents.length, 0, [
					[
						"exit",
						text,
						context
					],
					[
						"enter",
						events[index][1],
						context
					],
					[
						"exit",
						events[index][1],
						context
					],
					[
						"exit",
						strikethrough,
						context
					]
				]);
				splice(events, open - 1, index - open + 3, nextEvents);
				index = open + nextEvents.length - 2;
				break;
			}
		}
		index = -1;
		while (++index < events.length) if (events[index][1].type === "strikethroughSequenceTemporary") events[index][1].type = types.data;
		return events;
	}
	/**
	* @type {Tokenizer}
	*/
	function tokenizeStrikethrough(effects, ok$1$1, nok) {
		const { now, sliceSerialize, previous: tentativePrevious } = this;
		const previous = isCodeLowSurrogate(tentativePrevious) ? tryGetGenuinePreviousCode(tentativePrevious, now(), sliceSerialize) : tentativePrevious;
		const before = classifyCharacter$1(previous);
		const twoPrevious = new TwoPreviousCode(previous, now(), sliceSerialize);
		const beforePrimary = classifyPrecedingCharacter(before, twoPrevious.value.bind(twoPrevious), previous);
		const events = this.events;
		let size = 0;
		return start;
		function start(code) {
			codes.tilde;
			if (previous === codes.tilde && events[events.length - 1][1].type !== types.characterEscape) return nok(code);
			effects.enter("strikethroughSequenceTemporary");
			return more(code);
		}
		/** @type {State} */
		function more(code) {
			const before$1 = classifyCharacter$1(previous);
			if (code === codes.tilde) {
				if (size > 1) return nok(code);
				effects.consume(code);
				size++;
				return more;
			}
			if (size < 2 && !single) return nok(code);
			const token = effects.exit("strikethroughSequenceTemporary");
			const after = classifyCharacter$1(isCodeHighSurrogate(code) ? tryGetGenuineNextCode(code, now(), sliceSerialize) : code);
			const beforeSpaceOrNonCjkPunctuation = isNonCjkPunctuation(beforePrimary) || isUnicodeWhitespace(beforePrimary);
			const afterSpaceOrNonCjkPunctuation = isNonCjkPunctuation(after) || isUnicodeWhitespace(after);
			const beforeCjkOrIvs = isCjk(beforePrimary) || isIvs(before$1);
			token._open = !afterSpaceOrNonCjkPunctuation || after === constants.attentionSideAfter && (beforeSpaceOrNonCjkPunctuation || beforeCjkOrIvs);
			token._close = !beforeSpaceOrNonCjkPunctuation || before$1 === constants.attentionSideAfter && (afterSpaceOrNonCjkPunctuation || isCjk(after));
			return ok$1$1(code);
		}
	}
}
//#endregion
//#region node_modules/remark-cjk-friendly-gfm-strikethrough/dist/parseOnly.js
/**
* Make Markdown strikethrough (`~~`) in GFM more friendly with Chinese, Japanese, and Korean (CJK).
*
* This plugin only supports parsing. If you have been using `remark-cjk-friendly-gfm-strikethrough` since v2.0.1 or earlier, it is recommended to migrate to this to minimize bundled dependencies.
*/
function remarkCjkFriendlyGfmStrikethrough$1(options) {
	const data = this.data();
	(data.micromarkExtensions || (data.micromarkExtensions = [])).push(gfmStrikethroughCjkFriendly(options));
}
__name(remarkCjkFriendlyGfmStrikethrough$1, "remarkCjkFriendlyGfmStrikethrough");
//#endregion
//#region node_modules/mdast-util-gfm-strikethrough/lib/index.js
/**
* @import {Delete} from 'mdast'
* @import {
*   CompileContext,
*   Extension as FromMarkdownExtension,
*   Handle as FromMarkdownHandle
* } from 'mdast-util-from-markdown'
* @import {
*   Attention,
*   ConstructName,
*   Handle as ToMarkdownHandle,
*   Options as ToMarkdownExtension
* } from 'mdast-util-to-markdown'
*/
/**
* List of constructs that occur in phrasing (paragraphs, headings), but cannot
* contain strikethrough.
* So they sort of cancel each other out.
* Note: could use a better name.
*
* Note: keep in sync with: <https://github.com/syntax-tree/mdast-util-to-markdown/blob/8ce8dbf/lib/unsafe.js#L14>
*
* @type {Array<ConstructName>}
*/
var constructsWithoutStrikethrough = [
	"autolink",
	"destinationLiteral",
	"destinationRaw",
	"reference",
	"titleQuote",
	"titleApostrophe"
];
handleDelete.attention = attentionDelete;
handleDelete.peek = peekDelete;
/**
* Create an extension for `mdast-util-from-markdown` to enable GFM
* strikethrough in markdown.
*
* @returns {FromMarkdownExtension}
*   Extension for `mdast-util-from-markdown` to enable GFM strikethrough.
*/
function gfmStrikethroughFromMarkdown() {
	return {
		canContainEols: ["delete"],
		enter: { strikethrough: enterStrikethrough },
		exit: { strikethrough: exitStrikethrough }
	};
}
/**
* Create an extension for `mdast-util-to-markdown` to enable GFM
* strikethrough in markdown.
*
* @returns {ToMarkdownExtension}
*   Extension for `mdast-util-to-markdown` to enable GFM strikethrough.
*/
function gfmStrikethroughToMarkdown() {
	return {
		handlers: { delete: handleDelete },
		unsafe: [{
			character: "~",
			inConstruct: "phrasing",
			notInConstruct: constructsWithoutStrikethrough
		}]
	};
}
/**
* Enter strikethrough.
*
* @this {CompileContext}
* @type {FromMarkdownHandle}
*/
function enterStrikethrough(token) {
	this.enter({
		type: "delete",
		children: [],
		position: void 0
	}, token);
}
/**
* Exit strikethrough.
*
* @this {CompileContext}
* @type {FromMarkdownHandle}
*/
function exitStrikethrough(token) {
	this.exit(token);
}
/**
* Serialize a delete node.
*
* @type {ToMarkdownHandle}
* @param {Delete} node
*   Node to serialize.
*/
function handleDelete(node, _, state, info) {
	const tracker = state.createTracker(info);
	const sequence = state.stack.includes("strikethrough") ? "~" : "~~";
	const exit = state.enter("strikethrough");
	let value = tracker.move(sequence);
	value += state.containerPhrasing(node, {
		...tracker.current(),
		before: value,
		after: "~"
	});
	value += tracker.move(sequence);
	exit();
	return value;
}
/**
* Serialize a delete node as attention.
*
* @type {Attention}
*/
function attentionDelete() {
	return {
		construct: "strikethrough",
		markers: ["~"],
		sizes: [2, 1]
	};
}
/**
* Peek the first character of a delete node.
*
* @type {ToMarkdownHandle}
*/
function peekDelete() {
	return "~";
}
//#endregion
//#region node_modules/mdast-util-to-markdown-cjk-friendly-gfm-strikethrough/dist/index.mjs
/** Add CJK-friendly GFM strikethrough serialization. */
function cjkFriendlyGfmStrikethroughToMarkdown() {
	const extension = gfmStrikethroughToMarkdown();
	const handleDelete = extension.handlers?.delete;
	if (!handleDelete) throw new Error("Expected the GFM strikethrough handler");
	return {
		...extension,
		handlers: {
			...cjkFriendlyPhrasingHandlers,
			delete: cjkFriendlyAttention(handleDelete)
		}
	};
}
//#endregion
//#region node_modules/remark-cjk-friendly-gfm-strikethrough/dist/serializeOnly.js
/**
* Make Markdown strikethrough (`~~`) in GFM more friendly with Chinese, Japanese, and Korean (CJK).
*
* This plugin only supports serializing.
*/
function remarkCjkFriendlyGfmStrikethrough() {
	const data = this.data();
	(data.toMarkdownExtensions || (data.toMarkdownExtensions = [])).push(cjkFriendlyGfmStrikethroughToMarkdown());
}
//#endregion
//#region node_modules/remark-cjk-friendly-gfm-strikethrough/dist/bidi.js
/**
* Make Markdown strikethrough (`~~`) in GFM more friendly with Chinese, Japanese, and Korean (CJK)
*
* This plugin supports both parsing and serializing. If you want to support only one of them, it is recommended to import this plugin from `remark-cjk-friendly-gfm-strikethrough/parseOnly` or `remark-cjk-friendly-gfm-strikethrough/serializeOnly` instead to minimize bundled dependencies.
*/
function remarkGfmStrikethroughCjkFriendly(options) {
	remarkCjkFriendlyGfmStrikethrough$1.call(this, options);
	remarkCjkFriendlyGfmStrikethrough.call(this);
}
//#endregion
//#region node_modules/remark-cjk-friendly-gfm-strikethrough/dist/index.js
var src_default = remarkGfmStrikethroughCjkFriendly;
//#endregion
//#region node_modules/@streamdown/cjk/dist/index.js
var a = /* @__PURE__ */ new Set([
	"。",
	"．",
	"，",
	"、",
	"？",
	"！",
	"：",
	"；",
	"（",
	"）",
	"【",
	"】",
	"「",
	"」",
	"『",
	"』",
	"〈",
	"〉",
	"《",
	"》"
]);
var c = /^(https?:\/\/|mailto:|www\.)/i;
var P = (n) => {
	if (n.children.length !== 1) return false;
	let r = n.children[0];
	return r.type === "text" && r.value === n.url;
};
var d = (n) => {
	let r = 0;
	for (let t of n) {
		if (a.has(t)) return r;
		r += t.length;
	}
	return null;
};
var y = (n, r) => ({
	...r,
	url: n,
	children: [{
		type: "text",
		value: n
	}]
});
var b = (n) => ({
	type: "text",
	value: n
});
var u;
var j = (u = gfmAutolinkLiteralFromMarkdown().transforms) != null ? u : [];
var C = (n) => {
	let r = [];
	let t = (e) => {
		var s;
		if (!e) return;
		let o = {
			type: "paragraph",
			children: [b(e)]
		};
		if (((s = c.exec(e)) == null ? void 0 : s[0]) !== e) {
			let g = {
				type: "root",
				children: [o]
			};
			for (let f of j) f(g);
		}
		r.push(...o.children);
	};
	let l = 0;
	let i = 0;
	for (let e of n) a.has(e) && (t(n.slice(l, i)), t(e), l = i + e.length), i += e.length;
	return t(n.slice(l)), r;
};
var T = () => (n) => {
	visit(n, "link", (r, t, l) => {
		if (!l || typeof t != "number" || !P(r) || !c.test(r.url)) return;
		let i = d(r.url);
		if (i === null || i === 0) return;
		let e = [y(r.url.slice(0, i), r), ...C(r.url.slice(i))];
		return l.children.splice(t, 1, ...e), t + e.length;
	});
};
function x() {
	let n = [src_default$1];
	let r = [T, src_default];
	return {
		name: "cjk",
		type: "cjk",
		remarkPluginsBefore: n,
		remarkPluginsAfter: r,
		remarkPlugins: [...n, ...r]
	};
}
var B = x();
//#endregion
export { ok$1 as A, asciiHexDigit as C, markdownSpace as D, markdownLineEndingOrSpace as E, unicodePunctuation$1 as O, asciiDigit as S, markdownLineEnding as T, visitParents as _, toString as a, asciiAtext as b, htmlRawNames as c, resolveAll as d, push as f, SKIP as g, gfmAutolinkLiteralToMarkdown as h, handle as i, unicodeWhitespace$1 as k, classifyCharacter as l, gfmAutolinkLiteralFromMarkdown as m, gfmStrikethroughFromMarkdown as n, visit as o, splice as p, gfmStrikethroughToMarkdown as r, htmlBlockNames as s, B as t, longestStreak as u, asciiAlpha as v, asciiPunctuation as w, asciiControl as x, asciiAlphanumeric as y };
