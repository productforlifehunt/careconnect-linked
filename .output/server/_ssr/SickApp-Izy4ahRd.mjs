import "../_runtime.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/SickApp-Izy4ahRd.js
var import_jsx_runtime = require_jsx_runtime();
var sick_notice_jpg_asset_default = {
	version: 1,
	asset_id: "14eb21d2-0504-4cfc-8d0b-2a48b9471220",
	project_id: "c85459d8-8acf-4fc5-a8e4-d5448f6ae818",
	url: "/__l5e/assets-v1/14eb21d2-0504-4cfc-8d0b-2a48b9471220/sick-notice.jpg",
	r2_key: "a/v1/c85459d8-8acf-4fc5-a8e4-d5448f6ae818/14eb21d2-0504-4cfc-8d0b-2a48b9471220/sick-notice.jpg",
	original_filename: "sick-notice.jpg",
	size: 132634,
	content_type: "image/jpeg",
	created_at: "2026-10-22T07:49:07Z"
};
/**
* Sick-leave notice micro site (`/?__site=sick`).
*
* One picture and nothing else: no words, no header, no footer, no care-app
* brand and no navigation. The picture is deliberately hard to save by
* accident — right-click, drag-and-drop, text selection and the mobile
* long-press callout are all intercepted by a transparent layer, and the page
* offers no download control. A determined visitor can still screenshot the
* screen or open the browser's network panel: a browser cannot display a
* picture without the browser having received it, so this deters saving, it
* does not make extraction impossible.
*/
function SickApp() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-id": "pages/sick/SickApp/SickApp/div/0",
		"data-inspector-source": "pages/sick/SickApp.tsx:17:5:87864ea657de9b8df04eee17f170dc074229b35a52d6b8e6ccf42a09e690dd2b:1",
		className: "relative flex min-h-dvh w-full select-none items-center justify-center overflow-hidden bg-background",
		onContextMenu: (e) => e.preventDefault(),
		onDragStart: (e) => e.preventDefault(),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			"data-inspector-id": "pages/sick/SickApp/SickApp/img/0",
			"data-inspector-source": "pages/sick/SickApp.tsx:22:7:9695558b4ae3ed7d3463fdf3d6f66de53882c42565bf5d3df622a29647e07f0e:1",
			src: sick_notice_jpg_asset_default.url,
			alt: "Sick leave notice",
			draggable: false,
			className: "sick-notice-img pointer-events-none h-auto max-h-dvh w-auto max-w-full select-none object-contain"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"data-inspector-id": "pages/sick/SickApp/SickApp/div/1",
			"data-inspector-source": "pages/sick/SickApp.tsx:33:7:ef301a2f7f06979da0deab49e3b3d3b6b5bcd961b812b683a79d163200eb0a17:1",
			"aria-hidden": "true",
			className: "absolute inset-0 z-10",
			onContextMenu: (e) => e.preventDefault(),
			onDragStart: (e) => e.preventDefault()
		})]
	});
}
//#endregion
export { SickApp as default };
