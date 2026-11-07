import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { r as useSite } from "./SiteContext-Br0kF93Q.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/BrandMark-s4GFHX6D.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var yichang_logo_flat_default = "/assets/yichang-logo-flat-wnEeC40P.png";
var huchang_logo_flat_default = "/assets/huchang-logo-flat-fUbwWlyH.png";
var APP_ICON_SHAPE = "M48 24 L47.95 33.73 L47.79 36.8 L47.52 39 L47.15 40.75 L46.66 42.19 L46.05 43.4 L45.31 44.44 L44.44 45.31 L43.4 46.05 L42.19 46.66 L40.75 47.15 L39 47.52 L36.8 47.79 L33.73 47.95 L24 48 L14.27 47.95 L11.2 47.79 L9 47.52 L7.25 47.15 L5.81 46.66 L4.6 46.05 L3.56 45.31 L2.69 44.44 L1.95 43.4 L1.34 42.19 L0.85 40.75 L0.48 39 L0.21 36.8 L0.05 33.73 L0 24 L0.05 14.27 L0.21 11.2 L0.48 9 L0.85 7.25 L1.34 5.81 L1.95 4.6 L2.69 3.56 L3.56 2.69 L4.6 1.95 L5.81 1.34 L7.25 0.85 L9 0.48 L11.2 0.21 L14.27 0.05 L24 0 L33.73 0.05 L36.8 0.21 L39 0.48 L40.75 0.85 L42.19 1.34 L43.4 1.95 L44.44 2.69 L45.31 3.56 L46.05 4.6 L46.66 5.81 L47.15 7.25 L47.52 9 L47.79 11.2 L47.95 14.27Z";
function BrandIcon({ brand, chinese, size, label }) {
	const id = `app-icon-${(0, import_react.useId)().replace(/:/g, "")}`;
	const image = chinese && brand === "challenged" ? yichang_logo_flat_default : chinese && brand === "carecnc" ? huchang_logo_flat_default : null;
	const research = brand === "researcher" || brand === "esm_survey";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		"data-inspector-id": "components/BrandIcon/BrandIcon/svg/0",
		"data-inspector-source": "components/BrandIcon.tsx:12:5:7d3d47139d2de9742dd2a37109ea992a5ca6bd0af1e7aa1fe6d6dfed2efa710a:1",
		viewBox: "0 0 48 48",
		width: size,
		height: size,
		role: "img",
		"aria-label": label,
		className: "shrink-0",
		"data-app-logo": brand,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", {
			"data-inspector-id": "components/BrandIcon/BrandIcon/defs/0",
			"data-inspector-source": "components/BrandIcon.tsx:13:7:3ced94bbcb87dde493662ad307b5c94a4ba06f90fe3f88a1523eb360248b8623:1",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("clipPath", {
				"data-inspector-id": "components/BrandIcon/BrandIcon/clipPath/0",
				"data-inspector-source": "components/BrandIcon.tsx:13:13:3ced94bbcb87dde493662ad307b5c94a4ba06f90fe3f88a1523eb360248b8623:1",
				id,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					"data-inspector-id": "components/BrandIcon/BrandIcon/path/0",
					"data-inspector-source": "components/BrandIcon.tsx:13:31:3ced94bbcb87dde493662ad307b5c94a4ba06f90fe3f88a1523eb360248b8623:1",
					d: APP_ICON_SHAPE
				})
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
			"data-inspector-id": "components/BrandIcon/BrandIcon/g/0",
			"data-inspector-source": "components/BrandIcon.tsx:14:7:109c4bd34dee8e7ad3ad11a2b3b0f80c0ff598434616e37e5c4e12889a44ef4f:1",
			clipPath: `url(#${id})`,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				"data-inspector-id": "components/BrandIcon/BrandIcon/path/1",
				"data-inspector-source": "components/BrandIcon.tsx:15:9:e2afdc22bd90abf5bd59a96d160c7a241f600046afb46a66ae0a5ea2efb4178c:1",
				d: APP_ICON_SHAPE,
				className: research ? "fill-foreground" : "fill-primary"
			}), image ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("image", {
				"data-inspector-id": "components/BrandIcon/BrandIcon/image/0",
				"data-inspector-source": "components/BrandIcon.tsx:16:18:c46c7d62564aaeec0b13b1038c800e44ff53c123f6e995f7991de3ca7995df9f:1",
				href: image,
				width: "48",
				height: "48"
			}) : brand === "challenged" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				"data-inspector-id": "components/BrandIcon/BrandIcon/path/2",
				"data-inspector-source": "components/BrandIcon.tsx:17:11:e5a1e6debcfede17f5ec7db339edf8c00c719fdf873e5b92aa077749518d725e:1",
				className: "fill-primary-foreground",
				fillRule: "evenodd",
				d: "M20.5 14H16C9.9 14 7 18.2 7 24S9.9 34 16 34H31C37.2 34 41 30.2 41 24S37.2 14 31 14H25.5V29H16C13.2 29 12 26.9 12 24S13.2 19 16 19H20.5V14ZM30.5 19H31C34.2 19 36 20.8 36 24S34.2 29 31 29H30.5V19Z"
			}) : brand === "notchsafety" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
				"data-inspector-id": "components/BrandIcon/BrandIcon/g/1",
				"data-inspector-source": "components/BrandIcon.tsx:19:11:05df6811cd9fd87d6571290c7b1296fc2b594129d53efd5602f567b3c2d413c5:1",
				className: "fill-primary-foreground",
				transform: "translate(8 8) scale(.666667)",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					"data-inspector-id": "components/BrandIcon/BrandIcon/path/3",
					"data-inspector-source": "components/BrandIcon.tsx:20:13:ba7b725bfda2e5458e48c6fa67bbd5f6009898c61ccb0ebd185264ddf6ce5c08:1",
					fillRule: "evenodd",
					d: "M24 3 41 9v14.5C41 34.2 33.8 42.4 24 45 14.2 42.4 7 34.2 7 23.5V9L24 3ZM24 13.5c-4.1 0-7.4 3.3-7.4 7.4 0 5.2 5.7 11 7 12.2.2.2.6.2.8 0 1.3-1.2 7-7 7-12.2 0-4.1-3.3-7.4-7.4-7.4Zm0 10.4a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"
				})
			}) : research ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
				"data-inspector-id": "components/BrandIcon/BrandIcon/g/2",
				"data-inspector-source": "components/BrandIcon.tsx:23:11:ef93784991ee49e1c287e7dd52ff9097d2fae36706c0374fd77d5a8d4de7888e:1",
				className: "fill-background",
				children: [
					12,
					22,
					30,
					20,
					11
				].map((height, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					"data-inspector-id": "components/BrandIcon/BrandIcon/rect/0",
					"data-inspector-source": "components/BrandIcon.tsx:23:87:ef93784991ee49e1c287e7dd52ff9097d2fae36706c0374fd77d5a8d4de7888e:1",
					x: 10 + index * 6,
					y: (48 - height) / 2,
					width: "4",
					height,
					rx: "2"
				}, index))
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
				"data-inspector-id": "components/BrandIcon/BrandIcon/g/3",
				"data-inspector-source": "components/BrandIcon.tsx:25:11:8b6d96a08dd43f31c7d6f6081ee93b07ab40c602b918d3ef50fcbba0fa689efe:1",
				className: "fill-primary-foreground font-bold",
				fontFamily: "Inter, sans-serif",
				textAnchor: "middle",
				fontSize: "13",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					"data-inspector-id": "components/BrandIcon/BrandIcon/text/0",
					"data-inspector-source": "components/BrandIcon.tsx:25:125:8b6d96a08dd43f31c7d6f6081ee93b07ab40c602b918d3ef50fcbba0fa689efe:0",
					x: "24",
					y: "23",
					children: "Care"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					"data-inspector-id": "components/BrandIcon/BrandIcon/text/1",
					"data-inspector-source": "components/BrandIcon.tsx:25:156:8b6d96a08dd43f31c7d6f6081ee93b07ab40c602b918d3ef50fcbba0fa689efe:0",
					x: "24",
					y: "36",
					children: "CNC"
				})]
			})]
		})]
	});
}
/**
* Single source of truth for the brand logo.
* Used by the header, the mobile drawer and the auth screen so the mark is
* always identical across surfaces.
*/
function BrandMark({ size = 48, showWordmark = false, className = "" }) {
	const site = useSite();
	const { i18n } = useTranslation();
	const isChinese = i18n.language?.startsWith("zh");
	const isCareCNC = site.id === "carecnc";
	const brand = site.family === "challenged" || site.brandSlug.startsWith("challenged") ? "challenged" : site.id;
	const wordmark = isCareCNC ? isChinese ? "护畅" : "CareCNC" : brand === "challenged" ? isChinese ? "忆畅" : "ChallengeD" : site.family === "notchsafety" && isChinese ? "诺驰安全" : site.family === "notchsafety" ? "Notch Safety" : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		"data-inspector-id": "components/BrandMark/BrandMark/span/0",
		"data-inspector-source": "components/BrandMark.tsx:38:5:65ef8ca3a0aa21e9c75b2627e145c64c4abf6bcc013ee417144b84ebf1ecdea5:1",
		className: `flex items-center gap-2 ${className}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandIcon, {
			"data-inspector-id": "components/BrandMark/BrandMark/BrandIcon/0",
			"data-inspector-source": "components/BrandMark.tsx:39:7:b4edbd070ef32c5955aa5b26c7349ad6a52a5910d2bf5edaa05ecf4369ecb4f1:1",
			brand,
			chinese: Boolean(isChinese),
			size,
			label: wordmark || site.name
		}), showWordmark && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			"data-inspector-id": "components/BrandMark/BrandMark/span/1",
			"data-inspector-source": "components/BrandMark.tsx:41:9:39687956cb9367ea7e4a67990d91e0ba084f3644b2d80135ccb309cecce828aa:1",
			className: "font-bold text-lg",
			children: wordmark ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				"data-inspector-id": "components/BrandMark/BrandMark/span/2",
				"data-inspector-source": "components/BrandMark.tsx:43:13:e120d681171a4c3d565c5ec5e128c576934b9de647f9ccc2726a827cadee8b21:1",
				className: "text-foreground",
				children: wordmark
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				"data-inspector-id": "components/BrandMark/BrandMark/span/3",
				"data-inspector-source": "components/BrandMark.tsx:46:15:8978f9374ee71fb9b33a174d406b892568bb327fd19308264bb82a7516e11682:1",
				className: "text-primary",
				children: site.logoText
			}), site.logoAccent && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				"data-inspector-id": "components/BrandMark/BrandMark/span/4",
				"data-inspector-source": "components/BrandMark.tsx:47:35:992f46166945429a77278a515532fb359f269e2fa12daf804682d0c087a2a582:1",
				className: "text-muted-foreground",
				children: site.logoAccent
			})] })
		})]
	});
}
//#endregion
export { BrandMark as t };
