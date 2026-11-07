import "../_runtime.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/xianyu-listings-DZPsZB8e.js
var import_jsx_runtime = require_jsx_runtime();
var cn1_default = "/assets/cn1-PZWY1OmI.png";
var cn2_default = "/assets/cn2-CKdamN2Z.png";
var cn3_default = "/assets/cn3-BzylK79e.png";
var en1_default = "/assets/en1-CbX4xEBl.png";
var en2_default = "/assets/en2-t5qZdv-I.png";
var en3_default = "/assets/en3-CRLXIw6s.png";
var Row = ({ images, label }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
	"data-inspector-source": "pages/XianyuListings.tsx:9:3:b9c60166c318d7be6a296cad5b544b5e60b57a4a140e4c202f0075c06fa8c48c:1",
	className: "space-y-4",
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
		"data-inspector-source": "pages/XianyuListings.tsx:10:5:6fea21e7d76b910411d0f55dee2d03a5485791ec0a621d644f6f260a06e7332c:1",
		className: "text-2xl font-semibold tracking-tight",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-inspector-source": "pages/XianyuListings.tsx:11:5:80cd6cd34584fa0d52ab3b093e5a2123f350ea229107b8f65624eb2311566874:1",
		className: "grid grid-cols-1 sm:grid-cols-3 gap-4",
		children: images.map((src, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"data-inspector-source": "pages/XianyuListings.tsx:13:9:00bae1692957e1022daa639ea3433aae2c2234ac6674d1c6517aedfc1f36bf19:1",
			className: "rounded-2xl overflow-hidden border border-border bg-card shadow-xs",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				"data-inspector-source": "pages/XianyuListings.tsx:17:11:a724e2fba7dd465d57426e1f4bc1dae52bd4d6ae2845366647c3d078bf22ed63:1",
				src,
				alt: `${label} screenshot ${i + 1}`,
				className: "w-full h-auto block",
				loading: "lazy"
			})
		}, i))
	})]
});
function XianyuListings() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		"data-inspector-source": "pages/XianyuListings.tsx:31:5:37d375734f031473fabb96c0b65948fe029a69c7e25e094188ff202b937105ed:1",
		className: "max-w-6xl mx-auto px-4 py-10 space-y-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				"data-inspector-source": "pages/XianyuListings.tsx:32:7:546153273b80ed6f18b3bd21946d9af797bd5ae4ab2d2bd785a8616b16e6b12c:1",
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					"data-inspector-source": "pages/XianyuListings.tsx:33:9:ee0a095636e259f9b213ed71f02a2a17e096d4c14ed1ffe522747428d538768b:1",
					className: "text-xl sm:text-2xl font-bold text-foreground tracking-tight",
					children: "Xianyu Listings — Original & English Translation"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-source": "pages/XianyuListings.tsx:36:9:9b04cb91e7c6401c2685355ec8db9bbf8af2912043b4bb02ec227b3dc942b4ab:1",
					className: "text-muted-foreground",
					children: "Top row: original Chinese screenshots. Bottom row: same screenshots with all text translated to English."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
				images: [
					cn1_default,
					cn2_default,
					cn3_default
				],
				label: "Original (Chinese)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
				images: [
					en1_default,
					en2_default,
					en3_default
				],
				label: "Translated (English)"
			})
		]
	});
}
var SplitComponent = XianyuListings;
//#endregion
export { SplitComponent as component };
