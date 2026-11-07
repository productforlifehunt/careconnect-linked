import "../_runtime.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/xianyu-listings-CDtx5Afd.js
var import_jsx_runtime = require_jsx_runtime();
var cn1_default = "/assets/cn1-PZWY1OmI.png";
var cn2_default = "/assets/cn2-CKdamN2Z.png";
var cn3_default = "/assets/cn3-BzylK79e.png";
var en1_default = "/assets/en1-CbX4xEBl.png";
var en2_default = "/assets/en2-t5qZdv-I.png";
var en3_default = "/assets/en3-CRLXIw6s.png";
var Row = ({ images, label }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
	className: "space-y-4",
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
		"data-inspector-id": "pages/XianyuListings/Row/h2/0",
		"data-inspector-source": "pages/XianyuListings.tsx:10:5:6fea21e7d76b910411d0f55dee2d03a5485791ec0a621d644f6f260a06e7332c:1",
		className: "text-2xl font-semibold tracking-tight",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-inspector-id": "pages/XianyuListings/Row/div/0",
		"data-inspector-source": "pages/XianyuListings.tsx:11:5:80cd6cd34584fa0d52ab3b093e5a2123f350ea229107b8f65624eb2311566874:1",
		className: "grid grid-cols-1 sm:grid-cols-3 gap-4",
		children: images.map((src, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"data-inspector-id": "pages/XianyuListings/Row/div/1",
			"data-inspector-source": "pages/XianyuListings.tsx:13:9:00bae1692957e1022daa639ea3433aae2c2234ac6674d1c6517aedfc1f36bf19:1",
			className: "rounded-2xl overflow-hidden border border-border bg-card shadow-xs",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				"data-inspector-id": "pages/XianyuListings/Row/img/0",
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
		className: "max-w-6xl mx-auto px-4 py-10 space-y-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl sm:text-2xl font-bold text-foreground tracking-tight",
					children: "Xianyu Listings — Original & English Translation"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground",
					children: "Top row: original Chinese screenshots. Bottom row: same screenshots with all text translated to English."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
				"data-inspector-id": "pages/XianyuListings/XianyuListings/Row/0",
				"data-inspector-source": "pages/XianyuListings.tsx:42:7:3c6d264ae593dc37ae1f22edbb0355779a1d58a07cc7b42963fec1c55d71b68f:1",
				images: [
					cn1_default,
					cn2_default,
					cn3_default
				],
				label: "Original (Chinese)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
				"data-inspector-id": "pages/XianyuListings/XianyuListings/Row/1",
				"data-inspector-source": "pages/XianyuListings.tsx:43:7:adeddcb4835179c132a2f3b2f6d4afc66009fdf74df54e84d9e3a8907a441815:1",
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
