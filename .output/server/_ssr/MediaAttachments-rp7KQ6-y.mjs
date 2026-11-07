import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-xLpexZsM.mjs";
import { jt as LoaderCircle, n as X, nn as FileText, p as Upload } from "../_libs/lucide-react.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { a as useToast } from "./use-toast-D8d_MLWg.mjs";
import { r as uploadWPMediaBatch, t as resolveWPMedia } from "./wp-media-DqMZc2j7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/MediaAttachments-rp7KQ6-y.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Multi-file picker backed by the WordPress media library.
* Uploads immediately and hands back the media IDs, which JetEngine
* Gallery fields store as a comma-separated list.
*/
function MediaAttachments({ value, onChange, accept = "image/*", label, disabled }) {
	const { i18n } = useTranslation();
	const isCN = i18n.language?.startsWith("zh");
	const Z = (cn, en) => isCN ? cn : en;
	const { toast } = useToast();
	const inputRef = (0, import_react.useRef)(null);
	const [items, setItems] = (0, import_react.useState)([]);
	const [uploading, setUploading] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		let alive = true;
		if (value.length === 0) {
			setItems([]);
			return;
		}
		resolveWPMedia(value).then((res) => {
			if (alive) setItems(res);
		});
		return () => {
			alive = false;
		};
	}, [value.join(",")]);
	const handleFiles = async (files) => {
		if (!files || files.length === 0) return;
		setUploading(true);
		try {
			const uploaded = await uploadWPMediaBatch(Array.from(files));
			onChange([...value, ...uploaded.map((u) => u.id)]);
		} catch (e) {
			toast({
				title: Z("上传失败", "Upload failed"),
				description: e?.message,
				variant: "destructive"
			});
		} finally {
			setUploading(false);
			if (inputRef.current) inputRef.current.value = "";
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "components/shared/MediaAttachments.tsx:54:5:6e2dc857fb79ecfacbaab047a0b28433be317d5176c05ec9184b6ea69b17bc6d:1",
		className: "space-y-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-inspector-source": "components/shared/MediaAttachments.tsx:55:7:dccebd96e52ebef85654c30d1426c65b69bfb3c87def3969adc422a297fcddd9:1",
			className: "flex items-center gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					size: "sm",
					variant: "outline",
					disabled: disabled || uploading,
					onClick: () => inputRef.current?.click(),
					children: [uploading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 mr-1.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-3.5 w-3.5 mr-1.5" }), label || Z("上传文件", "Upload files")]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					"data-inspector-source": "components/shared/MediaAttachments.tsx:60:9:d4faf263943ffd34f513714e085ff51c39421d19084df88189a7c8b06b760448:1",
					className: "text-xs text-muted-foreground",
					children: value.length > 0 ? Z(`已选 ${value.length} 个`, `${value.length} selected`) : Z("可多选", "Multiple allowed")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					"data-inspector-source": "components/shared/MediaAttachments.tsx:63:9:927787ecaa06683710be33d023c4a5f613d24c2db2976fe13869a505d3669b02:1",
					ref: inputRef,
					type: "file",
					multiple: true,
					accept,
					className: "hidden",
					onChange: (e) => handleFiles(e.target.files)
				})
			]
		}), items.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"data-inspector-source": "components/shared/MediaAttachments.tsx:67:9:f697fc11a1246dd6ca34e8fc22a710448faf7cef63f0c56a97f8d929a3ca6a39:1",
			className: "flex flex-wrap gap-2",
			children: items.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/shared/MediaAttachments.tsx:69:13:db8b1aef10556d462b5101fcc6fb5bd6a5734caa4d31fe36518959887ad757a7:1",
				className: "relative rounded-md border overflow-hidden bg-muted/40",
				children: [m.isImage ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					"data-inspector-source": "components/shared/MediaAttachments.tsx:71:17:44c31714639c033b471af6dad7ab29e7ba54442ee77eacb4797c51b2300cc366:1",
					src: m.url,
					alt: m.name,
					className: "h-16 w-16 object-cover"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					"data-inspector-source": "components/shared/MediaAttachments.tsx:73:17:34252842665e2f73db0bd43d60f8f5f87c1a71f1beb32700984738d3cb85c6d4:1",
					href: m.url,
					target: "_blank",
					rel: "noopener",
					className: "h-16 w-24 flex flex-col items-center justify-center gap-1 px-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-5 w-5 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"data-inspector-source": "components/shared/MediaAttachments.tsx:75:19:1b4b02ccceee9589bb154b75e1cc21dfb6d94e3beb103bac4df9d58963e17cfc:1",
						className: "text-[10px] text-muted-foreground truncate w-full text-center",
						children: m.name
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					"data-inspector-source": "components/shared/MediaAttachments.tsx:78:15:d28290e03c35730f2c3304a925423562ff2093be356c903abb6ad4b64f783fba:1",
					type: "button",
					className: "absolute top-0.5 right-0.5 rounded-full bg-background/80 p-0.5 text-destructive",
					onClick: () => onChange(value.filter((id) => id !== m.id)),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3 w-3" })
				})]
			}, m.id))
		})]
	});
}
/** Read-only thumbnail strip for stored media IDs. */
function MediaAttachmentList({ ids }) {
	const [items, setItems] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		let alive = true;
		if (!ids || ids.length === 0) {
			setItems([]);
			return;
		}
		resolveWPMedia(ids).then((res) => {
			if (alive) setItems(res);
		});
		return () => {
			alive = false;
		};
	}, [(ids || []).join(",")]);
	if (items.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-inspector-source": "components/shared/MediaAttachments.tsx:105:5:4eca95b7090068a0cc4d02ffdbeb1811119b27cf07d2f7fa09da7fd1f51bb2c8:1",
		className: "flex flex-wrap gap-1.5 mt-1.5",
		children: items.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
			"data-inspector-source": "components/shared/MediaAttachments.tsx:107:9:7c0c787cb0946c7f50d7595215ed75a10c08484d87e80fcb90f66be254cf1b8d:1",
			href: m.url,
			target: "_blank",
			rel: "noopener",
			className: "rounded-sm border overflow-hidden",
			children: m.isImage ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				"data-inspector-source": "components/shared/MediaAttachments.tsx:109:13:1dddad6210d10eedeea20284fd9daebdab5636735333acc536e90a4fbebc8dca:1",
				src: m.url,
				alt: m.name,
				className: "h-12 w-12 object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				"data-inspector-source": "components/shared/MediaAttachments.tsx:111:13:4d3246f145bf2db20bdfa36d4fd7bce1ef31563b2ff2e32c1b5e91f243e518de:1",
				className: "h-12 px-2 flex items-center gap-1 text-[10px] text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3.5 w-3.5" }), m.name]
			})
		}, m.id))
	});
}
//#endregion
export { MediaAttachments as n, MediaAttachmentList as t };
